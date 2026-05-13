"""
weighted_merge_hf_models.py
Fusiona varios modelos HF compatibles mediante promedio ponderado de pesos.

Uso:
  python scripts/weighted_merge_hf_models.py \
    --models models/hf/modelo-a models/hf/modelo-b models/hf/modelo-c \
    --weights 0.5 0.3 0.2 \
    --output_dir models/corvinus-unico-merged \
    --dtype float16

Notas:
- Los modelos deben tener arquitectura compatible (mismos nombres y shapes de tensores).
- Este merge es un promedio ponderado directo de parametros.
"""

import argparse
import gc
import os
import sys
from typing import List

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer


DTYPE_MAP = {
    "float16": torch.float16,
    "bfloat16": torch.bfloat16,
    "float32": torch.float32,
}


def _validate_args(models: List[str], weights: List[float]):
    if len(models) < 2:
        raise ValueError("Debes pasar al menos 2 modelos para fusionar.")
    if len(models) != len(weights):
        raise ValueError("La cantidad de modelos y pesos debe coincidir.")
    if any(w < 0 for w in weights):
        raise ValueError("Los pesos no pueden ser negativos.")

    total = sum(weights)
    if total <= 0:
        raise ValueError("La suma de pesos debe ser mayor que 0.")

    for model_path in models:
        if os.path.exists(model_path):
            continue

        # Si parece ruta local y no existe, fallamos temprano con mensaje claro.
        looks_local = (
            model_path.startswith(".")
            or model_path.startswith("models/")
            or model_path.startswith("models\\")
            or "\\" in model_path
        )
        if looks_local:
            raise ValueError(f"No existe ruta local de modelo: {model_path}")


def _normalize(weights: List[float]) -> List[float]:
    total = sum(weights)
    return [w / total for w in weights]


def _load_model(path: str):
    return AutoModelForCausalLM.from_pretrained(
        path,
        torch_dtype=torch.float32,
        device_map="cpu",
        trust_remote_code=True,
    )


def main():
    parser = argparse.ArgumentParser(description="Fusion ponderada de modelos HF compatibles")
    parser.add_argument("--models", nargs="+", required=True, help="Lista de rutas/ids de modelos")
    parser.add_argument("--weights", nargs="+", required=True, type=float, help="Pesos de fusion")
    parser.add_argument("--output_dir", required=True, help="Directorio de salida del modelo fusionado")
    parser.add_argument(
        "--dtype",
        default="float16",
        choices=list(DTYPE_MAP.keys()),
        help="Tipo de dato del modelo guardado",
    )
    args = parser.parse_args()

    try:
        _validate_args(args.models, args.weights)
    except ValueError as err:
        print(f"[ERROR] {err}")
        sys.exit(1)

    norm_weights = _normalize(args.weights)
    print("[INFO] Cargando modelo base para inicializar merge...")
    base = _load_model(args.models[0])
    merged = {k: v.detach().to(torch.float32) * norm_weights[0] for k, v in base.state_dict().items()}

    for idx, model_path in enumerate(args.models[1:], start=1):
        print(f"[INFO] Sumando modelo {idx + 1}/{len(args.models)}: {model_path}")
        model_i = _load_model(model_path)
        state_i = model_i.state_dict()

        if set(state_i.keys()) != set(merged.keys()):
            print("[ERROR] Incompatibilidad de claves entre modelos.")
            sys.exit(1)

        w = norm_weights[idx]
        for key in merged.keys():
            tensor_i = state_i[key].detach().to(torch.float32)
            if tensor_i.shape != merged[key].shape:
                print(f"[ERROR] Shape incompatible en tensor {key}: {tensor_i.shape} != {merged[key].shape}")
                sys.exit(1)
            merged[key].add_(tensor_i, alpha=w)

        del model_i
        del state_i
        gc.collect()

    print("[INFO] Cargando pesos fusionados en modelo base...")
    base.load_state_dict(merged, strict=True)
    target_dtype = DTYPE_MAP[args.dtype]
    base = base.to(dtype=target_dtype)

    os.makedirs(args.output_dir, exist_ok=True)
    print(f"[INFO] Guardando modelo fusionado en: {args.output_dir}")
    base.save_pretrained(args.output_dir, safe_serialization=True)

    print("[INFO] Guardando tokenizer del primer modelo...")
    tokenizer = AutoTokenizer.from_pretrained(args.models[0], trust_remote_code=True)
    tokenizer.save_pretrained(args.output_dir)

    print("[OK] Merge completado")


if __name__ == "__main__":
    main()

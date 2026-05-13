"""
merge_and_export_gguf.py
Corvinus-X v1.2 — Fusiona el adaptador LoRA con el modelo base,
luego exporta el resultado como archivo GGUF listo para llama.cpp.

Uso:
    python scripts/merge_and_export_gguf.py \
        --base_model  models/gemma-2b-base \
        --adapter_dir models/corvinus-xv1.2-adapter \
        --merged_dir  models/corvinus-xv1.2-merged \
        --output_gguf models/corvinus-xv1.2.gguf \
        --quant_type  q4_k_m

Requisitos:
    pip install transformers peft torch
    git clone https://github.com/ggerganov/llama.cpp  (para convert_hf_to_gguf.py)
"""

import os
import sys
import subprocess
import argparse


def merge_adapter(base_model: str, adapter_dir: str, merged_dir: str):
    print("[INFO] Fusionando adaptador LoRA con modelo base ...")
    try:
        from transformers import AutoTokenizer, AutoModelForCausalLM
        from peft import PeftModel
        import torch
    except ImportError as e:
        print(f"[ERROR] Dependencia faltante: {e}")
        sys.exit(1)

    tokenizer = AutoTokenizer.from_pretrained(adapter_dir, trust_remote_code=True)
    base = AutoModelForCausalLM.from_pretrained(
        base_model,
        torch_dtype=torch.float16,
        device_map="cpu",
        trust_remote_code=True,
    )
    base.resize_token_embeddings(len(tokenizer))

    model = PeftModel.from_pretrained(base, adapter_dir)
    model = model.merge_and_unload()

    os.makedirs(merged_dir, exist_ok=True)
    model.save_pretrained(merged_dir, safe_serialization=True)
    tokenizer.save_pretrained(merged_dir)
    print(f"[OK] Modelo fusionado guardado en: {merged_dir}")


def convert_to_gguf(merged_dir: str, output_gguf: str, quant_type: str, llama_cpp_dir: str):
    convert_script = os.path.join(llama_cpp_dir, "convert_hf_to_gguf.py")
    if not os.path.isfile(convert_script):
        # Intento alternativo con convert.py (versiones antiguas)
        convert_script = os.path.join(llama_cpp_dir, "convert.py")
    if not os.path.isfile(convert_script):
        print(f"[ERROR] No se encontró convert_hf_to_gguf.py en: {llama_cpp_dir}")
        print("        Clona llama.cpp: git clone https://github.com/ggerganov/llama.cpp")
        sys.exit(1)

    os.makedirs(os.path.dirname(output_gguf) or ".", exist_ok=True)

    # Paso 1: convertir a GGUF fp16
    tmp_gguf = output_gguf.replace(".gguf", "-fp16.gguf")
    cmd_convert = [
        sys.executable, convert_script,
        merged_dir,
        "--outfile", tmp_gguf,
        "--outtype", "f16",
    ]
    print(f"[INFO] Convirtiendo a GGUF f16 ...")
    result = subprocess.run(cmd_convert, check=False)
    if result.returncode != 0:
        print("[ERROR] Falló la conversión a GGUF.")
        sys.exit(1)

    # Paso 2: cuantizar
    quantize_candidates = [
        os.path.join(llama_cpp_dir, "build", "bin", "llama-quantize"),
        os.path.join(llama_cpp_dir, "build", "bin", "llama-quantize.exe"),
        os.path.join(llama_cpp_dir, "quantize"),  # Linux/Mac legacy
        os.path.join(llama_cpp_dir, "quantize.exe"),
    ]
    quantize_bin = ""
    for candidate in quantize_candidates:
        if os.path.isfile(candidate):
            quantize_bin = candidate
            break

    if not os.path.isfile(quantize_bin):
        print(f"[WARN] No se encontró llama-quantize en {llama_cpp_dir}/build/bin/")
        print(f"       El GGUF f16 está disponible en: {tmp_gguf}")
        print("       Compila llama.cpp para cuantizar.")
        return

    cmd_quant = [quantize_bin, tmp_gguf, output_gguf, quant_type.upper()]
    print(f"[INFO] Cuantizando a {quant_type.upper()} ...")
    result = subprocess.run(cmd_quant, check=False)
    if result.returncode != 0:
        print("[ERROR] Falló la cuantización.")
        sys.exit(1)

    # Limpia el temporal f16
    if os.path.isfile(tmp_gguf):
        os.remove(tmp_gguf)

    print(f"[OK] Corvinus-X v1.2 exportado: {output_gguf}")
    size_mb = os.path.getsize(output_gguf) / (1024 ** 2)
    print(f"     Tamaño: {size_mb:.1f} MB")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fusiona y exporta Corvinus-X v1.2 a GGUF")
    parser.add_argument("--base_model",   default="models/gemma-2b-base",
                        help="Modelo base HuggingFace")
    parser.add_argument("--adapter_dir",  default="models/corvinus-xv1.2-adapter",
                        help="Carpeta del adaptador LoRA entrenado")
    parser.add_argument("--merged_dir",   default="models/corvinus-xv1.2-merged",
                        help="Carpeta del modelo fusionado")
    parser.add_argument("--output_gguf",  default="models/corvinus-xv1.2.gguf",
                        help="Archivo GGUF final")
    parser.add_argument("--quant_type",   default="q4_k_m",
                        choices=["q4_k_m", "q5_k_m", "q8_0", "q4_0"],
                        help="Tipo de cuantización")
    parser.add_argument("--llama_cpp_dir", default="llama.cpp",
                        help="Carpeta del repositorio llama.cpp compilado")
    parser.add_argument("--skip_merge",   action="store_true",
                        help="Salta la fusión (usa merged_dir ya existente)")
    args = parser.parse_args()

    if args.skip_merge and not os.path.isdir(args.merged_dir):
        print(f"[ERROR] --skip_merge requiere que exista --merged_dir: {args.merged_dir}")
        sys.exit(1)

    if not args.skip_merge:
        merge_adapter(args.base_model, args.adapter_dir, args.merged_dir)

    convert_to_gguf(args.merged_dir, args.output_gguf, args.quant_type, args.llama_cpp_dir)

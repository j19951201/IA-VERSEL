"""
download_and_place_hf_model.py
Corvinus-X v1.2 — Descarga el modelo base Gemma-2B desde HuggingFace
y lo coloca en la carpeta models/ lista para fine-tuning.
"""

import os
import sys
import argparse

def download_model(model_id: str, output_dir: str, hf_token: str = None):
    try:
        from huggingface_hub import snapshot_download
    except ImportError:
        print("[ERROR] Instala huggingface_hub: pip install huggingface-hub")
        sys.exit(1)

    os.makedirs(output_dir, exist_ok=True)
    print(f"[INFO] Descargando '{model_id}' en '{output_dir}' ...")
    snapshot_download(
        repo_id=model_id,
        local_dir=output_dir,
        token=hf_token,
        ignore_patterns=["*.msgpack", "*.h5", "flax_model*"],
    )
    print(f"[OK] Modelo descargado en: {output_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Descarga modelo base para Corvinus-X")
    parser.add_argument("--model_id", default="google/gemma-2b", help="ID del modelo en HuggingFace")
    parser.add_argument("--output_dir", default="models/gemma-2b-base", help="Carpeta destino")
    parser.add_argument("--hf_token", default=None, help="Token HuggingFace (si el modelo es privado)")
    args = parser.parse_args()

    download_model(args.model_id, args.output_dir, args.hf_token)

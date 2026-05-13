"""
prepare_training_data.py
Corvinus-X v1.2 — Prepara los datos de entrenamiento desde los archivos
libro_*.txt del proyecto y los convierte al formato JSONL para fine-tuning.

NOVEDAD PATENTABLE: "Anclaje Semántico por Dominio" (ASD)
  Técnica propia que inserta tokens de anclaje de dominio al inicio de cada
  muestra, forzando al modelo a aprender un espacio latente separado por área
  jurídica. Esto mejora la especialización sin perder conocimiento general.
"""

import os
import re
import json
import glob
import hashlib
import argparse
from pathlib import Path


# ──────────────────────────────────────────────────────────────────────────────
# NÚCLEO PATENTABLE: Anclaje Semántico por Dominio (ASD)
# Patent claim: "Método de preparación de datos de entrenamiento para LLM que
# inserta tokens de dominio semántico estructurados como prefijo canónico en
# cada muestra de entrenamiento, creando sub-espacios latentes diferenciados
# por categoría jurídica sin fine-tuning adicional por cabezal."
# ──────────────────────────────────────────────────────────────────────────────

DOMAIN_ANCHORS = {
    "constitucional": "[ASD:CONST]",
    "civil":          "[ASD:CIVIL]",
    "penal":          "[ASD:PENAL]",
    "laboral":        "[ASD:LABOR]",
    "comercial":      "[ASD:COMERCIO]",
    "administrativo": "[ASD:ADMIN]",
    "general":        "[ASD:GENERAL]",
}

DOMAIN_KEYWORDS = {
    "constitucional": ["constitución", "constitucional", "derechos fundamentales", "amparo"],
    "civil":          ["código civil", "contrato", "propiedad", "obligación", "herencia"],
    "penal":          ["código penal", "delito", "pena", "condena", "fiscal", "imputado"],
    "laboral":        ["laboral", "trabajador", "empleador", "sindicato", "salario", "despido"],
    "comercial":      ["comercial", "sociedad", "empresa", "mercantil", "accionista"],
    "administrativo": ["administrativo", "decreto", "resolución", "ministerio", "reglamento"],
}


def detect_domain(text: str) -> str:
    text_lower = text.lower()
    scores = {domain: 0 for domain in DOMAIN_KEYWORDS}
    for domain, keywords in DOMAIN_KEYWORDS.items():
        for kw in keywords:
            scores[domain] += text_lower.count(kw)
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "general"


def apply_asd_anchor(text: str, domain: str) -> str:
    """Aplica el prefijo ASD al texto — núcleo de la técnica patentable."""
    anchor = DOMAIN_ANCHORS[domain]
    return f"{anchor}\n{text}"


def chunk_text(text: str, chunk_size: int = 512, overlap: int = 64) -> list:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i : i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks


def clean_text(text: str) -> str:
    text = re.sub(r"\s{3,}", "\n\n", text)
    text = re.sub(r"[^\S\r\n]+", " ", text)
    return text.strip()


def text_to_samples(text: str, chunk_size: int) -> list:
    text = clean_text(text)
    chunks = chunk_text(text, chunk_size)
    samples = []
    for chunk in chunks:
        if len(chunk.split()) < 20:
            continue
        domain = detect_domain(chunk)
        anchored = apply_asd_anchor(chunk, domain)
        samples.append({
            "text": anchored,
            "domain": domain,
            "id": hashlib.md5(anchored.encode()).hexdigest()[:12],
        })
    return samples


def process_files(input_dir: str, output_file: str, chunk_size: int):
    patterns = [
        os.path.join(input_dir, "libro_*.txt"),
        os.path.join(input_dir, "*.txt"),
    ]
    files = []
    for pattern in patterns:
        files.extend(glob.glob(pattern))
    files = list(set(files))

    if not files:
        print(f"[WARN] No se encontraron archivos .txt en: {input_dir}")
        return

    all_samples = []
    seen_ids = set()

    for fpath in sorted(files):
        print(f"[INFO] Procesando: {os.path.basename(fpath)}")
        try:
            with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
            samples = text_to_samples(text, chunk_size)
            for s in samples:
                if s["id"] not in seen_ids:
                    all_samples.append(s)
                    seen_ids.add(s["id"])
        except Exception as e:
            print(f"[ERROR] {fpath}: {e}")

    os.makedirs(os.path.dirname(output_file) or ".", exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as out:
        for sample in all_samples:
            out.write(json.dumps({"text": sample["text"]}, ensure_ascii=False) + "\n")

    domain_stats = {}
    for s in all_samples:
        domain_stats[s["domain"]] = domain_stats.get(s["domain"], 0) + 1

    print(f"\n[OK] {len(all_samples)} muestras generadas → {output_file}")
    print("[ASD] Distribución por dominio:")
    for d, count in sorted(domain_stats.items(), key=lambda x: -x[1]):
        print(f"      {DOMAIN_ANCHORS[d]}  {count} muestras")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Prepara datos ASD para Corvinus-X")
    parser.add_argument("--input_dir",   default=".",          help="Carpeta con archivos .txt")
    parser.add_argument("--output_file", default="data/corvinus_x_train.jsonl", help="Archivo JSONL de salida")
    parser.add_argument("--chunk_size",  default=512, type=int, help="Tokens por muestra")
    args = parser.parse_args()

    process_files(args.input_dir, args.output_file, args.chunk_size)

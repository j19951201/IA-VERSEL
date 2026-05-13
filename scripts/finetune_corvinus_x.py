"""
finetune_corvinus_x.py
Corvinus-X v1.2 — Fine-tuning QLoRA del modelo base Gemma-2B
con la técnica patentable ASD (Anclaje Semántico por Dominio).

Requisitos:
    pip install transformers peft accelerate bitsandbytes datasets trl

Uso:
    python scripts/finetune_corvinus_x.py \
        --base_model models/gemma-2b-base \
        --train_data data/corvinus_x_train.jsonl \
        --output_dir models/corvinus-xv1.2-adapter

NOVEDAD PATENTABLE #2: "Regulación Adaptativa de Tasa de Aprendizaje por Dominio ASD"
  Cada muestra lleva su token ASD. El scheduler custom ajusta lr_scale según
  el dominio detectado en el prefijo, priorizando dominios sub-representados.
  Esto es un método de entrenamiento diferenciado por espacio semántico
  sin necesidad de múltiples modelos separados.
"""

import os
import re
import math
import json
import argparse

import torch
from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    BitsAndBytesConfig,
    TrainerCallback,
)
from peft import LoraConfig, get_peft_model, TaskType
from trl import SFTTrainer


# ──────────────────────────────────────────────────────────────────────────────
# NÚCLEO PATENTABLE #2: Callback de Regulación Adaptativa por Dominio (RAD)
# Ajusta dinámicamente el learning rate según la distribución de dominios ASD
# en cada batch, normalizando el aprendizaje entre dominios desbalanceados.
# ──────────────────────────────────────────────────────────────────────────────

ASD_DOMAIN_LR_SCALE = {
    "[ASD:CONST]":     1.4,   # sub-representado → lr más alto
    "[ASD:CIVIL]":     1.0,
    "[ASD:PENAL]":     1.0,
    "[ASD:LABOR]":     1.2,
    "[ASD:COMERCIO]":  1.1,
    "[ASD:ADMIN]":     1.1,
    "[ASD:GENERAL]":   0.8,   # sobre-representado → lr más bajo
}

ASD_TOKEN_PATTERN = re.compile(r"\[ASD:[A-Z]+\]")


def detect_batch_domain_scale(batch_texts: list) -> float:
    """Calcula el lr_scale promedio del batch según sus tokens ASD."""
    scales = []
    for text in batch_texts:
        match = ASD_TOKEN_PATTERN.search(text or "")
        if match:
            scales.append(ASD_DOMAIN_LR_SCALE.get(match.group(), 1.0))
        else:
            scales.append(1.0)
    return sum(scales) / len(scales) if scales else 1.0


class RADCallback(TrainerCallback):
    """Regulación Adaptativa por Dominio — ajuste de lr por batch."""

    def __init__(self, base_lr: float):
        self.base_lr = base_lr

    def on_step_begin(self, args, state, control, **kwargs):
        model = kwargs.get("model")
        if model is None:
            return
        # Recupera el último batch del dataloader si está disponible
        train_dl = kwargs.get("train_dataloader")
        if train_dl is None:
            return
        try:
            batch = next(iter(train_dl))
            texts = batch.get("text", [])
            if not texts:
                return
            scale = detect_batch_domain_scale(texts)
            optimizer = kwargs.get("optimizer")
            if optimizer:
                for pg in optimizer.param_groups:
                    pg["lr"] = self.base_lr * scale
        except StopIteration:
            pass


# ──────────────────────────────────────────────────────────────────────────────
# PIPELINE PRINCIPAL
# ──────────────────────────────────────────────────────────────────────────────

def build_bnb_config() -> BitsAndBytesConfig:
    return BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True,
    )


def build_lora_config() -> LoraConfig:
    return LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        r=16,
        lora_alpha=32,
        lora_dropout=0.05,
        bias="none",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    )


def run_finetune(args):
    print(f"[INFO] Cargando tokenizer desde: {args.base_model}")
    tokenizer = AutoTokenizer.from_pretrained(args.base_model, trust_remote_code=True)

    # Registra tokens ASD especiales para que no sean fragmentados
    special_tokens = list(ASD_DOMAIN_LR_SCALE.keys())
    tokenizer.add_special_tokens({"additional_special_tokens": special_tokens})
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    print(f"[INFO] Cargando modelo base (QLoRA 4-bit) ...")
    model = AutoModelForCausalLM.from_pretrained(
        args.base_model,
        quantization_config=build_bnb_config(),
        device_map="auto",
        trust_remote_code=True,
    )
    model.resize_token_embeddings(len(tokenizer))

    lora_cfg = build_lora_config()
    model = get_peft_model(model, lora_cfg)
    model.print_trainable_parameters()

    print(f"[INFO] Cargando datos: {args.train_data}")
    dataset = load_dataset("json", data_files={"train": args.train_data}, split="train")
    dataset = dataset.shuffle(seed=42)

    training_args = TrainingArguments(
        output_dir=args.output_dir,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=4,
        learning_rate=args.lr,
        fp16=True,
        logging_steps=10,
        save_steps=200,
        save_total_limit=2,
        warmup_ratio=0.05,
        lr_scheduler_type="cosine",
        report_to="none",
        dataloader_num_workers=0,
    )

    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=dataset,
        dataset_text_field="text",
        max_seq_length=args.max_seq_len,
        args=training_args,
        callbacks=[RADCallback(base_lr=args.lr)],
    )

    print("[INFO] Iniciando fine-tuning Corvinus-X v1.2 ...")
    trainer.train()

    print(f"[INFO] Guardando adaptador en: {args.output_dir}")
    trainer.save_model(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)
    print("[OK] Fine-tuning completado. Adaptador LoRA guardado.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fine-tuning QLoRA+ASD+RAD para Corvinus-X v1.2")
    parser.add_argument("--base_model",   default="models/gemma-2b-base",          help="Modelo base HF")
    parser.add_argument("--train_data",   default="data/corvinus_x_train.jsonl",   help="Datos JSONL")
    parser.add_argument("--output_dir",   default="models/corvinus-xv1.2-adapter", help="Carpeta adaptador")
    parser.add_argument("--epochs",       default=3,    type=int,   help="Épocas de entrenamiento")
    parser.add_argument("--batch_size",   default=2,    type=int,   help="Batch por GPU")
    parser.add_argument("--lr",           default=2e-4, type=float, help="Learning rate base")
    parser.add_argument("--max_seq_len",  default=512,  type=int,   help="Longitud máxima de secuencia")
    args = parser.parse_args()

    run_finetune(args)

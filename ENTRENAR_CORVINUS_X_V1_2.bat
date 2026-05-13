@echo off
chcp 65001 >nul
title Corvinus-X v1.2 — Pipeline completo de entrenamiento

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║         CORVINUS-X v1.2  —  Pipeline de entrenamiento       ║
echo ║         Técnica patentable ASD + RAD incluida                ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM ── Activar entorno virtual si existe ──────────────────────────────────────
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
    echo [OK] Entorno virtual activado.
) else (
    echo [WARN] No se encontró .venv — usando Python del sistema.
)

REM ── Instalar dependencias ──────────────────────────────────────────────────
echo.
echo [PASO 0] Instalando dependencias Python...
pip install -q transformers peft accelerate bitsandbytes datasets trl huggingface-hub torch
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Falló la instalación de dependencias.
    pause
    exit /b 1
)

REM ── PASO 1: Descargar modelo base ──────────────────────────────────────────
echo.
echo [PASO 1] Descargando modelo base Gemma-2B desde HuggingFace...
echo          (Necesitas aceptar la licencia en https://huggingface.co/google/gemma-2b)
echo.
set /p HF_TOKEN="Introduce tu HuggingFace token (o ENTER para saltar si ya existe): "

if "%HF_TOKEN%"=="" (
    python scripts\download_and_place_hf_model.py
) else (
    python scripts\download_and_place_hf_model.py --hf_token %HF_TOKEN%
)
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Falló la descarga del modelo. Verifica tu token y la licencia.
    pause
    exit /b 1
)

REM ── PASO 2: Preparar datos con técnica ASD ─────────────────────────────────
echo.
echo [PASO 2] Preparando datos de entrenamiento (técnica ASD)...
python scripts\prepare_training_data.py --input_dir . --output_file data\corvinus_x_train.jsonl
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Falló la preparación de datos.
    pause
    exit /b 1
)

REM ── PASO 3: Fine-tuning QLoRA + ASD + RAD ─────────────────────────────────
echo.
echo [PASO 3] Iniciando fine-tuning Corvinus-X v1.2 (QLoRA + ASD + RAD)...
echo          Esto puede tomar varias horas según tu GPU.
echo.
python scripts\finetune_corvinus_x.py ^
    --base_model   models\gemma-2b-base ^
    --train_data   data\corvinus_x_train.jsonl ^
    --output_dir   models\corvinus-xv1.2-adapter ^
    --epochs       3 ^
    --batch_size   2 ^
    --lr           0.0002 ^
    --max_seq_len  512
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Falló el fine-tuning.
    pause
    exit /b 1
)

REM ── PASO 4: Fusionar y exportar a GGUF ────────────────────────────────────
echo.
echo [PASO 4] Fusionando adaptador y exportando a GGUF...
echo          (Requiere llama.cpp compilado en carpeta llama.cpp\)
echo.
python scripts\merge_and_export_gguf.py ^
    --base_model   models\gemma-2b-base ^
    --adapter_dir  models\corvinus-xv1.2-adapter ^
    --merged_dir   models\corvinus-xv1.2-merged ^
    --output_gguf  models\corvinus-xv1.2.gguf ^
    --quant_type   q4_k_m ^
    --llama_cpp_dir llama.cpp
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Exportación GGUF incompleta — revisa si llama.cpp está compilado.
)

REM ── RESULTADO ──────────────────────────────────────────────────────────────
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  ✓ Pipeline completado                                       ║
echo ║  Modelo final: models\corvinus-xv1.2.gguf                    ║
echo ║  Adaptador:    models\corvinus-xv1.2-adapter\                ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
pause

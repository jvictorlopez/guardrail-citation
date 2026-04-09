#!/usr/bin/env bash
# Downloads the sentence-transformers/all-MiniLM-L6-v2 model files
# for local use (no HuggingFace account or API key required).
#
# Usage: bash setup_model.sh

set -euo pipefail

MODEL_DIR="$(cd "$(dirname "$0")" && pwd)/models/all-MiniLM-L6-v2"
POOLING_DIR="$MODEL_DIR/1_Pooling"
BASE_URL="https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main"

mkdir -p "$POOLING_DIR"

FILES=(
    "model.safetensors"
    "config.json"
    "config_sentence_transformers.json"
    "modules.json"
    "tokenizer.json"
    "tokenizer_config.json"
    "special_tokens_map.json"
    "vocab.txt"
)

echo "Downloading model files to $MODEL_DIR ..."

for f in "${FILES[@]}"; do
    if [ -f "$MODEL_DIR/$f" ]; then
        echo "  [skip] $f (already exists)"
    else
        echo "  [download] $f"
        curl -sL -o "$MODEL_DIR/$f" "$BASE_URL/$f"
    fi
done

# Pooling config
if [ -f "$POOLING_DIR/config.json" ]; then
    echo "  [skip] 1_Pooling/config.json (already exists)"
else
    echo "  [download] 1_Pooling/config.json"
    curl -sL -o "$POOLING_DIR/config.json" "$BASE_URL/1_Pooling/config.json"
fi

echo ""
echo "Done. Model size: $(du -sh "$MODEL_DIR" | cut -f1)"
echo "You can now run: uvicorn app.main:app --reload"

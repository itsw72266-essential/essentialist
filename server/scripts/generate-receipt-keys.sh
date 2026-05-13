#!/usr/bin/env bash

set -euo pipefail

OUT_DIR="${1:-./receipt-keys}"
PRIVATE_KEY_PATH="${OUT_DIR}/receipt-private.pem"
PUBLIC_KEY_PATH="${OUT_DIR}/receipt-public.pem"

mkdir -p "${OUT_DIR}"

openssl genpkey \
  -algorithm RSA \
  -pkeyopt rsa_keygen_bits:2048 \
  -out "${PRIVATE_KEY_PATH}"

openssl rsa \
  -in "${PRIVATE_KEY_PATH}" \
  -pubout \
  -out "${PUBLIC_KEY_PATH}"

python3 - "${PRIVATE_KEY_PATH}" "${PUBLIC_KEY_PATH}" <<'PYTHON'
import pathlib
import sys

private_path = pathlib.Path(sys.argv[1])
public_path = pathlib.Path(sys.argv[2])

def escape_for_env(pem: str) -> str:
    return pem.replace("\r\n", "\n").strip().replace("\n", "\\n")

private_key = private_path.read_text(encoding="utf-8")
public_key = public_path.read_text(encoding="utf-8")

print("\nGenerated keys saved to:")
print(f"  Private key: {private_path.resolve()}")
print(f"  Public  key: {public_path.resolve()}\n")

print("Copy the lines below into your environment files:\n")
print(f'RECEIPT_PRIVATE_KEY="{escape_for_env(private_key)}"')
print(f'NEXT_PUBLIC_RECEIPT_PUBLIC_KEY="{escape_for_env(public_key)}"')
print("\n✅ Done.")
PYTHON


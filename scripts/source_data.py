"""Shared command-line configuration for data generation."""
import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def arguments(description):
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument('--source', required=True, type=Path,
                        help='ZIP containing csv_banco_de_dados.zip')
    parser.add_argument('--output-dir', type=Path, default=ROOT / 'data' / 'generated')
    args = parser.parse_args()
    if not args.source.is_file():
        parser.error(f'Arquivo não encontrado: {args.source}')
    return args

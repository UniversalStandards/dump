#!/bin/bash

# Code Block Extractor - Shell Script Wrapper
# Usage: ./extract_code.sh [file1] [file2] ...

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXTRACTOR_SCRIPT="$SCRIPT_DIR/code_extractor.py"

# Check if Python script exists
if [ ! -f "$EXTRACTOR_SCRIPT" ]; then
    echo "Error: code_extractor.py not found in $SCRIPT_DIR"
    exit 1
fi

# Check if files were provided
if [ $# -eq 0 ]; then
    echo "Code Block Extractor"
    echo "Usage: $0 [options] file1 [file2 ...]"
    echo ""
    echo "Options:"
    echo "  -o, --output DIR    Output directory (default: extracted_code)"
    echo "  -v, --verbose       Verbose output"
    echo "  -h, --help          Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 conversation.md"
    echo "  $0 -v -o my_code conversation1.md conversation2.md"
    echo "  $0 *.md *.txt"
    exit 0
fi

# Run the Python extractor with all arguments
python3 "$EXTRACTOR_SCRIPT" "$@"
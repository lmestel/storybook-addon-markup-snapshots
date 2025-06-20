#!/bin/bash

# Source directory (edit as needed)
SNAPSHOT_DIR="src/stories/__snapshots__"

# Ensure the old and new refs are provided
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <old-ref> <new-ref>"
  exit 1
fi

OLD_REF=$1
NEW_REF=$2

echo "± Creating patches between $OLD_REF and $NEW_REF"

# Output directory for the patch files
OUTPUT_DIR="diffs/$NEW_REF"

# Create the output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# For each changed file between OLD_REF and NEW_REF within SNAPSHOT_DIR
git diff --name-only "$OLD_REF" "$NEW_REF" -- "$SNAPSHOT_DIR" | while read -r file; do
  # Extract the filename
  filename=$(basename "$file")
  output_file="$OUTPUT_DIR/${filename}.patch"

  # Generate the diff and save it to the output file
  git diff "$OLD_REF" -- "$file" > "$output_file"
done

echo "Patches saved to: $OUTPUT_DIR"

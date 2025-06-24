#!/bin/bash

# Ensure the version is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

VERSION=$1

# Find the previous semver tag that is NOT the current version
git tag --sort=-creatordate | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | grep -v "$VERSION" | tail -n 1

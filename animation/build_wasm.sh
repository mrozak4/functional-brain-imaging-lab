#!/bin/bash
set -e

echo "Building WASM animation..."

# Ensure we are in the script's directory
cd "$(dirname "$0")"

mkdir -p build
cd build

# Use emcmake to configure the project for Emscripten
emcmake cmake ..

# Build using emmake
emmake make

echo "Build complete. Files generated in animation/build/:"
ls -la intro.js intro.wasm

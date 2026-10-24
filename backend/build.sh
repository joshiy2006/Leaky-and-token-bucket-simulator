#!/usr/bin/env bash
# Build script for the C++ backend
# Creates a build directory, configures with CMake (Release), and builds the simulator binary.

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT"

mkdir -p build
cd build
cmake -DCMAKE_BUILD_TYPE=Release ..
cmake --build .

echo "Build completed. Binary located at $(pwd)/simulator"

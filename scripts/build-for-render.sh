#!/bin/bash

# Build the client and server for Render deployment
echo "Building client and server..."

# Build the frontend
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

# Create the correct directory structure for production
echo "Organizing build files for production..."
mkdir -p dist/public

# Copy built client files to public directory
if [ -d "dist" ]; then
    # Move all client build files to public directory
    mv dist/* dist/public/ 2>/dev/null || true
    
    # Build the server
    esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
    
    echo "Build completed successfully!"
    echo "Client files are in: dist/public/"
    echo "Server file is: dist/index.js"
else
    echo "Error: dist directory not found after client build"
    exit 1
fi
# Render Deployment Guide

## Prerequisites
1. Create a PostgreSQL database on Render or have an external PostgreSQL database ready
2. Have your GitHub repository ready with the latest code

## Render Configuration

### Environment Variables
Set these environment variables in your Render service:

1. **DATABASE_URL** - Your PostgreSQL connection string
2. **NODE_ENV** - Set to `production`

### Build Configuration
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Node Version**: Use default (Node.js 22+)

### Build Process Fix
Due to the current Vite configuration, you may need to manually adjust the build output. After deployment fails the first time, you can:

1. Use the custom build script: `./scripts/build-for-render.sh`
2. Or manually copy the built files to the correct location

### Database Setup
After deployment, make sure to run the database migrations:
```bash
npm run db:push
```

## Troubleshooting

### Build Directory Error
If you see: "Could not find the build directory: /opt/render/project/src/dist/public"

The issue is that the Vite build outputs to `dist/` but the production server expects files in `dist/public/`.

**Solution Options:**
1. Use the provided build script: `scripts/build-for-render.sh`
2. Update your Render build command to: `npm install && ./scripts/build-for-render.sh`
3. Or manually restructure the build output

### Database Connection
Ensure your DATABASE_URL environment variable is properly set and the database is accessible from Render.

## Alternative: Manual Build Fix
If the automated script doesn't work, you can manually fix the build:

1. After the initial build, create: `mkdir -p dist/public`
2. Move client files: `mv dist/assets dist/index.html dist/public/`
3. Keep the server file: `dist/index.js` in the root dist folder
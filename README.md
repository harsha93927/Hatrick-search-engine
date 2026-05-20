# JARVIS AI Assistant - Operating System Assistant

This project is a real AI operating system assistant, combining reasoning, voice interaction, OS automation, and a futuristic UI.

## Features

- **Voice Interaction**: Natural speech-to-text (STT) and text-to-speech (TTS).
- **AI Brain**: Integrated with Google Gemini API (user-provided keys).
- **OS Automation**: Comprehensive control over the host operating system.
- **Futuristic UI**: Beautiful, responsive interface with voice visualizations.

## Components

1. **Frontend (`artifacts/hatrick-search`)**: React + Tailwind + Framer Motion.
2. **AI API Server (`artifacts/api-server`)**: Node.js + Express + Gemini SDK.
3. **OS Controller (`artifacts/os-controller`)**: Python FastAPI backend + Standalone Binary.

## Getting Started

### 1. OS Controller (Local Execution)
To allow JARVIS to control your system, run the OS Controller:
- **Using Source**: `python artifacts/os-controller/main.py`
- **Using Binary**: Execute `artifacts/os-controller/JARVIS-OS-Controller`

### 2. API Server
`pnpm --filter @workspace/api-server dev`

### 3. Frontend
`pnpm --filter @workspace/hatrick-search dev`

## Deployment
The frontend is configured for deployment on Netlify via `netlify.toml`.

## OS Operations Supported
- Open Apps & Folders
- Create, Delete, Rename Files
- List Directories & Search Files
- System Monitoring (CPU, RAM, Disk, Battery)
- Process Management (List & Kill)
- Take Screenshots
- Set Screen Brightness

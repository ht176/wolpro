# WOL (Wake-on-LAN) Manager

A simple web interface to scan, manage, and wake devices on your local network.

## Project Structure

- **backend/**: NestJS application handling scanning, WOL, and data persistence (SQLite). Features Swagger API docs.
- **frontend/**: Vue 3 + Element Plus (Auto-imported) + UnoCSS application. Uses NSwag for typed API clients.

## Prerequisites

- Node.js (v18+)
- NPM

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
npm run start
```
The backend will run on `http://localhost:3000`.
- **API Documentation**: `http://localhost:3000/api` (Swagger UI)

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173` (or similar).

### Development Tools

- **Generate API Client**: Run `npm run nswag` in `frontend/` to regenerate the API client from the backend Swagger docs.


## Features

- **Scan Network:** Discovers devices on the local network using Ping Sweep and ARP table lookup.
- **Manage Devices:** Save discovered devices, edit names and notes.
- **Wake Device:** Send Wake-on-LAN magic packets to saved devices.

## Notes

- **Scanning:** The scanning feature uses `ping` and `arp` commands from the underlying OS. It works best on macOS and Linux. On Windows, parsing might need adjustments.
- **WOL:** Ensure the target device has Wake-on-LAN enabled in BIOS/UEFI and OS settings.

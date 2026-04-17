# Smart City Civic Reporting Platform

![Monorepo](https://img.shields.io/badge/Repo-Monorepo-1f6feb)
![Node](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Backend-Express-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React-61dafb?logo=react&logoColor=111827)
![Vite](https://img.shields.io/badge/Build-Vite-646cff?logo=vite&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-010101?logo=socketdotio&logoColor=white)

A full-stack civic issue reporting application where citizens can report city problems with location and photos, and authorities can manage issue lifecycle in real time.

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [How to Clone and Run](#how-to-clone-and-run)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Realtime Events](#realtime-events)
- [Auth and Roles](#auth-and-roles)
- [Data Model Notes](#data-model-notes)
- [Troubleshooting](#troubleshooting)

## Overview

This repository contains:

- A production-style TypeScript backend (`backend/`) with Express, MongoDB, validation, modular services, geospatial queries, and Socket.IO.
- A React + Vite frontend (`frontend/`) with routing, protected authority pages, issue map/list/detail flows, and authenticated admin actions.
- Additional workspace modules and experiments (`Civic-Report-Map/`, `lib/`, `scripts/`) used for API contracts, tooling, and sandbox work.

Primary user journey:

1. User reports an issue with title, description, category, location, and optional image.
2. Backend reverse-geocodes coordinates to a readable address.
3. Issue gets assigned to a department (`road_department`, `water_department`, etc.).
4. Authorities log in to update status (`reported` -> `in_progress` -> `resolved`).
5. Realtime confirmation can be delivered to connected clients.

## Core Features

### Citizen-facing

- Create geotagged civic issues.
- Upload image data (data URLs / public image URLs).
- View issue feed, detail pages, and map-oriented workflows.
- Upvote/downvote issues to surface importance.
- Get location previews (address from latitude/longitude).

### Authority-facing

- Authority registration and login with JWT-based auth.
- Protected admin panel route.
- Status transitions with transition validation.
- Assignment mapping by issue category.

### Platform / backend capabilities

- AI-assisted categorization endpoint (`/api/ai/categorize`) based on keyword rules.
- Duplicate proximity linking (`duplicate_of`) when similar issue category is found within 50m.
- Geospatial MongoDB indexing (`2dsphere`) and optional distance filtering.
- Realtime Socket.IO user registration and targeted events.
- Graceful server shutdown and health endpoints.

## Tech Stack

### Backend

- Node.js (>=20)
- TypeScript
- Express
- MongoDB + Mongoose
- Socket.IO
- JWT auth (`jsonwebtoken`)
- `resend` integration support for notifications

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- React Query
- Leaflet (maps)
- Socket.IO client

### Dev Tooling

- npm workspaces
- concurrently
- tsx (backend dev runtime)

## Monorepo Structure

```text
smart-city/
├─ package.json
├─ README.md
├─ backend/
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ src/
│     ├─ app.ts
│     ├─ server.ts
│     ├─ integrations/
│     │  ├─ cloudinary.service.ts
│     │  └─ maps.service.ts
│     ├─ modules/
│     │  ├─ ai/
│     │  │  ├─ ai.controller.ts
│     │  │  └─ ai.routes.ts
│     │  ├─ auth/
│     │  │  ├─ auth.controller.ts
│     │  │  ├─ auth.model.ts
│     │  │  ├─ auth.repository.ts
│     │  │  ├─ auth.routes.ts
│     │  │  ├─ auth.service.ts
│     │  │  └─ auth.types.ts
│     │  └─ issue/
│     │     ├─ issue.controller.ts
│     │     ├─ issue.model.ts
│     │     ├─ issue.repository.ts
│     │     ├─ issue.routes.ts
│     │     ├─ issue.serializer.ts
│     │     ├─ issue.service.ts
│     │     ├─ issue.types.ts
│     │     └─ issue.validator.ts
│     ├─ shared/
│     │  ├─ db.ts
│     │  ├─ errors.ts
│     │  ├─ utils.ts
│     │  ├─ config/
│     │  │  └─ env.ts
│     │  ├─ db/
│     │  ├─ integrations/
│     │  ├─ middleware/
│     │  └─ utils/
│     └─ types/
│        └─ global.d.ts
├─ frontend/
│  ├─ index.html
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ vite.config.ts
│  └─ src/
│     ├─ App.tsx
│     ├─ main.tsx
│     ├─ components/
│     ├─ context/
│     ├─ hooks/
│     ├─ i18n/
│     ├─ pages/
│     ├─ routes/
│     ├─ services/
│     ├─ styles/
│     └─ types/
├─ Civic-Report-Map/
│  ├─ api-server/
│  ├─ civic-tracker/
│  ├─ mockup-sandbox/
│  └─ lib/
├─ lib/
│  ├─ api-client-react/
│  ├─ api-spec/
│  ├─ api-zod/
│  └─ db/
└─ scripts/
	 └─ src/
```

## How to Clone and Run

### 1) Clone

```bash
git clone https://github.com/tusharpatil03/smart-city.git
cd smart-city
```

### 2) Install dependencies

From repository root:

```bash
npm install
```

This installs dependencies for the workspace packages (`backend`, `frontend`) via npm workspaces.

### 3) Configure environment files

Backend:

```bash
cp backend/.env.example backend/.env
```

Frontend:

```bash
cp frontend/.env.example frontend/.env
```

If you are on Windows PowerShell and `cp` is aliased differently, use:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

### 4) Start development servers

From root (starts both frontend and backend concurrently):

```bash
npm run dev
```

Default runtime behavior:

- Backend runs on `http://localhost:5000` when started via root script.
- Frontend runs on Vite default port (typically `http://localhost:5173`).

### 5) Open the app

- Frontend UI: `http://localhost:5173`
- Backend health: `http://localhost:5000/health`
- API health: `http://localhost:5000/api/healthz`

## Environment Variables

### backend/.env

```env
NODE_ENV=development
PORT=4000
MONGODB_URI="mongodb://localhost:27017/smartCity"

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Notes:

- `MONGODB_URI` is required.
- `JWT_SECRET` is optional in code (fallback exists) but strongly recommended for production.
- `CLIENT_ORIGIN` defaults to `http://localhost:5173` if omitted.
- `RESEND_API_KEY` can be set to enable email notifications.

### frontend/.env

```env
VITE_API_BASE_URL=http://localhost:4000
```

When running backend via root dev script (`PORT=5000`), update this value to:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Available Scripts

### Root

- `npm run dev` -> run backend + frontend together
- `npm run dev:backend` -> run backend only on port 5000
- `npm run dev:frontend` -> run frontend only
- `npm run build:backend` -> backend build
- `npm run build:frontend` -> frontend build
- `npm run typecheck` -> typecheck backend + frontend

### Backend (`backend/`)

- `npm run dev` -> tsx watch mode
- `npm run build` -> compile TypeScript to `dist/`
- `npm run start` -> start compiled server
- `npm run typecheck` -> strict typecheck

### Frontend (`frontend/`)

- `npm run dev` -> Vite dev server
- `npm run build` -> TypeScript compile + Vite bundle
- `npm run preview` -> preview production build
- `npm run typecheck` -> strict typecheck

## API Reference

Base URL: `http://localhost:4000` (or `http://localhost:5000` if started from root script)

### Health

- `GET /health`
- `GET /api/healthz`

### Auth

- `POST /api/auth/register` - register authority user
- `POST /api/auth/login` - login authority user

### AI

- `POST /api/ai/categorize` - infer issue category from title/description

Example request:

```json
{
	"title": "Road completely broken near signal",
	"description": "Huge potholes and damaged road section"
}
```

### Issues / Reports

- `POST /api/issues` - create issue
- `GET /api/issues` - list issues (supports optional geo filters)
- `GET /api/issues/:id` - issue detail
- `PATCH /api/issues/:id/status` - update issue status (authority only)
- `PUT /api/issues/:id/vote` - vote on issue (`upvote` or `downvote`)
- `GET /api/issues/stats` - issue dashboard counters
- `GET /api/issues/location-preview` - reverse geocode coordinates

Alias endpoints in app:

- `POST /api/report`
- `GET /api/reports`

### Create Issue sample

```bash
curl -X POST http://localhost:4000/api/issues \
	-H "Content-Type: application/json" \
	-d '{
		"title": "Pothole on main road",
		"description": "Large pothole causing traffic",
		"category": "road",
		"location": {
			"lat": 18.5204,
			"lng": 73.8567
		},
		"images": [
			"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
		]
	}'
```

Sample response:

```json
{
	"id": "67ff4a635318c6b8da9a4ef2",
	"status": "reported",
	"assigned_to": "road_department",
	"created_at": "2026-04-15T11:22:33.000Z",
	"duplicate_of": "67ff4a635318c6b8da9a4aaa"
}
```

## Realtime Events

Socket server is initialized in backend and accepts client `register` events with a user ID.

Current event used in issue flow:

- `issueCreated` -> emitted to registered socket when issue report succeeds

## Auth and Roles

- Supported authenticated role in backend is `authority`.
- Protected status updates require Bearer token.
- Frontend stores authority token and user metadata in localStorage keys:
	- `smart-city-authority-token`
	- `smart-city-authority-user`

## Data Model Notes

- Issue categories persisted in backend:
	- `road`, `water`, `electricity`, `garbage`
- Status values:
	- `reported`, `in_progress`, `resolved`
- Allowed transitions:
	- `reported` -> `in_progress` or `resolved`
	- `in_progress` -> `resolved`
- Duplicate detection:
	- same category within 50 meters links new issue through `duplicate_of`

## Troubleshooting

### Push warning: embedded git repository

If `Civic-Report-Map` is staged as an embedded repo, Git adds it as a gitlink. To keep it as normal folder content:

```bash
git rm --cached -r Civic-Report-Map
rm -rf Civic-Report-Map/.git
git add Civic-Report-Map
```

PowerShell version:

```powershell
git rm --cached -r Civic-Report-Map
Remove-Item -Recurse -Force Civic-Report-Map/.git
git add Civic-Report-Map
```

### Line ending warnings (LF/CRLF)

On Windows, Git may print LF/CRLF conversion warnings. They are informational unless your team enforces specific line endings.

### MongoDB connection issues

- Ensure MongoDB is running.
- Ensure `MONGODB_URI` is valid in `backend/.env`.

---



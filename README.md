# Smart City MVP

Monorepo for a geotagged issue reporting MVP.

## Structure

- `backend/` - existing Node.js + Express + MongoDB API
- `frontend/` - React + Vite + TypeScript client

## Setup

Install dependencies from the repository root:

```bash
npm install
```

If you prefer installing per workspace, install inside `backend/` and `frontend/` separately.

## Run

Start both apps together:

```bash
npm run dev
```

The root dev script starts the backend on port `5000` and the frontend on the default Vite port.

## Frontend

The frontend reads its API base URL from `frontend/.env`.

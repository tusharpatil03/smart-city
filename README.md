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

## Create Issue API

Endpoint:

```bash
POST /api/issues
```

Sample request:

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

Sample success response:

```json
{
	"id": "67ff4a635318c6b8da9a4ef2",
	"status": "reported",
	"assigned_to": "road_department",
	"created_at": "2026-04-15T11:22:33.000Z"
}
```

Duplicate behavior:
- If another issue with the same category is found within 50 meters, a new issue is still created and linked through `duplicate_of`.

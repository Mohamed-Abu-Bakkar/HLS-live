# HLS Frontend

React + Vite single-page app for the Hotel Listing System. Talks to the Express API in `../HLS-backend` over `/api` and provides hotel search, CRUD flows, image uploads, and a Leaflet location map.

## Prerequisites

- Node.js 18+
- pnpm
- Backend API running on `http://localhost:5000` (see `../HLS-backend`)

## Setup

```bash
pnpm install
pnpm dev
```

The dev server starts on http://localhost:3000 with HMR. Requests to `/api` and `/uploads` are proxied to `http://localhost:5000` (configured in `vite.config.js`).

## Scripts

| Command        | Description                              |
| -------------- | ---------------------------------------- |
| `pnpm dev`     | Start the dev server with HMR (port 3000) |
| `pnpm build`   | Production build into `dist/`            |
| `pnpm preview` | Serve the production build locally       |

## Environment

| Variable       | Description                       | Default                          |
| -------------- | --------------------------------- | -------------------------------- |
| `VITE_API_URL` | API base URL prefix               | `''` (same origin, uses proxy)   |

## Production / Docker

The `Dockerfile` builds the app and serves it with `prod-server.js`, a small Node server that serves `dist/` with SPA fallback and proxies `/api` and `/uploads` to the backend.

```bash
docker build -t hls-frontend ./HLS-frontend
docker run -p 3000:3000 -e BACKEND_HOST=backend -e BACKEND_PORT=5000 hls-frontend
```

To start the whole stack (database, backend, frontend), run `docker compose up -d` from the repository root.

## Project structure

```
src/
├── api/hotelApi.js          Axios client for /api/hotels
├── features/hotelSlice.js   Redux Toolkit slice + async thunks
├── store/store.js           Redux store
├── components/              Navbar, HotelCard, SearchFilter, HotelForm, HotelMap, Pagination, modals
├── pages/                   List, detail, add, and edit pages
└── styles/main.css          Theme tokens and component styles
```

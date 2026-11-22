# Mortgage Service

A full-stack mortgage calculator with a **Go** static-file backend and a **Preact/Vite** frontend.
The frontend does the calculations in the browser; the Go service only serves the built web app.

## Prerequisites

- [Go 1.27.4](https://go.dev/dl/)
- [Bun](https://bun.sh/)
- [Docker](https://docs.docker.com/get-docker/) (optional, for containers)
- `make`

## Project layout

| Path | Description |
| --- | --- |
| `apps/api` | Go module (no third-party Go dependencies) that serves the static frontend. |
| `apps/api/assets` | `index.html`, favicon, fonts, CSS. The Vite bundle is built into `assets/ui/`. |
| `apps/web` | Preact + TypeScript + Vite + Tailwind 4 frontend. |
| `docker` | Multi-stage `Dockerfile` and Compose file. |

The frontend build outputs a UMD bundle (`index.js`, `styles.css`) to `apps/api/assets/ui`.
`apps/api/assets/index.html` references it as `/ui/index.js` and `/ui/styles.css`; the backend
serves that whole directory as the site root.

## Development

```bash
make dev          # Go backend (:8082) + Vite dev server (:5173); Ctrl-C stops both
```

Individual processes:

```bash
make dev-backend  # Go service on :8082
make dev-frontend # Vite dev server on :5173 (installs deps if needed)
make web-install  # bun install
```

The dev server is standalone — the app makes no API calls to the Go service.

## Build and test

```bash
make build        # Go binary + frontend bundle
make api-build    # stripped, statically linked binary -> apps/api/mortgage-service
make web-build    # frontend -> apps/api/assets/ui
make api-test     # go test ./...
make test         # go test -v ./...
make clean        # remove binary, node_modules and generated bundle
```

To run the built binary locally, from `apps/api`:

```bash
make build
cd apps/api && PORT=8082 ./mortgage-service   # http://localhost:8082
```

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | Listen address (`0.0.0.0` in the container). |
| `PORT` | `8080` | Listen port (`8082` in the container and via `make dev-backend`). |
| `ASSETS_PATH` | auto-detected | Directory containing `index.html` (`/assets` in the container). |

When `ASSETS_PATH` is unset, the backend looks for `../web/dist`, `apps/web/dist`, `./assets`,
`/assets` and `web/dist` in that order. Running from `apps/api` finds `./assets` automatically.

## Docker

The Dockerfile builds the frontend with Bun and the backend as a static Go binary
(`CGO_ENABLED=0`, stripped, UPX-packed), then copies both into a minimal `scratch` image
along with CA certificates.

```bash
make docker-up          # docker compose -f docker/compose.yml up -d --build
make docker-down
make docker-logs
make docker-restart
```

Or directly:

```bash
docker build -t mortgage:0.1.0 -f docker/Dockerfile .
docker compose -f docker/compose.yml up -d
```

Compose publishes `8082:8082`, attaches the container to the external `traefik_proxy`
network (create it first if needed), and routes `mortgage.reftch.com` through Traefik to
port 8082: <https://mortgage.reftch.com/>.

> **Remote Docker contexts:** if your active Docker context is a remote host (e.g. an SSH
> context), `docker compose up` runs the container there, so `localhost:8082` on your own
> machine won't reach it. Use the remote host's IP/domain, or forward the port with
> `ssh -N -L 8082:127.0.0.1:8082 <user>@<host>`. To run locally, select a local context
> (for example `docker context use orbstack`) and create the `traefik_proxy` network first.

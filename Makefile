.SILENT:

# Development helper for the mortgage service (Go backend + Preact/Vite frontend).
# Run `make dev` to start the backend (:8082) and the Vite dev server (:5173)
# together; Ctrl-C tears both down.

BACKEND_PORT ?= 8082
BINARY := apps/api/mortgage-service

# Docker Compose file for the containerised stack.
COMPOSE := docker compose -f docker/compose.yml

.PHONY: build dev dev-backend dev-frontend web-install web-build api-build api-test clean \
        docker-build docker-up docker-down docker-logs docker-restart test

# Frontend deps (once, or after package.json changes).
web-install:
	cd apps/web && bun install

# Production frontend build -> apps/api/assets/ui (served by Go from /assets).
web-build: web-install
	cd apps/web && bun run build

# Backend only: Go service on $(BACKEND_PORT).
dev-backend:
	cd apps/api && PORT=$(BACKEND_PORT) go run .

# Frontend only: Vite dev server on :5173 (no backend API calls in this app).
# Installs deps first if node_modules is missing.
dev-frontend:
	@if [ ! -d apps/web/node_modules ]; then (cd apps/web && bun install); fi
	cd apps/web && bun run dev

# Both together: backend in the background, Vite in the foreground, cleaned up on exit.
# Installs frontend deps first if node_modules is missing.
dev:
	@trap 'kill 0' EXIT; \
	(cd apps/api && PORT=$(BACKEND_PORT) go run .) & \
	(cd apps/web && { [ -d node_modules ] || bun install; } && bun run dev) & \
	wait

# Build a stripped, statically linked backend binary into $(BINARY).
api-build:
	cd apps/api && CGO_ENABLED=0 go build -trimpath -buildvcs=false -ldflags="-s -w -buildid=" -o mortgage-service .
	# upx --best mortgage-service

# Run the backend test suite.
api-test:
	cd apps/api && go test ./...

# Build both local artifacts: the Go binary and the frontend assets.
build: api-build web-build

# Verbose test run.
test:
	cd apps/api && go test -v ./...

# --- Containerised stack (Docker Compose) ---

# Build the dashboard image.
docker-build:
	$(COMPOSE) build

# Start the service (detached).
docker-up:
	$(COMPOSE) up -d --build

# Stop and remove the containers.
docker-down:
	$(COMPOSE) down

# Follow the container logs.
docker-logs:
	$(COMPOSE) logs -f

# Rebuild and restart the stack.
docker-restart: docker-down docker-build docker-up

# --- Housekeeping ---

# Remove build artifacts (Go binary, generated frontend bundle, deps).
clean:
	rm -f $(BINARY)
	rm -rf apps/api/assets/ui
	rm -rf apps/web/node_modules apps/web/dist

# Mortgage Service

A full-stack application consisting of a Rust-based API and a Preact-based web frontend.

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Bun](https://bun.sh/)
- [Docker](https://docs.docker.com/get-docker/)
- `make`

## Development

To start both the API and the web frontend in development mode, run:

```bash
make dev
```

### API Development

The API is built with Rust. To run it in watch mode:

```bash
make api
```

### Web Development

The frontend is built with Preact and Vite. To run the development server:

```bash
make web
```

## Build

To build both the API (in release mode) and the web assets:

```bash
make build
```

To clean the project:

```bash
make clean
```

## Deployment

The project is containerized using Docker. You can use Docker Compose to start the services:

```bash
docker compose up -d
```

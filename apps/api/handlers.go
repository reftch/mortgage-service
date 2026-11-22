package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"
)

const upstreamTimeout = 10 * time.Second

func newRouter(cfg config) (http.Handler, error) {
	mux := http.NewServeMux()
	mux.Handle("/", staticHandler(cfg.assetsPath))
	return mux, nil
}

func writeBody(w http.ResponseWriter, body []byte) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(body)
}

func writeJSON(w http.ResponseWriter, value any) {
	body, err := json.Marshal(value)
	if err != nil {
		upstreamError(w, err)
		return
	}
	writeBody(w, body)
}

func badRequest(w http.ResponseWriter, message string) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, _ = io.WriteString(w, message)
}

func upstreamError(w http.ResponseWriter, err error) {
	log.Printf("upstream request failed: %v", err)
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(http.StatusBadGateway)
	_, _ = io.WriteString(w, "Upstream error")
}

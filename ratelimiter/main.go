package main

import (
	"log"
	"net/http"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
}

func main() {
	mux := http.NewServeMux()

	// Enforcement endpoint
	mux.HandleFunc("/enforce", EnforceHandler)

	// Health endpoint (Phase 8.2)
	mux.HandleFunc("/health", healthHandler)

	addr := ":8081"
	log.Printf("[ratelimiter] starting on %s\n", addr)

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

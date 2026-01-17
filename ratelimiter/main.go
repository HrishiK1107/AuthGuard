package main

import (
	"encoding/json"
	"log"
	"net/http"
)

var enforcementMode = "fail-closed"

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
}

func modeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	type payload struct {
		Mode string `json:"mode"`
	}

	var p payload
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if p.Mode != "fail-open" && p.Mode != "fail-closed" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	enforcementMode = p.Mode
	log.Printf("[ratelimiter] enforcement mode set to %s\n", enforcementMode)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
}

func main() {
	mux := http.NewServeMux()

	// Enforcement endpoint
	mux.HandleFunc("/enforce", EnforceHandler)

	// Mode control (NEW)
	mux.HandleFunc("/mode", modeHandler)

	// Health endpoint
	mux.HandleFunc("/health", healthHandler)

	addr := ":8081"
	log.Printf("[ratelimiter] starting on %s\n", addr)

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

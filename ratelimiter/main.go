package main

import (
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()

	// Enforcement endpoint
	mux.HandleFunc("/enforce", EnforceHandler)

	addr := ":8081"
	log.Printf("[ratelimiter] starting on %s\n", addr)

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

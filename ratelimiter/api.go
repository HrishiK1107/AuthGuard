package main

import (
	"encoding/json"
	"net/http"
	"time"
)

// EnforcementRequest represents input from AuthGuard
type EnforcementRequest struct {
	Entity     string `json:"entity"`
	Decision   string `json:"decision"`
	TTLSeconds int    `json:"ttl_seconds"`
}

// EnforcementResponse is returned to caller
type EnforcementResponse struct {
	Allowed bool   `json:"allowed"`
	Reason  string `json:"reason"`
}

// EnforceHandler handles enforcement requests
func EnforceHandler(w http.ResponseWriter, r *http.Request) {
	var req EnforcementRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	entity := req.Entity

	// Hard block always wins
	if isBlocked(entity) {
		respond(w, false, "entity is currently blocked")
		return
	}

	switch req.Decision {

	case "ALLOW":
		respond(w, true, "allowed")

	case "MONITOR":
		bucket := bucketStore.getBucket(entity, 20, 5)
		if bucket.AllowRequest() {
			respond(w, true, "allowed (monitoring)")
		} else {
			respond(w, false, "rate limited (monitor)")
		}

	case "CHALLENGE":
		bucket := bucketStore.getBucket(entity, 5, 1)
		if bucket.AllowRequest() {
			respond(w, true, "allowed (challenge mode)")
		} else {
			respond(w, false, "rate limited (challenge)")
		}

	case "BLOCK":
		blockEntity(entity, time.Duration(req.TTLSeconds)*time.Second)
		respond(w, false, "blocked")

	default:
		http.Error(w, "unknown decision", http.StatusBadRequest)
	}
}

// Helper to write JSON response
func respond(w http.ResponseWriter, allowed bool, reason string) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(EnforcementResponse{
		Allowed: allowed,
		Reason:  reason,
	})
}

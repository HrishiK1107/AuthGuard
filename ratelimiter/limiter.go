package main

// EnforceRequest checks if an entity is allowed right now
func EnforceRequest(entity string) (bool, string) {

	// Check if entity is blocked
	if isBlocked(entity) {
		return false, "entity is currently blocked"
	}

	// Allowed by default
	return true, "allowed"
}

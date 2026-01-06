package main

import (
	"sync"
	"time"
)

// BlockEntry represents a blocked entity with expiry
type BlockEntry struct {
	ExpiresAt time.Time
}

// BlockStore holds blocked entities safely
type BlockStore struct {
	mu     sync.RWMutex
	blocks map[string]BlockEntry
}

// Global in-memory store
var store = NewBlockStore()

// Create a new block store
func NewBlockStore() *BlockStore {
	return &BlockStore{
		blocks: make(map[string]BlockEntry),
	}
}

// Block an entity for a duration
func blockEntity(entity string, duration time.Duration) {
	store.mu.Lock()
	defer store.mu.Unlock()

	store.blocks[entity] = BlockEntry{
		ExpiresAt: time.Now().Add(duration),
	}
}

// Check if an entity is currently blocked
func isBlocked(entity string) bool {
	store.mu.RLock()
	entry, exists := store.blocks[entity]
	store.mu.RUnlock()

	if !exists {
		return false
	}

	// If expired, clean it up
	if time.Now().After(entry.ExpiresAt) {
		store.mu.Lock()
		delete(store.blocks, entity)
		store.mu.Unlock()
		return false
	}

	return true
}

package main

import (
	"sync"
	"time"
)

// TokenBucket represents a rate limiter for one entity
type TokenBucket struct {
	capacity   int
	tokens     int
	refillRate int // tokens per second
	lastRefill time.Time
	mu         sync.Mutex
}

// BucketStore holds token buckets per entity
type BucketStore struct {
	mu      sync.Mutex
	buckets map[string]*TokenBucket
}

// Global bucket store
var bucketStore = NewBucketStore()

// Create bucket store
func NewBucketStore() *BucketStore {
	return &BucketStore{
		buckets: make(map[string]*TokenBucket),
	}
}

// Get or create bucket for entity
func (bs *BucketStore) getBucket(entity string, capacity int, refillRate int) *TokenBucket {
	bs.mu.Lock()
	defer bs.mu.Unlock()

	if bucket, exists := bs.buckets[entity]; exists {
		return bucket
	}

	bucket := &TokenBucket{
		capacity:   capacity,
		tokens:     capacity,
		refillRate: refillRate,
		lastRefill: time.Now(),
	}

	bs.buckets[entity] = bucket
	return bucket
}

// AllowRequest checks and consumes a token
func (b *TokenBucket) AllowRequest() bool {
	b.mu.Lock()
	defer b.mu.Unlock()

	now := time.Now()
	elapsed := now.Sub(b.lastRefill).Seconds()

	// Refill tokens
	refill := int(elapsed * float64(b.refillRate))
	if refill > 0 {
		b.tokens = min(b.capacity, b.tokens+refill)
		b.lastRefill = now
	}

	// Consume token if available
	if b.tokens > 0 {
		b.tokens--
		return true
	}

	return false
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

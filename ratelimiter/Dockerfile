# Phase 8.2 — Go Ratelimiter Dockerfile

FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o ratelimiter

# ---- Runtime image ----
FROM alpine:3.19

WORKDIR /app
COPY --from=builder /app/ratelimiter .

EXPOSE 8081

CMD ["./ratelimiter"]

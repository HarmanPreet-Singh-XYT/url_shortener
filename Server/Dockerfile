# Build stage
FROM golang:latest AS build

WORKDIR /app

# Install git for Go modules if needed
# RUN apk add --no-cache git

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . .

RUN go build -o main .

# Final stage
FROM alpine:latest

RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY --from=build /app/main .
# Required for autocert
VOLUME ["/certs"]

EXPOSE 443
EXPOSE 80

CMD ["./main"]

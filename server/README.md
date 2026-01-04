# Epoch Share Server

Express.js server for sharing epoch data via Upstash Redis.

## Features

- Health check endpoint
- Export data to Redis with shareable codes
- Import data using codes
- Secure code hashing with bcrypt
- Rate limiting
- Comprehensive logging

## Setup

1. Install dependencies:

```bash
cd server
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` and add your Upstash Redis credentials:

```
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
HASH_SECRET=your_secret
```

3. Start the server:

```bash
npm run dev      # Development mode with hot reload
npm run build    # Build for production
npm start        # Run production build
```

## API Endpoints

### Health Check

```
GET /api/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "redis": "connected"
}
```

### Export Data

```
POST /api/data/export
```

Body:

```json
{
  "data": { ... }
}
```

Response:

```json
{
  "code": "aB3dE7fG",
  "expiresAt": "2024-01-08T00:00:00.000Z"
}
```

### Import Data

```
POST /api/data/import
```

Body:

```json
{
  "code": "aB3dE7fG"
}
```

Response:

```json
{
  "data": { ... }
}
```

## Project Structure

```
server/
├── src/
│   ├── config/         # Configuration (Redis, env)
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   └── utils/          # Utilities
├── .env.example
├── package.json
└── tsconfig.json
```

## Security

- Helmet for security headers
- Rate limiting (100 req/15min)
- Code hashing with bcrypt
- Input validation
- Error handling

# Environment Setup

## .env.local (Required)

Create a `.env.local` file in the project root with all runtime secrets:

```
# Database - Local PostgreSQL Docker Container
DATABASE_URL="postgresql://postgres:password@localhost:5432/trading_journal"

# Application URL
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"

# OpenAI/DeepSeek Configuration
OPENAI_API_BASEURL="https://api.deepseek.com"
OPENAI_API_KEY="your-api-key-here"
OPENAI_MODEL="deepseek-chat"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-publishable-key-here"
CLERK_SECRET_KEY="your-secret-key-here"
```

create a `.env` file
```env
# Clerk Authentication (get from https://dashboard.clerk.com/)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Optional: Stripe (disabled by default)
# STRIPE_SECRET_KEY="sk_test_xxxxx"
# STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
# NEXT_PUBLIC_STRIPE_PRICE_ID="price_xxxxx"
```

> **Note**: When using Docker Compose, the `DATABASE_URL` is overridden to use `postgres` hostname.

Get your API keys from:
- DeepSeek: https://platform.deepseek.com/
- Clerk: https://dashboard.clerk.com/

---

## Option 1: Local Development (npm run dev)

Best for development with hot reloading.

### Steps

```bash
# 1. Start PostgreSQL container only
docker-compose up -d postgres

# 2. Wait for database to be ready (few seconds)

# 3. Install dependencies
npm install

# 4. Run database migrations
npm run db:push

# 5. Start development server
npm run dev
```

Open http://localhost:3000

### Stopping

```bash
# Stop the dev server with Ctrl+C, then:
docker-compose down
```

---

## Option 2: Docker Compose (Production-like)

Runs everything in containers.

### Prerequisites

Create a `.env` file (for Docker Compose build args):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### Steps

```bash
# 1. Build and start all containers
docker-compose up -d --build

# 2. Check containers are running
docker-compose ps

# 3. Run database migrations (first time only)
docker-compose exec app npm run db:push
```

Open http://localhost:3000

### Useful Commands

```bash
# View logs
docker-compose logs -f app

# Restart app after code changes
docker-compose up -d --build

# Stop all containers
docker-compose down

# Stop and remove data
docker-compose down -v
```

---

## Verify Database

```bash
# Check tables exist
docker-compose exec postgres psql -U postgres -d trading_journal -c "\dt"
```

Expected tables: `user`, `trades`, `journal`, `strategies`, `reports`, `feedbacks`, `transactions`

---

## Status

| Feature | Status |
|---------|--------|
| Database | ✅ PostgreSQL |
| AI Provider | ✅ DeepSeek |
| Authentication | ✅ Clerk |
| Payments | ❌ Disabled |
| Docker | ✅ Ready |


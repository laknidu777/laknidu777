# Portfolio & CMS Web Application

Production-ready personal portfolio and administrative CMS built with Next.js (App Router, Standalone Output), PostgreSQL, Prisma 7, and NextAuth v5.

---

## 🛠️ Technology Stack & Architecture

- **Framework**: Next.js 16 (App Router, Server Components & Server Actions)
- **Runtime**: Node.js 20 LTS (Alpine Linux containerization)
- **Database**: PostgreSQL 17 (accessed via `@prisma/adapter-pg` and Prisma 7 ORM)
- **Authentication**: NextAuth.js v5 (JWT session strategy, bcryptjs password hashing)
- **Email Delivery**: Nodemailer (SMTP transport with safe dev fallback)
- **Styling**: Tailwind CSS v4, Lucide React icons, Framer Motion

---

## 📋 Prerequisites

- **Node.js**: `v20.x` or higher (LTS recommended)
- **npm**: `v10.x` or higher
- **Docker**: Docker Engine 24+ & Docker Compose v2+
- **PostgreSQL**: Version 16 or 17 (if running outside Docker)

---

## ⚙️ Environment Configuration

Environment configuration is isolated between the root Compose configuration and the Next.js runtime.

### 1. Application Configuration (`my-profile/.env`)

Copy the example template to create your local `.env`:

```bash
cd my-profile
cp .env.example .env
```

| Variable | Description | Required | Default / Safe Fallback |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | **Yes** | `postgresql://...` |
| `AUTH_SECRET` | 32+ char secret for JWT and session encryption | **Yes (Prod)** | Dev fallback in development |
| `NEXTAUTH_URL` | Canonical origin for auth redirects | No | `http://localhost:3000` |
| `PORT` | HTTP server listening port | No | `3000` |
| `HOSTNAME` | Network host interface binding | No | `0.0.0.0` |
| `SMTP_HOST` | SMTP server hostname | No | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port (465 SSL / 587 TLS) | No | `465` |
| `SMTP_SECURE` | Enable SSL/TLS (`true`/`false`) | No | `true` |
| `SMTP_USER` | SMTP authentication username / email | No | `""` |
| `SMTP_PASS` | SMTP app password | No | `""` |
| `SMTP_FROM` | Sender address header | No | `Portfolio Admin <...>` |

> **Security Note**: In development without SMTP credentials, OTP codes are logged exclusively to the local server console. In production (`NODE_ENV=production`), secrets and OTP codes are strictly suppressed from logs and API responses.

---

## 🚀 Quick Start (Local Development)

### 1. Start PostgreSQL with Docker Compose

From the repository root:

```bash
docker compose up -d postgres
```

Postgres will be healthy on `127.0.0.1:5433` (bound to localhost for security).

### 2. Install Dependencies & Generate Prisma Client

```bash
cd my-profile
npm ci
npm run prisma:generate
```

### 3. Apply Migrations & Seed Database (Optional)

```bash
npm run prisma:migrate
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing, Linting & Type Checking

Run all verification checks locally:

```bash
# Run unit and integration tests (Node.js test runner via tsx)
npm test

# Run TypeScript compilation check
npm run typecheck

# Run ESLint check
npm run lint
```

---

## 🐳 Production Containerization (Docker)

### 1. Build Production Docker Image

Build the multi-stage standalone runner image:

```bash
docker build -t my-profile:latest ./my-profile
```

### 2. Run Production Container

Run the standalone container:

```bash
docker run -d \
  --name my-profile-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://profile_user:local_dev_password@host.docker.internal:5433/myprofile" \
  -e AUTH_SECRET="your-secure-production-secret-min-32-chars" \
  my-profile:latest
```

### 3. Verify Container Health & Status

```bash
# Check container status (should display healthy)
docker ps --filter "name=my-profile-app"

# Inspect application logs
docker logs my-profile-app

# Probe health endpoint
curl -i http://localhost:3000/api/health
```

---

## 🏗️ Full Stack Deployment with Docker Compose

Start both PostgreSQL and the production application with health-dependent startup:

```bash
# Start all services in production mode
docker compose up -d --build

# Inspect running services
docker compose ps

# View service logs
docker compose logs -f my-profile
```

To run the development container with live code reload:

```bash
docker compose --profile dev up -d
```

---

## 🔍 Health Check & Monitoring API

The application exposes a production-ready health monitoring endpoint:

- **Liveness probe**: `GET /api/health?liveness=true`
  - Validates process responsiveness and uptime.
  - Returns HTTP `200` with status `"alive"`.
- **Readiness probe**: `GET /api/health`
  - Validates active database connectivity and query latency.
  - Returns HTTP `200` with `{"status": "healthy", "database": {"status": "connected", "latencyMs": ...}}`.
  - Returns HTTP `503` if the database is unreachable.

---

## 🛡️ Security Audit & Hardening Notes

1. **Non-Root Execution**: Container runs under unprivileged system user `nextjs` (UID 1001).
2. **Minimal Image Layers**: Multi-stage build leverages Next.js `output: "standalone"`, reducing runtime dependencies to production essentials.
3. **Sensitive Data Protection**: Real `.env` files and `.git` repository metadata are strictly excluded via `.dockerignore` and `.gitignore`.
4. **Local Port Binding**: PostgreSQL port `5433` is restricted to `127.0.0.1` preventing exposure to public host interfaces.
5. **No Secret Leaks**: OTP tokens and credentials are encrypted, sanitized, and never output in API payload messages or production logs.

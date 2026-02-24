# Bond Assignment - Account Management System

A RESTful API for managing banking accounts, built with NestJS, TypeScript, TypeORM, and PostgreSQL.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment](#3-configure-environment)
  - [4. Start the Database](#4-start-the-database)
  - [5. Run the Server](#5-run-the-server)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
  - [Health](#health)
  - [Person](#person)
  - [Account](#account)
- [Swagger API Docs](#swagger-api-docs)
- [pgAdmin](#pgadmin)
- [Available Scripts](#available-scripts)

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Docker](https://www.docker.com/) & Docker Compose
- npm (comes with Node.js)

---

## Project Structure

```
src/
├── api/
│   ├── health/
│   │   ├── controllers/
│   │   │   └── health.controller.ts
│   │   ├── services/
│   │   │   └── health.service.ts
│   │   ├── responses/
│   │   │   └── health.response.ts
│   │   ├── tests/
│   │   │   └── health.controller.spec.ts
│   │   └── health.module.ts
│   ├── person/
│   │   ├── controllers/
│   │   │   └── person.controller.ts
│   │   ├── services/
│   │   │   └── person.service.ts
│   │   ├── dto/
│   │   │   └── create-person.dto.ts
│   │   ├── responses/
│   │   │   └── person.response.ts
│   │   ├── tests/
│   │   │   ├── person.controller.spec.ts
│   │   │   └── person.service.spec.ts
│   │   └── person.module.ts
│   └── account/
│       ├── controllers/
│       │   └── account.controller.ts
│       ├── services/
│       │   ├── account.service.ts
│       │   └── transaction.service.ts
│       ├── dto/
│       │   ├── create-account.dto.ts
│       │   ├── deposit.dto.ts
│       │   ├── withdraw.dto.ts
│       │   └── statement-query.dto.ts
│       ├── responses/
│       │   └── account.response.ts
│       ├── tests/
│       │   ├── account.controller.spec.ts
│       │   ├── account.service.spec.ts
│       │   └── transaction.service.spec.ts
│       └── account.module.ts
├── database/
│   ├── entities/
│   │   ├── person.entity.ts
│   │   ├── account.entity.ts
│   │   ├── account-transaction.entity.ts
│   │   └── index.ts
│   └── database.module.ts
├── app.module.ts
└── main.ts
```

Each API module follows a consistent structure:

- **controllers/** -- HTTP request handlers
- **services/** -- business logic
- **dto/** -- request validation schemas
- **responses/** -- response type interfaces
- **tests/** -- unit tests

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Bond-Assignment
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the project root (a default is already provided):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=bond_user
DB_PASSWORD=bond_pass
DB_NAME=bond_db
```

### 4. Start the Database

```bash
docker compose up -d
```

This starts two containers:

- **PostgreSQL** on port `5432`
- **pgAdmin** on port `5050` (see [pgAdmin](#pgadmin) section)

Verify the containers are running:

```bash
docker compose ps
```

### 5. Run the Server

```bash
npm run start:dev
```

The API will be available at **http://localhost:3000**.

Swagger docs will be available at **http://localhost:3000/api/docs**.

Tables are created automatically on startup via TypeORM's `synchronize` option.

---

## Database Schema

### Person

| Column     | Type         | Constraints        |
| ---------- | ------------ | ------------------ |
| person_id  | int          | PK, auto-increment |
| name       | varchar(255) | not null           |
| document   | varchar(50)  | not null, unique   |
| birth_date | date         | not null           |

### Account

| Column                 | Type          | Constraints            |
| ---------------------- | ------------- | ---------------------- |
| account_id             | int           | PK, auto-increment     |
| person_id              | int           | FK -> person, not null |
| balance                | decimal(16,2) | default 0              |
| daily_withdrawal_limit | decimal(16,2) | not null               |
| active_flag            | boolean       | default true           |
| account_type           | smallint      | not null               |
| create_date            | timestamp     | auto-generated         |

### Account Transaction

| Column         | Type          | Constraints             |
| -------------- | ------------- | ----------------------- |
| transaction_id | int           | PK, auto-increment      |
| account_id     | int           | FK -> account, not null |
| value          | decimal(16,2) | not null                |
| create_date    | timestamp     | auto-generated          |

**Relationships:** Person (1) -> (N) Account (1) -> (N) AccountTransaction

Cascade delete is enabled: deleting a person removes all associated accounts and transactions.

---

## API Reference

### Health

#### Health Check

```
GET /health
```

```bash
curl http://localhost:3000/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```

**Responses:**

- `200` -- Service is healthy

---

### Person

#### Create a Person

```
POST /persons
```

```bash
curl -X POST http://localhost:3000/persons \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "document": "123456789", "birthDate": "1990-05-15"}'
```

**Response:**

```json
{
  "personId": 1,
  "name": "John Doe",
  "document": "123456789",
  "birthDate": "1990-05-15"
}
```

**Responses:**

- `201` -- Person created successfully
- `409` -- Person with this document already exists

---

### Account

#### Create an Account

```
POST /accounts
```

```bash
curl -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -d '{"personId": 1, "balance": 1000.00, "dailyWithdrawalLimit": 500.00, "accountType": 1}'
```

**Response:**

```json
{
  "accountId": 1,
  "personId": 1,
  "balance": 1000.0,
  "dailyWithdrawalLimit": 500.0,
  "activeFlag": true,
  "accountType": 1,
  "createDate": "2026-02-24T12:00:00.000Z"
}
```

**Responses:**

- `201` -- Account created successfully
- `404` -- Person not found

---

#### Get Balance

```
GET /accounts/:accountId/balance
```

```bash
curl http://localhost:3000/accounts/1/balance
```

**Response:**

```json
{
  "accountId": 1,
  "balance": 1000.0
}
```

**Responses:**

- `200` -- Balance retrieved
- `404` -- Account not found

---

#### Deposit

```
POST /accounts/:accountId/deposit
```

```bash
curl -X POST http://localhost:3000/accounts/1/deposit \
  -H "Content-Type: application/json" \
  -d '{"value": 250.00}'
```

**Response:**

```json
{
  "accountId": 1,
  "personId": 1,
  "balance": 1250.0,
  "dailyWithdrawalLimit": 500.0,
  "activeFlag": true,
  "accountType": 1,
  "createDate": "2026-02-24T12:00:00.000Z"
}
```

**Responses:**

- `201` -- Deposit successful
- `400` -- Account is inactive
- `404` -- Account not found

---

#### Withdraw

```
POST /accounts/:accountId/withdraw
```

```bash
curl -X POST http://localhost:3000/accounts/1/withdraw \
  -H "Content-Type: application/json" \
  -d '{"value": 100.00}'
```

**Response:**

```json
{
  "accountId": 1,
  "personId": 1,
  "balance": 900.0,
  "dailyWithdrawalLimit": 500.0,
  "activeFlag": true,
  "accountType": 1,
  "createDate": "2026-02-24T12:00:00.000Z"
}
```

**Responses:**

- `201` -- Withdrawal successful
- `400` -- Account is inactive / Insufficient balance / Daily withdrawal limit exceeded
- `404` -- Account not found

**Business rules:**

- The account must be active
- The account must have sufficient balance
- The withdrawal must not exceed the daily withdrawal limit (sum of all withdrawals for the current day)

---

#### Block Account

```
POST /accounts/:accountId/block
```

```bash
curl -X POST http://localhost:3000/accounts/1/block
```

**Response:**

```json
{
  "accountId": 1,
  "personId": 1,
  "balance": 1000.0,
  "dailyWithdrawalLimit": 500.0,
  "activeFlag": false,
  "accountType": 1,
  "createDate": "2026-02-24T12:00:00.000Z"
}
```

**Responses:**

- `201` -- Account blocked successfully
- `400` -- Account is already blocked
- `404` -- Account not found

Once blocked, deposits and withdrawals are rejected.

---

#### Account Statement

```
GET /accounts/:accountId/statement
```

**Optional query parameters:**

| Parameter  | Format       | Description            |
| ---------- | ------------ | ---------------------- |
| `fromDate` | `YYYY-MM-DD` | Start date (inclusive) |
| `toDate`   | `YYYY-MM-DD` | End date (inclusive)   |

```bash
# All transactions
curl http://localhost:3000/accounts/1/statement

# Filter by date range
curl "http://localhost:3000/accounts/1/statement?fromDate=2026-01-01&toDate=2026-01-31"

# Filter from a start date
curl "http://localhost:3000/accounts/1/statement?fromDate=2026-01-01"

# Filter up to an end date
curl "http://localhost:3000/accounts/1/statement?toDate=2026-02-28"
```

**Response:**

```json
[
  {
    "transactionId": 2,
    "accountId": 1,
    "value": -100.0,
    "transactionDate": "2026-02-24T14:30:00.000Z"
  },
  {
    "transactionId": 1,
    "accountId": 1,
    "value": 250.0,
    "transactionDate": "2026-02-24T10:00:00.000Z"
  }
]
```

Transactions are ordered by date descending. Positive values are deposits, negative values are withdrawals.

**Responses:**

- `200` -- Statement retrieved
- `404` -- Account not found

---

## Swagger API Docs

Interactive API documentation is auto-generated using Swagger (OpenAPI).

**Access:** http://localhost:3000/api/docs

The Swagger UI provides:

- A visual overview of all available endpoints grouped by module (Health, Persons, Accounts)
- Request/response schemas with example values
- The ability to test endpoints directly from the browser
- Detailed descriptions of parameters, query strings, and status codes

> The server must be running (`npm run start:dev`) to access the docs.

---

## pgAdmin

pgAdmin is included in the Docker Compose setup for database administration.

**Access:** http://localhost:5050

**Login credentials:**

| Field    | Value            |
| -------- | ---------------- |
| Email    | `admin@bond.com` |
| Password | `admin`          |

**Adding the database server in pgAdmin:**

1. Right-click "Servers" -> "Register" -> "Server..."
2. **General** tab: set Name to `bond`
3. **Connection** tab:

| Field    | Value       |
| -------- | ----------- |
| Host     | `postgres`  |
| Port     | `5432`      |
| Username | `bond_user` |
| Password | `bond_pass` |

> Note: Use `postgres` as the host (Docker service name), not `localhost`.

---

## Available Scripts

| Command               | Description                       |
| --------------------- | --------------------------------- |
| `npm run start`       | Start the server                  |
| `npm run start:dev`   | Start in watch mode (development) |
| `npm run start:debug` | Start in debug mode with watch    |
| `npm run start:prod`  | Start in production mode          |
| `npm run build`       | Compile the project               |
| `npm run lint`        | Run ESLint with auto-fix          |
| `npm run format`      | Format code with Prettier         |
| `npm run test`        | Run unit tests                    |
| `npm run test:e2e`    | Run end-to-end tests              |
| `npm run test:cov`    | Run tests with coverage report    |

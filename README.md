# Teslo Shop API

REST API for a Tesla-branded clothing store, built with [NestJS](https://nestjs.com/), TypeORM and PostgreSQL.

It covers the full backend of a small e-commerce: product catalog with images, JWT authentication with role-based
authorization, image upload and serving, database seeding, and a real-time chat over WebSockets.

## Table of contents

- [Documentation](#documentation)
- [Deployment](#deployment)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [API reference](#api-reference)
  - [Auth](#auth)
  - [Products](#products)
  - [Files](#files)
  - [Seed](#seed)
- [Authentication and roles](#authentication-and-roles)
- [WebSocket gateway](#websocket-gateway)
- [Project structure](#project-structure)
- [Notes and troubleshooting](#notes-and-troubleshooting)

## Documentation

Interactive API documentation, in addition to the [API reference](#api-reference) below:

| Resource               | Link                                                       |
| ---------------------- | ---------------------------------------------------------- |
| **Postman collection** | https://documenter.getpostman.com/view/20192830/2sBY4VLdHj |
| **Fern documentation** | https://nestjs-teslo-shop.docs.buildwithfern.com           |

## Deployment

| Environment    | Link                                      |
| -------------- | ----------------------------------------- |
| **Production** | https://teslo-shop-backend.up.railway.app |

Remember to set `API_HOST` to the deployed URL so the image links returned by `/files/upload/product`
point to the right host, and `STAGE=prod` to enable SSL on the database connection.

## Tech stack

| Area            | Technology                                                      |
| --------------- | --------------------------------------------------------------- |
| Framework       | NestJS 11 (Express platform)                                    |
| Language        | TypeScript 5.7                                                  |
| Database        | PostgreSQL 14.3 (via Docker)                                    |
| ORM             | TypeORM (`@nestjs/typeorm`, `pg` driver)                        |
| Authentication  | JWT (`@nestjs/jwt`) + Passport (`passport-jwt`), bcrypt hashing |
| Validation      | class-validator + class-transformer                             |
| Real time       | Socket.IO (`@nestjs/websockets`)                                |
| File uploads    | Multer (memory storage) + uuid                                  |
| Package manager | pnpm                                                            |
| Tooling         | ESLint 9 (flat config), Prettier, Jest, Supertest               |

## Requirements

- **Node.js 20 or higher** (NestJS 11 requirement)
- **pnpm** — install it with `npm install -g pnpm` if you don't have it
- **Docker** and **Docker Compose** — used to run the PostgreSQL database locally

## Getting started

### 1. Clone the repository

```bash
git clone <repository-url>
cd 04-teslo-shop
```

### 2. Install the dependencies

```bash
pnpm install
```

### 3. Create the environment file

Copy the template and fill in the values:

```bash
cp .env.template .env
```

> **Important:** every value in `.env.template` is an example — replace them with your own. `JWT_SECRET` is
> intentionally left empty and **you must provide one**, otherwise the app fails to boot with
> `TypeError: JwtStrategy requires a secret or key`. Generate one with:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

See [Environment variables](#environment-variables) for the full list.

### 4. Start the database

```bash
docker compose up -d
```

This starts a `postgres:14.3` container named `teslo-db` on port `5432`, using the `DB_PASSWORD` and `DB_NAME`
values from your `.env` file. The data is persisted in the `./postgres` folder (git-ignored).

### 5. Run the application

```bash
# development with hot reload
pnpm start:dev
```

The API will be available at **http://localhost:3000/api**.

TypeORM runs with `synchronize: true`, so the tables are created automatically on the first boot —
no migrations are needed.

### 6. Seed the database

Populate the database with demo users and products:

```
GET http://localhost:3000/api/seed
```

This creates two users, both with the password `Abc123*`:

| Email            | Roles                         |
| ---------------- | ----------------------------- |
| `juan@gmail.com` | `user`, `admin`, `super-user` |
| `test@gmail.com` | `user`                        |

> ⚠️ The seed endpoint is **public and destructive**: it deletes every product and user before inserting the demo data.
> Never expose it in production.

## Environment variables

All variables live in `.env` at the root of the project. A ready-to-copy template is available in `.env.template`.

| Variable      | Description                                              | Example                     |
| ------------- | -------------------------------------------------------- | --------------------------- |
| `DB_HOST`     | Database host                                            | `localhost`                 |
| `DB_PORT`     | Database port                                            | `5432`                      |
| `DB_NAME`     | Database name (also used by Docker Compose to create it) | `teslo_shop`                |
| `DB_USERNAME` | Database user                                            | `postgres`                  |
| `DB_PASSWORD` | Database password (also used by Docker Compose)          | `123456`                    |
| `STAGE`       | Environment. When set to `prod`, TypeORM enables SSL     | `dev`                       |
| `PORT`        | Port the API listens on (defaults to `3000`)             | `3000`                      |
| `API_HOST`    | Public base URL, used to build the returned image URLs   | `http://localhost:3000/api` |
| `JWT_SECRET`  | **Required.** Secret used to sign and verify JWTs        | `<random string>`           |

> The Docker Compose file does not set `POSTGRES_USER`, so the container uses the default `postgres` user.
> Keep `DB_USERNAME=postgres` unless you change `docker-compose.yaml`.

## Available scripts

| Command            | Description                                     |
| ------------------ | ----------------------------------------------- |
| `pnpm start`       | Run the app                                     |
| `pnpm start:dev`   | Run in watch mode (recommended for development) |
| `pnpm start:debug` | Run in watch + debug mode                       |
| `pnpm build`       | Compile to `dist/`                              |
| `pnpm start:prod`  | Run the compiled build (`node dist/main`)       |
| `pnpm lint`        | Lint and auto-fix with ESLint                   |
| `pnpm format`      | Format `src/` and `test/` with Prettier         |
| `pnpm test`        | Run unit tests                                  |
| `pnpm test:watch`  | Run unit tests in watch mode                    |
| `pnpm test:cov`    | Run tests with coverage                         |
| `pnpm test:e2e`    | Run end-to-end tests                            |

## API reference

Every route is prefixed with `/api`. A global `ValidationPipe` is enabled with `whitelist` and
`forbidNonWhitelisted`, so **unknown properties in the body cause a `400 Bad Request`**.

### Auth

| Method | Endpoint             | Auth  | Description                                    |
| ------ | -------------------- | ----- | ---------------------------------------------- |
| `POST` | `/auth/register`     | —     | Register a new user and return an access token |
| `POST` | `/auth/login`        | —     | Sign in and return an access token             |
| `GET`  | `/auth/check-status` | Token | Validate the current token and renew it        |

**Register**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "email": "user@example.com", "password": "Abc123*", "fullName": "John Doe" }'
```

Password rules: 6–50 characters, and it must include an uppercase letter, a lowercase letter, a number and a symbol.

**Login**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "juan@gmail.com", "password": "Abc123*" }'
```

Both endpoints respond with the user data plus an `accessToken`, valid for **2 hours**.

### Products

| Method   | Endpoint          | Auth  | Description                                              |
| -------- | ----------------- | ----- | -------------------------------------------------------- |
| `GET`    | `/products`       | —     | Paginated list of products                               |
| `GET`    | `/products/:term` | —     | Find one product by **id (UUID)**, **slug** or **title** |
| `POST`   | `/products`       | Admin | Create a product                                         |
| `PATCH`  | `/products/:id`   | Admin | Update a product (transactional, replaces images)        |
| `DELETE` | `/products/:id`   | Admin | Delete a product                                         |

**Query parameters for `GET /products`**

| Parameter | Type   | Default | Description                 |
| --------- | ------ | ------- | --------------------------- |
| `limit`   | number | `10`    | Number of records to return |
| `offset`  | number | `0`     | Number of records to skip   |

```bash
curl "http://localhost:3000/api/products?limit=5&offset=0"
```

**Create a product**

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "title": "Men's Chill Crew Neck Sweatshirt",
    "description": "Introducing the Tesla Chill Collection.",
    "price": 75,
    "stock": 10,
    "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
    "gender": "men",
    "tags": ["sweatshirt"],
    "images": ["8529372-00-A_0_2000.jpg"]
  }'
```

| Field         | Required | Notes                                                      |
| ------------- | -------- | ---------------------------------------------------------- |
| `title`       | ✅       | Unique, minimum 1 character                                |
| `sizes`       | ✅       | Array of strings                                           |
| `gender`      | ✅       | One of `men`, `women`, `kids`, `unisex`                    |
| `slug`        | —        | Auto-generated from the title if omitted; lowercase-hyphen |
| `description` | —        | Free text                                                  |
| `price`       | —        | Positive number, defaults to `0`                           |
| `stock`       | —        | Positive integer, defaults to `0`                          |
| `tags`        | —        | Array of strings                                           |
| `images`      | —        | Array of image URLs / file names                           |

`UpdateProductDto` is a partial version of the same DTO — every field is optional. If `images` is sent,
the existing images are deleted and replaced inside a transaction.

### Files

| Method | Endpoint                   | Auth | Description                       |
| ------ | -------------------------- | ---- | --------------------------------- |
| `POST` | `/files/upload/product`    | —    | Upload a product image            |
| `GET`  | `/files/product/:fileName` | —    | Serve a previously uploaded image |

The form field must be named `file`, and only `png`, `jpeg`, `jpg` and `gif` are accepted.
Uploaded files are renamed to a UUID and stored under `uploads/products/`.

```bash
curl -X POST http://localhost:3000/api/files/upload/product \
  -F "file=@./my-image.jpg"
```

Response:

```json
{ "secureUrl": "http://localhost:3000/api/files/product/1f0c8e4a-....jpg" }
```

The URL is built from `API_HOST`, so make sure that variable matches how you serve the API.

### Seed

| Method | Endpoint | Auth | Description                                        |
| ------ | -------- | ---- | -------------------------------------------------- |
| `GET`  | `/seed`  | —    | Wipe the database and insert demo users + products |

## Authentication and roles

Protected routes expect a bearer token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

The token payload only carries the user `id`; the `JwtStrategy` loads the user from the database on every
request and rejects it if the user does not exist (`401`) or is inactive (`403`).

Authorization is handled by the composed `@Auth()` decorator, which bundles the Passport guard and the role guard:

```ts
@Auth()                  // any authenticated user
@Auth(UserRole.admin)    // only users whose roles include "admin"
```

Available roles: `admin`, `super-user`, `user`. New users get `['user']` by default.

## WebSocket gateway

The messaging module exposes a Socket.IO gateway on the **default namespace**, at the same host and port as the API
(`ws://localhost:3000`), with CORS enabled.

The connection is authenticated: the client must send a valid JWT in the handshake headers as `token`.
Invalid or missing tokens are disconnected immediately.

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  extraHeaders: { token: '<accessToken>' },
});
```

| Event                     | Direction       | Payload                  | Description                                      |
| ------------------------- | --------------- | ------------------------ | ------------------------------------------------ |
| `clients-updated`         | server → client | `string[]` of socket ids | Emitted whenever a client connects/disconnects   |
| `client-message-sent`     | client → server | `{ message: string }`    | Send a message to the room                       |
| `client-message-received` | server → client | `{ fullName, message }`  | Broadcast of a message to every connected client |

## Project structure

```
src/
├── main.ts                 # Bootstrap: global /api prefix and ValidationPipe
├── app.module.ts           # Root module: TypeORM config + feature modules
│
├── common/                 # Shared code
│   ├── dto/                # PaginationDto (limit / offset)
│   ├── helpers/            # handleTypeormError
│   └── utils/              # slugify
│
├── auth/                   # Authentication and authorization
│   ├── entities/           # User
│   ├── dto/                # CreateUserDto, SignInUserDto
│   ├── strategies/         # JwtStrategy
│   ├── guards/             # UserRoleGuard
│   ├── decorators/         # @Auth, @GetUser, @RoleProtected
│   ├── enums/              # UserRole
│   └── interfaces/         # JwtPayload
│
├── product/                # Product catalog
│   ├── entities/           # Product, ProductImage
│   └── dto/                # Create / Update / FindAllProducts
│
├── file/                   # Image upload and serving
│   ├── pipes/              # FileRenamerPipe
│   └── helpers/            # file filter, mime types
│
├── seed/                   # Database seeding
│   └── data/               # Demo users and products
│
└── messaging/              # Socket.IO gateway
    └── dto/                # ClientMessageDto
```

Other relevant folders:

- `uploads/` — uploaded product images, created automatically on the first upload
- `postgres/` — PostgreSQL data volume for the Docker container (git-ignored)
- `test/` — end-to-end test configuration

## Notes and troubleshooting

- **Boot fails with `TypeError: JwtStrategy requires a secret or key`.** `JWT_SECRET` is empty in your `.env`.
  Set a value and restart.
- **Port 5432 is already in use.** Another PostgreSQL instance is running. Stop it, or change the host port
  mapping in `docker-compose.yaml` and update `DB_PORT` accordingly.
- **Connection refused on startup.** The container needs a couple of seconds to accept connections. Check it is
  healthy with `docker compose ps` (or `docker ps`) before starting the API.
- **Changed the database credentials and it still fails.** The data folder is created on the container's first
  run. Stop the container, delete the `postgres/` folder, and start it again to recreate the database.
- **`synchronize: true` is enabled.** The schema follows the entities automatically, which is convenient in
  development but unsafe in production — switch to migrations before deploying.

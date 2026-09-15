# POS & E-Commerce Order System

Two related full-stack apps: a staff-facing POS system and a customer-facing storefront, both built around the same core problem — selling limited stock to concurrent buyers without overselling it, while a mock payment gateway randomly succeeds, fails, or times out.

- **01 - POS Order & Inventory System**: staff-facing product management + checkout.
- **02 - E-Commerce Checkout & Payment System**: customer-facing storefront with search, cart, checkout, and order history.

Both share the same backend design: row-locked stock transactions, a 5-minute reservation window, an idempotent mock payment step, and a single order-status state machine.

## Live Deployments

- **POS System** - https://pos-system-phi-ten.vercel.app/ 
- **E-Commerce Store** - https://customerapp-backend.vercel.app/

> Frontends are deployed on Vercel. Backend APIs run on Azure App Service (see `.github/workflows/main_pos-backend.yml` and `main_customerapp-backend.yml` — app names `pos-backend` and `customerapp-backend`). Each frontend's `VITE_API_BASE_URL` must point at its Azure backend URL, not at a Vercel URL.

**Repository:** https://github.com/Nuwantha97/pos-ecommerce-system

## Repository Structure

```
/task-01
  /pos-backend     Express + Sequelize API — deployed to Azure App Service
  /pos-frontend    React (Vite) staff dashboard — deployed to Vercel
/task-02
  /customer-backend   Express + Sequelize API — deployed to Azure App Service
  /customer-frontend  React (Vite) storefront — deployed to Vercel
```

## Tech Stack & Hosting

- **Backend:** Node.js, Express, Sequelize — hosted on **Azure App Service**
- **Database:** PostgreSQL via **Neon**, provisioned through the **Vercel Postgres integration**
- **Frontend:** React 19 + Vite — hosted on **Vercel**
- **GitHub Actions:** Deploys each backend folder to its own Azure Web App on push to `main`

### A note on the database + Azure combination

The Neon database was provisioned via Vercel's integration, but the backends that connect to it run on Azure not Vercel so the connection string isn't auto-injected the way it would be for a Vercel-hosted function. It has to be copied from the Vercel/Neon dashboard and set manually as an Azure App Service **Application Setting**:

1. Neon/Vercel dashboard → Storage → your Postgres database → copy the pooled connection string.
2. Azure Portal → your App Service (`pos-backend` / `customerapp-backend`) → Settings → Environment variables → add `POSTGRES_URL` with that value.
3. Neon requires SSL; `database.js` already sets `ssl: { require: true, rejectUnauthorized: false }`, so no extra config is needed there.

## The Core Problem This Solves

Selling limited stock is easy to get wrong under concurrency: two buyers load the same product, both see "2 left," and if the code just reads-checks-writes, both can succeed and the product goes negative.

This is handled with:

- **Row-level locking on checkout.** Product rows involved in an order are locked (`SELECT ... FOR UPDATE`) inside a transaction before stock is checked or decremented, and locked in a consistent ID order across items to avoid deadlocks. A second concurrent request waits for the first to finish — stock can't go negative.
- **Timed reservations.** Creating an order immediately deducts the requested stock and creates a `Reservation` with a 5-minute expiry.
- **Lazy + swept expiry.** Every read or write touching an order checks whether its reservation has expired and releases it on the spot, rather than relying on a `setTimeout` (which won't survive a serverless/cold-start environment). A background interval sweep also catches anything that expired with no requests hitting it.
- **A mock payment gateway with real consequences.** Payment resolves to success, failure, or timeout, each driving a specific status change (`paid` / `failed` / `expired`). Idempotency keys mean retrying a payment or double-submitting a checkout never creates a duplicate order or charge.
- **One state machine.** Every status change goes through a single `canTransition(from, to)` check — no scattered inline conditionals deciding what's allowed.

## POS Order & Inventory System

A staff-facing dashboard: manage the product catalog, build a cart, push it through checkout and mock payment.

**What it does**
- Full CRUD on products (name, price, stock, category, image)
- Cart → checkout flow that reserves stock for 5 minutes
- Mock payment modal — force a success, failure, or timeout outcome to demo the state machine live
- Order history with expandable detail and cancellation
- Duplicate order/payment protection via idempotency keys

**Backend setup**

```bash
cd task-01/pos-backend
npm install
```

`.env`:

```
POSTGRES_URL=postgres://<user>:<password>@<neon-host>/<database>?sslmode=require
PORT=3000
```

```bash
npm run db:init   # syncs tables — dev only, drops and recreates
npm run db:seed   # sample products, including low-stock ones for concurrency testing
npm run dev
```

**Frontend setup**

```bash
cd task-01/pos-frontend
npm install
```

`.env`:

```
VITE_API_BASE_URL=http://localhost:3000
```

```bash
npm run dev
```

**How to test the important parts**

- **Overselling:** pick a low-stock seed product (stock of 1–2) and fire concurrent checkout requests at it (two browser tabs, or a quick script against `POST /api/pos/checkout`). Only as many orders as there's stock for should succeed, and stock should never go negative.
- **Reservation expiry:** start a checkout, don't pay, wait 5 minutes. The order should flip to `expired` and its stock should come back — check via `GET /api/pos/orders/:id`, which triggers expiry on read.
- **Payment outcomes:** force each outcome in the payment modal and confirm the resulting status — `paid`, `failed`, `expired` — and that stock is released correctly for failure/timeout.
- **Duplicate submission:** resend the same checkout or payment request with the same idempotency key; it should return the original result, not create a second order or charge.
- **Cancellation:** cancel a `pending`/`reserved` order and confirm its stock is returned.

## E-Commerce Checkout & Payment System

A customer-facing storefront on the same backend patterns, with the parts a shopper actually touches: browsing, searching, checking out, and reviewing past orders.

**What it does**
- Product listing with search and category/price-range filtering
- Product detail page
- Cart and checkout with the same 5-minute reservation logic as Task 01
- Mock payment gateway (success / failure / timeout) with duplicate-payment protection
- Order cancellation and refund simulation for paid orders
- Order history scoped per customer, reflecting current status

**Backend setup**

```bash
cd task-02/customer-backend
npm install
```

`.env`:

```
POSTGRES_URL=postgres://<user>:<password>@<neon-host>/<database>?sslmode=require
PORT=3001
```

```bash
npm run dev
```

**Frontend setup**

```bash
cd task-02/customer-frontend
npm install
```

`.env`:

```
VITE_API_BASE_URL=http://localhost:3001
```

```bash
npm run dev
```

**How to test the important parts**

- **Search & filter:** search by name and combine with category + price range — results should reflect all active filters together.
- **Reservation + checkout:** add items, check out, and confirm stock drops immediately, before payment is attempted.
- **Overselling under load:** same concurrent-checkout test as Task 01 on a low-stock product.
- **Refunds:** pay for an order, then request a refund — it should move to `refunded` and correctly reverse the paid state.
- **Order history:** place a few orders in different end states (paid, cancelled, expired) and confirm the history view shows accurate current status for each.

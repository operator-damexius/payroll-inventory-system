# Payroll and Inventory Management System

Web-based Payroll and Inventory Management System — Academic / Capstone Project.

## Stack

- **Framework:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** JWT-based sessions (server-side)
- **Validation:** Zod
- **Deploy:** Vercel

## Project structure (per PRD v1.0)

```
src/
  app/            # Next.js App Router pages & route handlers (API)
  lib/            # MongoDB connection, auth helpers, utilities
  models/         # Mongoose models (User, Employee, Payroll, Payslip, Product, ...)
  types/          # TypeScript types
middleware.ts     # Route protection / role-based access
```

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Set `MONGODB_URI` to your MongoDB Atlas connection string, and change `JWT_SECRET` / `NEXTAUTH_SECRET` before deploying.

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

4. Build for production:

```bash
npm run build
npm start
```

5. (Optional) Seed the default admin account:

```bash
npx tsx scripts/seed.ts
```

Save the printed password — it is shown once and not stored anywhere recoverable.

## Database setup

Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas/), add a database user with read/write access, and add your IP (or `0.0.0.0/0` for development) to the network access list. Copy the connection string into `MONGODB_URI`.

## Security notes

- Never commit `.env` or expose `MONGODB_URI` / `JWT_SECRET` in browser code.
- Password hashing and authorization checks run server-side only.
- Review hosting limits (serverless execution, DB connection handling) before production deploy.

## Milestones (per PRD)

- Wk 3: Initialize project + MongoDB connection ← this setup
- Wk 4: Authentication & authorization
- Wk 5: Employee management
- Wk 6: Product & category management
- Wk 7: Stock movements & inventory reports
- Wk 8: Payroll rules & computation
- Wk 9: Payslips & payroll reports
- Wk 10: Dashboard & integration
- Wk 11: Testing & fixes
- Wk 12: Deployment & documentation

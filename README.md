# AuthShield

A security-first full-stack demo app showing:
- secure registration and login
- bcrypt password hashing
- JWT authentication
- role-based access control
- login rate limiting
- audit logging
- suspicious login monitoring and account locking

## Stack
- React + Vite + TypeScript
- Node.js + Express + TypeScript
- In-memory demo data store

## Local setup

### 1. Install dependencies
```bash
npm install
npm run install:all
```

### 2. Configure environment variables
Copy both example env files.

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Run the app
```bash
npm run dev
```

### 4. Open the app
- Frontend: http://localhost:5173
- Backend: http://localhost:4000/api/health

## Default admin account
- Email: admin@authshield.dev
- Password: Admin123!

## Notes
This starter uses an in-memory store so data resets whenever the backend restarts. That makes it easier to demo locally. The next upgrade is replacing the store with MySQL or Supabase/Postgres.

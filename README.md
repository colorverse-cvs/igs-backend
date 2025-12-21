# igs-backend
Ishita Gallery is an online gift shop where customers can explore and buy a variety of gifts. The website should be modern, user-friendly, and visually appealing. It must be dynamic, allowing easy updates to products and billing information.

## Quick start
- Copy `.env.example` to `.env` and edit.
- Install: `npm install`
- Run (dev): `npm run start:dev`

## Includes
- NestJS with TypeScript
- MongoDB via Mongoose
- Auth (JWT), Users, Products, Orders, Cart modules
- Dockerfile + docker-compose for MongoDB


## Prerequisites
- Node 18+ and npm
- MongoDB (local, Docker, or cloud)

## Setup
1. Copy env template:
   cp .env.example .env
   (Fill MONGO_URI, JWT_SECRET, etc.)
2. Install:
   npm ci

## Run (dev)
npm run start:dev

## Database Backup
A script is provided to back up the MongoDB database.

### Run Backup Manually
```bash
./scripts/backup-db.sh
```
The backups will be stored in the `backups/` directory with a timestamp.

### Automated Backups (Cron)
To schedule daily backups at 2 AM, add the following to your crontab:
```bash
0 2 * * * /path/to/igs-backend/scripts/backup-db.sh >> /path/to/igs-backend/backups/backup.log 2>&1
```

## Build & Run (production)
npm run build
npm start

## Process Management (PM2)
PM2 is used to manage the application process in production.

### Start with PM2
```bash
npm run pm2:start
```

### Other PM2 Commands
- **Stop**: `npm run pm2:stop`
- **Restart**: `npm run pm2:restart`
- **Logs**: `npm run pm2:logs`
- **Status**: `npm run pm2:status`

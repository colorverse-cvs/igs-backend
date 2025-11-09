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

## Build & Run (production)
npm run build
npm start

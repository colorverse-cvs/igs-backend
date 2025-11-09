FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm ci --production
COPY . .
RUN npm run build
CMD ["node", "dist/main.js"]

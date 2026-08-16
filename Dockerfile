# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
# No package-lock.json is committed yet (this is a fresh project - see
# README "Local setup" to generate one). Once you commit a lockfile,
# switch this to `COPY package.json package-lock.json ./` and `npm ci`
# for fully reproducible builds.
RUN npm install --no-audit --no-fund

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]

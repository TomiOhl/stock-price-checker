# --- STAGE 1: Build ---
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . . 

RUN npx prisma generate
RUN npm run build

# --- STAGE 2: Run ---
FROM node:24-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/prisma.config.ts ./

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]

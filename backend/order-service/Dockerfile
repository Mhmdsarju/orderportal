FROM node:18-alpine AS build
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY prisma ./prisma
COPY proto ./proto
COPY src ./src
RUN npx prisma generate && npm run build

FROM node:18-alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY prisma ./prisma
RUN npx prisma generate
COPY --from=build /app/dist ./dist
COPY --from=build /app/proto ./proto
EXPOSE 4002
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]

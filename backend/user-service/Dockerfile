FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY proto ./proto
COPY src ./src
RUN npm run build


FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/proto ./proto
EXPOSE 4001 50051
CMD ["node", "dist/server.js"]

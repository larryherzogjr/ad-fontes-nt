FROM node:22-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends python3 && rm -rf /var/lib/apt/lists/*
WORKDIR /workspace
COPY app/package*.json ./app/
RUN npm --prefix app ci
COPY . .
RUN npm run typecheck && npm run build

FROM node:22-bookworm-slim
ENV NODE_ENV=production PORT=3000
WORKDIR /workspace
COPY --from=build --chown=node:node /workspace/app/node_modules ./app/node_modules
COPY --from=build --chown=node:node /workspace/app/dist ./app/dist
COPY --from=build --chown=node:node /workspace/app/public ./app/public
COPY --from=build --chown=node:node /workspace/app/package.json ./app/package.json
COPY --from=build --chown=node:node /workspace/app/server/db.ts ./app/server/db.ts
COPY --from=build --chown=node:node /workspace/migrations ./migrations
COPY --from=build --chown=node:node /workspace/scripts/migrate.mts ./scripts/migrate.mts
USER node
EXPOSE 3000
CMD ["sh", "-c", "node scripts/migrate.mts && cd app && npm start -- --hostname 0.0.0.0"]

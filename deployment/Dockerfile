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
USER node
EXPOSE 3000
CMD ["sh", "-c", "cd app && npm start -- --hostname 0.0.0.0"]

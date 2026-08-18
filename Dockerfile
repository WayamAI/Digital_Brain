# syntax=docker/dockerfile:1

# Digital Brain — agentic IT operations platform.
#
# Two stages: the first installs the full dependency tree and runs the Vite /
# Nitro build; the second carries only `.output`, which Nitro emits as a
# self-contained server (dependencies are bundled, so no node_modules at
# runtime). Result is a small image with no build toolchain in it.

# ---------- stage 1: build ----------
FROM node:22-slim AS build

WORKDIR /app

# NODE_ENV is deliberately left unset. Setting it to `development` makes Vite
# emit react/jsx-dev-runtime calls while React resolves to the production
# runtime, and SSR then dies with "jsxDEV is not a function". `--include=dev`
# gets the build toolchain (vite, nitro, tailwind, the tanstack plugin) without
# touching NODE_ENV.

# Copy manifests first so the dependency layer caches independently of source.
COPY package.json package-lock.json ./
RUN npm ci --include=dev --no-audit --no-fund

COPY . .

# Emits .output/server (bundled server) and .output/public (static assets).
RUN npm run build


# ---------- stage 2: runtime ----------
FROM node:22-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0

# `node` is an unprivileged user that ships with the base image.
COPY --from=build --chown=node:node /app/.output ./.output

USER node

EXPOSE 8080

# Render overrides PORT; the Nitro node-server preset reads it.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", ".output/server/index.mjs"]

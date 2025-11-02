# syntax=docker/dockerfile:1.2

# --------------------
# Stage 1: build
# --------------------
FROM node:22-alpine AS builder

ARG OPTS=
ENV OPTS=${OPTS}
ENV NITRO_PORT=4000

WORKDIR /usr/src/app

# Copy only package files first
COPY package.json yarn.lock ./

# Install all dependencies for build (including devDeps)
RUN yarn install --frozen-lockfile

# Copy app source
COPY . .

# Copy secret (BuildKit secret)
RUN mkdir -p ./config/secrets
RUN --mount=type=secret,id=DB_PASSWORD_SECRET \
    cp /run/secrets/DB_PASSWORD_SECRET ./config/secrets/db_password_secret.txt

# Build Nuxt app
RUN DB_PASSWORD=$(cat ./config/secrets/db_password_secret.txt)_square-ov \
    DB_HOST=host.docker.internal \
    DB_PORT=3306 \
    DB_NAME=square-ov \
    DB_USER=square-ov \
    LOG_LEVEL=debug \
    yarn build

# --------------------
# Stage 2: runtime
# --------------------
FROM node:22-alpine AS runtime

WORKDIR /usr/src/app

ENV OPTS=${OPTS}
ENV NITRO_PORT=4000

# Copy built app from builder
COPY --from=builder /usr/src/app/.output ./
COPY --from=builder /usr/src/app/config/secrets ./config/secrets
COPY start.sh ./

# Optional: install MySQL client (alpine version)
RUN apk add --no-cache mysql-client

EXPOSE 4000

CMD ["./start.sh"]

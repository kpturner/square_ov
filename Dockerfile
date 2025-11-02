# syntax = docker/dockerfile:1.2

# Use a smaller base image
FROM node:22-alpine AS base

# Arguments and environment
ARG OPTS=
ENV OPTS=${OPTS}
ENV NITRO_PORT=4000

WORKDIR /usr/src/app

# Copy only package files first to leverage caching
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production

# Copy the rest of the source code
COPY . .

# Copy secret (using BuildKit secrets)
RUN mkdir -p ./config/secrets

RUN --mount=type=secret,id=DB_PASSWORD_SECRET \
    cp /run/secrets/DB_PASSWORD_SECRET ./config/secrets/db_password_secret.txt


# Build app
RUN DB_PASSWORD=$(cat ./config/secrets/db_password_secret.txt)_square-ov \
    DB_HOST=host.docker.internal \
    DB_PORT=3306 \
    DB_NAME=square-ov \
    DB_USER=square-ov \
    LOG_LEVEL=debug \
    yarn build

# Optional: Install MySQL client (alpine version is smaller)
RUN apk add --no-cache mysql-client

# Clean up build artifacts (optional)
RUN rm -rf ./.tmp

EXPOSE 4000

# Start command
CMD ["./start.sh"]

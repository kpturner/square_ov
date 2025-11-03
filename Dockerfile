# syntax = docker/dockerfile:1.2

# --------------------
# Stage 1: Build
# --------------------
FROM node:22 AS build-stage

ARG OPTS=

WORKDIR /usr/src/app

COPY . .

RUN mkdir -p ./config/secrets
RUN --mount=type=secret,id=DB_PASSWORD_SECRET \
    cp /run/secrets/DB_PASSWORD_SECRET ./config/secrets/db_password_secret.txt

RUN yarn install --frozen-lockfile

RUN DB_PASSWORD=$(cat ./config/secrets/db_password_secret.txt)_square-ov \
    DB_HOST=host.docker.internal \
    DB_PORT=3306 \
    DB_NAME=square-ov \
    DB_USER=square-ov \
    LOG_LEVEL=debug \
    yarn build

# --------------------
# Stage 2: Runtime
# --------------------
FROM node:22 AS final-stage

WORKDIR /usr/src/app

ENV OPTS=${OPTS}
ENV NITRO_PORT=4000

# Copy built output and minimal runtime files from build stage
COPY --from=build-stage /usr/src/app/.output ./.output
COPY --from=build-stage /usr/src/app/config/secrets ./config/secrets
COPY --from=build-stage /usr/src/app/start.sh ./start.sh
COPY --from=build-stage /usr/src/app/prisma ./prisma

# Create minimal package.json for prisma only
RUN echo '{ "dependencies": { "@prisma/client": "latest", "prisma": "latest" } }' > package.json

RUN yarn install --frozen-lockfile --production && \
    apt-get update && \
    apt-get install -y default-mysql-client && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 4000

CMD ["./start.sh"]

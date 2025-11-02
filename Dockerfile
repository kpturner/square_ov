# syntax = docker/dockerfile:1.2

FROM node:22-alpine

ARG OPTS=

WORKDIR /usr/src/app

# Bundle app source
COPY . .

RUN mkdir -p ./config/secrets

RUN --mount=type=secret,id=DB_PASSWORD_SECRET \
    cp /run/secrets/DB_PASSWORD_SECRET ./config/secrets/db_password_secret.txt

ENV OPTS=${OPTS}
ENV NITRO_PORT=4000

RUN yarn
RUN DB_PASSWORD=$(cat ./config/secrets/db_password_secret.txt)_square-ov \
    DB_HOST=host.docker.internal \
    DB_PORT=3306 \
    DB_NAME=square-ov \
    DB_USER=square-ov \
    LOG_LEVEL=debug \
    yarn build

RUN apt-get update
RUN apt-get install default-mysql-client -y

RUN rm -rf ./.tmp
RUN rm -rf node_modules

EXPOSE 4000

CMD ./start.sh ${OPTS}
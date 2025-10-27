# syntax = docker/dockerfile:1.2

FROM node:22

ARG OPTS=

WORKDIR /usr/src/app

# Bundle app source
COPY . .

RUN mkdir -p ./config/secrets

RUN --mount=type=secret,id=PASSWORD \
    cp /run/secrets/PASSWORD ./config/secrets/password.txt

RUN --mount=type=secret,id=DB_PASSWORD_SECRET \
    cp /run/secrets/DB_PASSWORD_SECRET ./config/secrets/db_password_secret.txt

ENV OPTS=${OPTS}
ENV NITRO_PORT=4000

RUN npm i
RUN DB_PASSWORD=$(cat ./config/secrets/db_password_secret.txt)_square-ov \
    DB_HOST=host.docker.internal \
    DB_PORT=3306 \
    DB_NAME=square-ov \
    DB_USER=square-ov \
    LOG_LEVEL=debug \
    npm run build

RUN apt-get update
RUN apt-get install default-mysql-client -y

RUN rm -rf ./.tmp

EXPOSE 4000

CMD ./start.sh ${OPTS}

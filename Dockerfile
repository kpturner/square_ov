# syntax = docker/dockerfile:1.2

FROM node:22

ARG OPTS=
ARG INSTANCE=unknown
ARG SOCIAL_MEDIA_LOGIN=false
ARG MANUAL_MODE=false

WORKDIR /usr/src/app

# Bundle app source
COPY . .

RUN mkdir -p ./config/secrets

RUN --mount=type=secret,id=PASSWORD \
    cp /run/secrets/PASSWORD ./config/secrets/password.txt

RUN --mount=type=secret,id=STRIPE_WEBHOOK_SECRET \
    cp /run/secrets/STRIPE_WEBHOOK_SECRET ./config/secrets/stripe_webhook_secret.txt

RUN --mount=type=secret,id=STRIPE_SECRET_KEY \
    cp /run/secrets/STRIPE_SECRET_KEY ./config/secrets/stripe_secret_key.txt

RUN --mount=type=secret,id=DB_PASSWORD_SECRET \
    cp /run/secrets/DB_PASSWORD_SECRET ./config/secrets/db_password_secret.txt

RUN --mount=type=secret,id=BREVO_API_KEY \
    cp /run/secrets/BREVO_API_KEY ./config/secrets/brevo_api_key.txt

RUN --mount=type=secret,id=SESSION_SECRET \
    cp /run/secrets/SESSION_SECRET ./config/secrets/session_secret.txt

ENV OPTS=${OPTS}
ENV INSTANCE=${INSTANCE}
ENV SOCIAL_MEDIA_LOGIN=${SOCIAL_MEDIA_LOGIN}
ENV NITRO_PORT=4000
ENV MANUAL_MODE=${MANUAL_MODE}

RUN yarn
RUN STRIPE_WEBHOOK_SECRET=$(cat ./config/secrets/stripe_webhook_secret.txt) \
    STRIPE_SECRET_KEY=$(cat ./config/secrets/stripe_secret_key.txt) \
    DB_PASSWORD=$(cat ./config/secrets/db_password_secret.txt)_se-mon \
    DB_HOST=host.docker.internal \
    DB_PORT=3306 \
    DB_NAME=se-mon \
    DB_USER=se-mon \
    BREVO_API_KEY=$(cat ./config/secrets/brevo_api_key.txt) \
    SESSION_SECRET=$(cat ./config/secrets/session_secret.txt) \
    LOG_LEVEL=debug \
    yarn build

RUN apt-get update
RUN apt-get install default-mysql-client -y

RUN rm -rf ./.tmp

EXPOSE 4000

CMD ./start.sh ${OPTS}

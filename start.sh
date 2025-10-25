#!/bin/bash

export DB_PASSWORD_SECRET=$(cat ./config/secrets/db_password_secret.txt)
export DB_PASSWORD="${DB_PASSWORD_SECRET}_se-mon"
export DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# The DB updates will not work on a container restart because we are about to remove the secrets but 
# we only need to work once per deployment
rm -rf ./config/secrets

# printenv && echo 'Ready!' && tail -f /dev/null
yarn prisma migrate deploy

node .output/server/index.mjs "$@"

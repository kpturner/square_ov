#!/bin/bash

# Run docker-compose for this repo

set -e

function usage {
    echo "Usage: ./docker.sh"
    echo "--install            | -i   [Install docker]"
    echo "--name               | -n   [square-ov(default)]"
    echo "--instance           | -t   [square-ov(default)]"
    echo "--image              | -m   [image for container to use (appended with -latest) (default=$instance)]"
    echo "--port               | -p   [4003(default)]"
    echo "--file               | -f   [docker-compose.yml(default)]"
    echo "--action             | -a   ['up'(default), 'down']"
    echo "--update             | -u   [Fetch updated docker images]"
    echo "--proxy              | -x   [Proxy host  https://ov.kpturner.co.uk(default)]"
}

name="square-ov"
file="docker-compose.yml"
action="up -d"
update=""
port=4003
pull=''
instance=square-ov
proxy=https://ov.kpturner.co.uk
redisPort=7000

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -n|--name) name="$2"; shift ;;
        -p|--port) port="$2"; shift ;;
        -f|--file) file="$2"; shift ;;
        -a|--action) action="$2"; shift ;;
        -x|--proxy) proxy="$2"; shift ;;
        -t|--instance) instance="$2"; shift ;;
        -m|--image) image="$2"; shift ;;
        -i|--install) install=1;;
        -u|--update) update=1;;
        *)
        echo "Unknown parameter passed: $1";
        usage;
        exit 1 ;;
    esac
    shift
done

if [[ $action == "up" ]]; then
    action="up -d"
fi

if [[ $action != "up -d" && $action != "down" ]]; then
    usage;
    exit 1;
fi

# -------------------------------------------------
# Detect docker compose command
# -------------------------------------------------
if docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
else
    echo "ERROR: Neither 'docker compose' nor 'docker-compose' found"
    exit 1
fi

echo "Using compose command: $COMPOSE_CMD"
echo "Docker compose file: $file"

export PORT=$port 
export NAME=$name 
export INSTANCE=$instance 
export PROXYHOST=$proxy 
export IMAGE=$image

echo "Running docker compose"
echo "Name: $name"
echo "Image: $image-latest"
echo "Port: $port"
echo "Instance: $instance"
echo "Proxy: $proxy"

if [[ $update ]]; then
    echo "Update Mode"
    $COMPOSE_CMD -p $name -f $file down --remove-orphans
    $COMPOSE_CMD -p $name -f $file pull
fi

if [[ $install ]]; then
    echo "Installing docker dependencies..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg

    echo "Installing Docker..."
    CHANNEL=stable sh -c "$(curl -fsSL get.docker.com)"

    echo "Enabling and starting Docker service..."
    sudo systemctl enable --now docker

    echo "Installing Docker Compose plugin..."
    sudo apt-get install -y docker-compose-plugin || true

    echo "Verifying installation..."
    docker --version
    docker compose version || true
fi

# -------------------------------------------------
# Run compose
# -------------------------------------------------
$COMPOSE_CMD -p $name -f $file $action

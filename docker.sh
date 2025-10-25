#!/bin/bash

# Run docker-compose for this repo

set -e

function usage {
    echo "Usage: ./docker.sh"
    echo "--install            | -i   [Install docker]"
    echo "--name               | -n   [se-mon(default)]"
    echo "--instance           | -t   [se-mon(default)]"
    echo "--image              | -m   [image for container to use (appended with -latest) (default=$instance)]"
    echo "--port               | -p   [4000(default)]"
    echo "--file               | -f   [docker-compose.yml(default)]"
    echo "--action             | -a   ['up'(default), 'down']"
    echo "--update             | -u   [Fetch updated docker images]"
    echo "--proxy              | -x   [Proxy host  https://squareevents.org(default)]"
    echo "--redis_port         | -rp  [Redis port  7000(default)]"
    echo "--manual_mode        | -mm  [Manual mode - Manual start for debugging]"
}

name="se-mon"
file="docker-compose.yml"
action="up -d"
update=""
port=4000
pull=''
instance=se-mon
proxy=https://monitor.squareevents.org
redisPort=7000

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -n|--name) name="$2"; shift ;;
        -p|--port) port="$2"; shift ;;
        -f|--file) file="$2"; shift ;;
        -n|--name) name="$2"; shift ;;
        -a|--action) action="$2"; shift ;;
        -x|--proxy) proxy="$2"; shift ;;
        -t|--instance) instance="$2"; shift ;;
        -m|--image) image="$2"; shift ;;
        -rp|--redis_port) redisPort="$2"; shift ;;
        -i|--install) install=1;;
        -u|--update) update=1;;
        -mm|--manual_mode) manual_mode=1;;
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

echo "Docker compose file: $file"

export PORT=$port 
export NAME=$name 
export INSTANCE=$instance 
export PROXYHOST=$proxy 
export REDIS_PORT=$redisPort 
export IMAGE=$image
export MANUAL_MODE=$manual_mode

echo "Running docker-compose"
echo "Name: $name"
echo "Image: $image-latest"
echo "Port: $port"
echo "Instance: $instance"
echo "Redis Port: $redisPort"
echo "Proxy: $proxy"
echo "Manual Mode: $manual_mode"

if [[ $update ]]; then
    echo Update Mode
    docker-compose  -p $name -f $file down --remove-orphans
    docker-compose  -p $name -f $file pull
fi

if [[ $install ]]; then
    echo "Installing docker dependencies..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg

    echo "Installing Docker..."
    CHANNEL=stable sh -c "$(curl -fsSL get.docker.com)"

    echo "Enabling and starting Docker service..."
    sudo systemctl enable --now docker

    echo "Installing Docker Compose..."
    DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
    mkdir -p $DOCKER_CONFIG/cli-plugins
    curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o $DOCKER_CONFIG/cli-plugins/docker-compose
    chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
    apt-get install docker-compose
    # Verify installation
    docker --version
    docker compose version
    docker-compose --version
fi

# Run docker-compose
docker-compose  -p $name -f $file $action

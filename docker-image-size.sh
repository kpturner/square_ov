#!/bin/sh
IMAGE=ghcr.io/kpturner/square-ov:square-ov-latest

docker pull $IMAGE
docker history $IMAGE 

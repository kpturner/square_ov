docker system prune -a -f
docker rm -v $(docker ps -a -q -f status=exited)
docker rmi -f  $(docker images -f "dangling=true" -q)
docker volume ls -qf dangling=true | xargs -r docker volume rm

#!/usr/bin/env bash

name="0xalig"
auth="$PWD/auth.json"

case $1 in
    build) docker build -t $name .;;
    logs) docker logs -tf $name;;
    restart) docker restart $name;;
    down) docker stop $name >/dev/null && docker rm $name >/dev/null;;
    local) docker run -it --rm --name $name -v $auth:/usr/src/app/auth.json $name;;
    status) docker ps -a | grep $name;;
    update)
        git pull &&
        docker build -t $name . &&
        docker stop $name >/dev/null &&
        docker rm $name >/dev/null &&
        docker run -it --rm --name $name -v $auth:/usr/src/app/auth.json $name
    ;;
    *) docker run -d --name $name -v $auth:/usr/src/app/auth.json $name;;
esac

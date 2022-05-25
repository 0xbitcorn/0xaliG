#!/usr/bin/env bash

name="0xcarl"
auth="$PWD/auth.json"

case $1 in
    build) docker build -t $name .;;
    logs) docker logs -tf $name;;
    restart) docker restart $name;;
    down) docker stop $name >/dev/null && docker rm $name >/dev/null;;
    local) docker run -it --rm --name $name -v $auth:/usr/src/app/auth.json $name;;
    *) docker run -d --name $name -v $auth:/usr/src/app/auth.json $name;;
esac

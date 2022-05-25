#!/usr/bin/env bash

name="0xalig"
auth="$PWD/auth.json"

run() {
    case $1 in
        temp) opt="-it --rm";;
        *) opt="-d";;
    esac
    docker run $opt --init --cap-add=SYS_ADMIN --restart unless-stopped --name $name -v $auth:/usr/src/app/auth.json $name node -e "`cat bot.js`"
}

case $1 in
    build) docker build -t $name .;;
    logs) docker logs -tf $name;;
    restart) docker restart $name;;
    stop) docker stop $name;;
    kill) docker docker rm -f $name >/dev/null;;
    local) run temp;;
    status) docker ps -a | grep $name;;
    update)
        git pull &&
        docker build -t $name . &&
        docker stop $name >/dev/null
        docker rm $name >/dev/null
        run
    ;;
    *) run;;
esac

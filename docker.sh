#!/usr/bin/env bash

name="0xalig"
auth="$PWD/auth.json"

usage() {
    echo "Usage: $0 [command]"
    echo
    echo "  commands:"
    echo "    start     | Run the bot normally"
    echo "    build     | Build new code"
    echo "    logs      | View logs of a running bot"
    echo "    restart   | Rstart the bot"
    echo "    stop      | Stop the bot"
    echo "    kill      | Kill and remove the bot container"
    echo "    local     | Run the container locally in a temporary state"
    echo "    status    | Get status of container from Docker"
    echo "    update    | Update code, rebuild, and restart the bot"
}

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
    start) run;;
    *) usage;;
esac

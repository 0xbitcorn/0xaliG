#!/usr/bin/env bash

name="0xalig"
auth="$PWD/auth.json"

usage() {
cat <<EOF

Usage: $0 [command]

  commands:
    start     | Run the bot normally
    build     | Build new code
    logs      | View logs of a running bot
    restart   | Restart the bot
    stop      | Stop the bot
    kill      | Kill and remove the bot container
    local     | Run the container locally in a temporary state
    status    | Get status of container from Docker
    update    | Update code, rebuild, and restart the bot

EOF
}

run() {
    case $1 in
        temp) opt="-it --rm";;
        *) opt="-d --restart always";;
    esac
    docker run $opt --init --cap-add=SYS_ADMIN --name $name -v $auth:/usr/src/app/auth.json $name node -e "`cat bot.js`"
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
        sleep 3
        run
    ;;
    start) run;;
    *) usage;;
esac

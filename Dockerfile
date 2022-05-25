FROM node:16 as node_modules
# Set workdir initially just for npm to install
WORKDIR /usr/src/app
# Install container pre-requisites
RUN apt-get -y update; \
    apt-get -y upgrade
#RUN apt-get -y install python3
# Install modules
ADD package*.json ./
RUN npm install --no-dev
# Install app files
ADD *.js ./

CMD [ "node", "bot.js" ]

FROM node:16-bullseye

ARG IPINFO_CONTAINER_PATH="/usr/share/nginx/html/tinyipinfo"
ENV IPINFO_CONTAINER_PATH $IPINFO_CONTAINER_PATH
ARG IPINFO_DB_PATH="data"
ENV IPINFO_DB_PATH $IPINFO_DB_PATH
ARG IPINFO_LOG_PATH="log"
ENV IPINFO_LOG_PATH $IPINFO_LOG_PATH

RUN apt-get -y update && apt-get -y install nginx iputils-ping vim
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

WORKDIR ${IPINFO_CONTAINER_PATH}

COPY . .

RUN npm config set python /usr/bin/python3 \
    && npm i \
    && mkdir ${IPINFO_LOG_PATH} \
    && mkdir ${IPINFO_DB_PATH}

ADD https://raw.githubusercontent.com/ipinfo/sample-database/main/IP%20Geolocation/ip_geolocation_sample.csv ${IPINFO_DB_PATH}/dataset.csv

RUN npm run server:build \
    && npm run migrations:up

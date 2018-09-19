FROM node:10-alpine

ENV WORKDIR=/app

RUN apk add --update ffmpeg && \
    rm -rf /var/cache/apk/* && \
    mkdir $WORKDIR && \
    cd $WORKDIR

EXPOSE 80

WORKDIR $WORKDIR

CMD ["yarn", "start"]

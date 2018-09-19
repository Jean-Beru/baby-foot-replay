FROM node:10-alpine

RUN apk add --update ffmpeg && \
    rm -rf /var/cache/apk/*

EXPOSE 80

WORKDIR /app

CMD ["yarn", "start"]

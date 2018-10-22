FROM node:10-slim

RUN apt-get update && \
    apt-get install -y gpac && \
    apt-get clean && \
    rm -r /var/lib/apt/lists/*

EXPOSE 80

WORKDIR /app

CMD ["yarn", "start"]

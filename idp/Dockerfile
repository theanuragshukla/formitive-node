FROM alpine

RUN apk add nodejs npm 

ARG PORT
ARG PG_URI
ARG REDIS_URI

ENV PORT $PORT
ENV PG_URI $PG_URI
ENV REDIS_URI $REDIS_URI

WORKDIR /app

COPY package*.json .
RUN npm i -g typescript
RUN npm ci

COPY . .

EXPOSE 8000

CMD [ "npm" , "start" ]

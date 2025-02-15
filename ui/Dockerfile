FROM node:latest AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

ARG REACT_APP_SERVER_URL
ARG REACT_APP_GOOGLE_ANALYTICS_ID

ENV REACT_APP_SERVER_URL=$REACT_APP_SERVER_URL
ENV REACT_APP_GOOGLE_ANALYTICS_ID=$REACT_APP_GOOGLE_ANALYTICS_ID

COPY . .
RUN npm run build

FROM nginx:latest

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/build/ /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


FROM node:latest AS node
RUN mkdir -p /tmp/app
WORKDIR /tmp/app

COPY package.json /tmp/app/
RUN npm install -g @angular/cli
RUN npm install
COPY . /tmp/app/
RUN ng build --prod

FROM nginx
COPY --from=node /tmp/app/dist/kubernetes-app /usr/share/nginx/html/
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]


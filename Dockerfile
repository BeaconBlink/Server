FROM node:20

WORKDIR /usr/app

COPY package*.json .

RUN npm install

COPY *.js .

EXPOSE 8080

CMD ["node", "app.js"]

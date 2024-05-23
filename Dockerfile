FROM node:20

WORKDIR /usr/app

COPY *.json .

RUN npm install && npm install typescript -g

COPY *.js .
COPY src/ src/
COPY public/ public/
COPY client/ client/

RUN tsc

EXPOSE 8080

CMD ["npm", "run", "start:dev"]

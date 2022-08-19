FROM node:carbon

WORKDIR /usr/src/app

RUN npm install -g nodemon

COPY ./rest-service/package*.json ./
RUN npm install

CMD ["npm", "start"]
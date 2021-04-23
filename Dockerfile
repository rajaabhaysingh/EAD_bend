FROM node:10
WORKDIR /wilswork_bend
COPY package.json .
RUN npm install
COPY . .
EXPOSE 8000
CMD node ./src/index.server.js
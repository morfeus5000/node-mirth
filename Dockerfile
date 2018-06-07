FROM node:8

WORKDIR /opt/hl7
COPY server.js /
COPY client.html /
COPY package.json /
RUN npm install
CMD [“node”, “server.js”]
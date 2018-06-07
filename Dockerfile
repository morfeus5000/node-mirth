FROM node:8

WORKDIR /opt/hl7
COPY server.js /
COPY index.html /
COPY package.json /
RUN npm install --production
CMD [“node”, “server.js”]
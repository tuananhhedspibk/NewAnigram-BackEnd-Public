FROM mhart/alpine-node:14

WORKDIR /usr/app/newanigram

COPY ./dist-server ./dist-server
COPY ./package.json ./package.json

RUN npm install --only=prod

EXPOSE 4000

CMD ["npm", "start"]

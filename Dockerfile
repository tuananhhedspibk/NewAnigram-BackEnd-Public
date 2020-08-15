FROM mhart/alpine-node:14

WORKDIR /usr/app/newanigram

COPY ./src ./src
COPY ./package.json ./
COPY ./tsconfig.json ./
COPY ./script.sh ./

EXPOSE 4000

CMD ["./script.sh"]

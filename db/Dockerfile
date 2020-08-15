FROM mongo:latest

COPY setup.js /docker-entrypoint-initdb.d/

ENV MONGO_INITDB_DATABASE=newanigram

EXPOSE 27017

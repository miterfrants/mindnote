FROM basic-image
WORKDIR /usr/share/mindnote/render
COPY ./package*.json ./
ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 12.7.0
ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH
ENV NODE_ENV prod
RUN apt-get update
RUN apt-get install -y build-essential
RUN npm update && npm install
COPY . .

CMD [ "/bin/bash", "-c", "nginx && node /usr/share/mindnote/render/index.js"]
EXPOSE 80

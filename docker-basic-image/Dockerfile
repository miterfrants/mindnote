FROM nginx
RUN apt-get update && apt-get install git vim zsh python curl -y
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
RUN git clone http://github.com/creationix/nvm.git "$HOME/.nvm"
RUN chmod -R 777 "$HOME/.nvm"
RUN bash /root/.nvm/install.sh
RUN bash -i -c "nvm install 12.7"

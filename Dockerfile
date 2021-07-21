FROM madnificent/ember:3.26.1
LABEL maintainer="jan-pieter.baert@hotmail.com"
ADD . /app

RUN "yarn install"

CMD ["ember", "server"]

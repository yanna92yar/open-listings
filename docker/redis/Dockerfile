FROM redis:7.0.3-alpine
WORKDIR /redis
COPY .conf /usr/local/etc/redis/redis.conf
COPY init.sh ./
RUN chmod +x init.sh
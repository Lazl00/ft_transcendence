FROM debian:bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

RUN rm -rf /etc/nginx/conf.d/default.conf

RUN mkdir -p /etc/nginx/ssl

COPY certificate/nginx.crt /etc/nginx/ssl/nginx.crt
COPY certificate/nginx.key /etc/nginx/ssl/nginx.key

COPY conf/default.conf /etc/nginx/conf.d/

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
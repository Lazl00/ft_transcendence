FROM debian:bookworm

RUN apt-get update && apt-get install -y nginx openssl && rm -rf /var/lib/apt/lists/*

RUN rm -rf /etc/nginx/conf.d/default.conf && mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=FR/L=Paris/O=42/CN=localhost"

COPY conf/default.conf /etc/nginx/conf.d/

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
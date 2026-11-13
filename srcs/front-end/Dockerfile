FROM node:22-alpine AS builder

WORKDIR /app 

COPY package*.json .    

RUN npm install

COPY . .

RUN npm run build

FROM debian:bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

RUN rm -rf /etc/nginx/conf.d/default.conf

RUN mkdir -p /etc/nginx/ssl

COPY nginx/certificate/nginx.crt /etc/nginx/ssl/nginx.crt
COPY nginx/certificate/nginx.key /etc/nginx/ssl/nginx.key

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx/conf/default.conf /etc/nginx/conf.d/

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
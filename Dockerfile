FROM nginx:alpine

RUN apk add --no-cache apache2-utils

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy static files
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Copy content directory
COPY content/ /usr/share/nginx/html/content/

# Create htpasswd file
RUN htpasswd -bc /etc/nginx/.htpasswd YousufBao Piston

# Custom nginx config with basic auth
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    auth_basic "Piston Solutions"; \
    auth_basic_user_file /etc/nginx/.htpasswd; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /content/ { \
        add_header Cache-Control "no-cache"; \
    } \
    location /api/ { \
        auth_basic off; \
        proxy_pass http://newspiston-api:5000/api/; \
        proxy_set_header Host $host; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

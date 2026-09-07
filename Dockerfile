# ---- Build ------------------------------------------------------------------
FROM node:24.3.0 AS build
WORKDIR /opt/gov-design-system
COPY package.json package-lock.json ./
RUN npm ci
RUN npm run build

# ---- Runtime ----------------------------------------------------------------
FROM nginx:1.31.3-alpine
COPY --from=build /opt/gov-design-system/dist/ /usr/share/nginx/html/

# Copy NginX configuration.
COPY ./docker/ /
RUN chmod +x /docker-entrypoint.d/40-enable-cors.sh

# Copy html content.
COPY ./html/ /usr/share/nginx/html/

# Apply patch to fix known issues.
COPY ./patch/ /usr/share/nginx/html/

# A regular expression to filter environment variable names passed to envsubst
# in the configuration templates` this enables NGINX_*.
ENV NGINX_ENVSUBST_FILTER=NGINX_

ENV NGINX_PORT=80
EXPOSE ${NGINX_PORT}

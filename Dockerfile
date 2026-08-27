FROM node:24.3.0 AS build
WORKDIR /opt/gov-design-system
COPY package.json package-lock.json ./
RUN npm ci
RUN npm run build

FROM nginx:1.31.3-alpine
COPY --from=build /opt/gov-design-system/dist/ /usr/share/nginx/html/
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./html/ /usr/share/nginx/html/

# Apply patch to fix known issues.
COPY ./patch/ /usr/share/nginx/html/

EXPOSE 80

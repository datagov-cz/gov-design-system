FROM node:24.3.0 AS build
WORKDIR /opt/gov-design-system
# We copy all as using only root package.json and package-lock.json
# would fail the npm ci command.
COPY ./ ./
RUN npm ci
RUN npx nx run core:build

FROM nginx:1.29.2
COPY --from=build /opt/gov-design-system/dist/serve/www/ /usr/share/nginx/html
EXPOSE 80

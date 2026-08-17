FROM node:24.3.0 AS build
WORKDIR /opt/gov-design-system
# Install dependencies.
COPY ./nx.json ./package.json ./package-lock.json ./.npmrc ./
COPY ./packages/core/package.json ./packages/core/
COPY ./packages/core-angular/package.json ./packages/core-angular/
COPY ./packages/core-react/package.json ./packages/core-react/
COPY ./packages/core-vue/package.json ./packages/core-vue/
COPY ./packages/docs/package.json ./packages/docs/
COPY ./packages/fonts/package.json ./packages/fonts/
COPY ./packages/icons/package.json ./packages/icons/
COPY ./packages/storybook/package.json ./packages/storybook/
COPY ./packages/styles/package.json ./packages/styles/
RUN npm ci
# Copy and build.
COPY ./ ./
RUN npx nx run core:build

FROM nginx:1.31.3-alpine
WORKDIR /usr/share/nginx/html/
# The "assets" directory contains "fonts", "icons" and "styles".
COPY --from=build /opt/gov-design-system/dist/serve/www/assets/ ./assets/
# The components "build" directory.
COPY --from=build /opt/gov-design-system/dist/serve/www/build/ /usr/share/nginx/html/assets/components/core
# Demo pages.
# The paths are for local build, so we need to update them for
COPY --from=build /opt/gov-design-system/dist/serve/www/index.html ./index.html
COPY --from=build /opt/gov-design-system/dist/serve/www/pages/ ./pages/

# Fix asset paths in demo pages to match the served directory layout.
RUN sed -i \
    -e "s|\./build/p.*.css|./assets/components/core/core.css|g" \
    -e "s|\.\./\.\./build/core\.esm\.js|./assets/components/core/core.esm.js|g" \
    -e "s|\.\./\.\./build/core\.js|./assets/components/core/core.js|g" ./index.html

RUN find ./pages -type f -exec sed -i \
    -e "s|\.\./assets/icons|../../assets/icons|g" \
    -e "s|\.\./\.\./build/core\.css|../../assets/components/core/core.css|g" \
    -e "s|\.\./\.\./build/core\.esm\.js|../../assets/components/core/core.esm.js|g" \
    -e "s|\.\./\.\./build/core\.js|../../assets/components/core/core.js|g" \
    -e "s|\.\./\.\./assets/icons|../../icons|g" \
    {} +

# Path NginX to support CORS.
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

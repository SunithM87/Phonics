# Tiny image: just Node + the `ws` dependency + server.js. The site content
# itself is NOT baked in here — it's bind-mounted at runtime (see
# deploy/docker-compose.yml) so editing assets/data.js on the NAS doesn't
# need a rebuild, just a browser refresh.
FROM node:20-alpine
WORKDIR /app
COPY server/package.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY server/server.js ./
EXPOSE 8000
CMD ["node", "server.js"]

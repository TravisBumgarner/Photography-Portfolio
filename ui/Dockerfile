FROM mhart/alpine-node:11 AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run bundle-ui

FROM mhart/alpine-node
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/public .
CMD ["serve", "-p", "8080", "-s", "."]
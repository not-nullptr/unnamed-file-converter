FROM oven/bun AS builder

WORKDIR /app

ARG PUB_HOSTNAME
ARG PUB_PLAUSIBLE_URL

ENV PUB_HOSTNAME=${PUB_HOSTNAME}
ENV PUB_PLAUSIBLE_URL=${PUB_PLAUSIBLE_URL}

COPY package.json ./

RUN bun install

COPY . ./

RUN bun run build

FROM oven/bun:alpine

WORKDIR /app

COPY --from=builder /app/build ./

EXPOSE 3000

CMD [ "bun", "run", "start" ]
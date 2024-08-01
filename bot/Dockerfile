FROM node:21 as deps
WORKDIR /app
COPY ./*.json .
RUN npm install

FROM node:21

RUN apt-get update -y
RUN npx playwright install-deps

RUN adduser bot

USER bot
ARG BROWSER=chromium
ENV BROWSER ${BROWSER}
RUN npx playwright install $BROWSER


COPY --from=deps /app/node_modules /home/bot/node_modules
COPY . /home/bot/
USER bot
CMD ["node", "/home/bot/index.js"]

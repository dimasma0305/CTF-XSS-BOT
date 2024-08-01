FROM node:21

RUN apt-get update -y
RUN npx playwright install-deps

RUN adduser bot

USER bot
ENV BROWSER=chromium
# ENV BROWSER=firefox
RUN npx playwright install $BROWSER

USER root
WORKDIR /home/bot
COPY ./*.json .
RUN npm install
COPY . .

USER bot
CMD ["node", "/home/bot/index.js"]

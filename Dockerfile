FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production

CMD ["npm", "start"]

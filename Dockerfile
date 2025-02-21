FROM node:18
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build
EXPOSE 8081
CMD ["npm", "install", "-g", "serve", "&&", "serve", "-s", "build", "-l", "8080"]
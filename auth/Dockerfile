FROM node:alpine

WORKdIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY ./ ./

CMD ["npm", "start"]
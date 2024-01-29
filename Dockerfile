# 기본 이미지
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# 소스 코드 복사
COPY . .

RUN npm run build

CMD ["npm", "start"]

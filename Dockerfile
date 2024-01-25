# 기본 이미지
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# 의존성 설치, lock으로 설치
RUN npm ci

# 소스 코드 복사
COPY . .

RUN npm run build

CMD ["npm", "start"]

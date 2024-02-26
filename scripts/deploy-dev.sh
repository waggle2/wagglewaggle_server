#!/bin/bash

REPOSITORY=~/wagglewaggle_server
DOCKER_COMPOSE_FILE=${REPOSITORY}/docker-compose.dev.yml
IMAGE_TAG=$(date '+%Y%m%d%H%M%S')

echo "> 프로젝트 폴더로 이동"
cd $REPOSITORY || exit 1

echo "> git pull"
git pull origin dev || exit 1

echo "> 소스코드 빌드 및 태그 지정"
docker-compose -f $DOCKER_COMPOSE_FILE build || exit 1
docker tag wagglewaggle_server-app_5001:latest wagglewaggle_server-app_5001:"$IMAGE_TAG"
docker tag wagglewaggle_server-app_5002:latest wagglewaggle_server-app_5002:"$IMAGE_TAG"

echo "> 현재 실행중인 컨테이너 확인"

#CURRENT_CONTAINER_ES=$(docker ps | grep es01)
CURRENT_CONTAINER_5001=$(docker ps --format "{{.Names}}" | grep "wagglewaggle_server-app_5001")
CURRENT_CONTAINER_5002=$(docker ps --format "{{.Names}}" | grep "wagglewaggle_server-app_5002")


echo "> ES가 꺼져 있으면 배포"

if [ -z "$CURRENT_CONTAINER_ES" ]; then
  docker-compose -f $DOCKER_COMPOSE_FILE up -d es01 || exit 1
  sleep 30
fi

echo "> 5001번 포트에 대한 배포"

if [ -n "$CURRENT_CONTAINER_5001" ]; then
    echo "> 실행 중인 5001번 포트의 컨테이너 중지"
    docker-compose -f $DOCKER_COMPOSE_FILE stop app_5001
    echo "> 5001번 포트의 컨테이너 삭제"
    docker-compose -f $DOCKER_COMPOSE_FILE rm -f app_5001
fi

echo "> 5001번 포트에 새 컨테이너 실행"
docker-compose -f $DOCKER_COMPOSE_FILE up -d app_5001 || exit 1


echo "> 5002번 포트에 대한 배포"

if [ -n "$CURRENT_CONTAINER_5002" ]; then
    echo "> 실행 중인 5002번 포트의 컨테이너 중지"
    docker-compose -f $DOCKER_COMPOSE_FILE stop app_5002
    echo "> 5002번 포트의 컨테이너 삭제"
    docker-compose -f $DOCKER_COMPOSE_FILE rm -f app_5002
fi

echo "> 5002번 포트에 새 컨테이너 실행"
docker-compose -f $DOCKER_COMPOSE_FILE up -d app_5002 || exit 1

echo "> 이전 이미지 삭제"
docker images | grep wagglewaggle_server-app | grep -v "$IMAGE_TAG" | awk '{print $3}' | xargs -r docker rmi

echo "> 배포 완료"

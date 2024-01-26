# !/bin/bash

REPOSITORY=/home/ubuntu/wagglewaggle_server
DOCKER_COMPOSE_FILE=${REPOSITORY}/docker-compose.prod.yml

echo "> 프로젝트 폴더로 이동"
cd $REPOSITORY

echo "> git pull"
git pull origin dev

echo "> 소스코드 빌드"
docker-compose -f $DOCKER_COMPOSE_FILE build || exit 1

echo "> 현재 실행중인 컨테이너 확인"

CURRENT_CONTAINER_5001=$(docker ps --format "{{.Names}}" | grep "wagglewaggle_server_app_5001")
CURRENT_CONTAINER_5002=$(docker ps --format "{{.Names}}" | grep "wagglewaggle_server_app_5002")


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

echo "> 배포 완료"
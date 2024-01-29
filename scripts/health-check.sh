HEALTH_CHECK_ENDPOINT=/api/v1/health-check

echo "> Health check for 5001번 포트"
curl -s http://localhost:5001$HEALTH_CHECK_ENDPOINT > /dev/null || exit 1

echo "> Health check for 5002번 포트"
curl -s http://localhost:5002$HEALTH_CHECK_ENDPOINT > /dev/null || exit 1

echo "> Health check complete"
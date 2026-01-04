#!/bin/bash

# SonarQube Docker Management Script

case "$1" in
  up)
    echo "Starting SonarQube..."
    docker-compose up -d
    echo "SonarQube is starting at http://localhost:9000"
    echo "Default credentials: admin / admin"
    echo "Wait 1-2 minutes for the server to be fully ready"
    ;;
  down)
    echo "Stopping SonarQube..."
    docker-compose down
    echo "SonarQube stopped"
    ;;
  restart)
    echo "Restarting SonarQube..."
    docker-compose restart
    echo "SonarQube restarted"
    ;;
  logs)
    docker-compose logs -f
    ;;
  status)
    docker-compose ps
    ;;
  clean)
    echo "Stopping and removing SonarQube containers and volumes..."
    docker-compose down -v
    echo "All SonarQube data removed"
    ;;
  *)
    echo "Usage: $0 {up|down|restart|logs|status|clean}"
    echo ""
    echo "Commands:"
    echo "  up      - Start SonarQube in background"
    echo "  down    - Stop SonarQube"
    echo "  restart - Restart SonarQube"
    echo "  logs    - View SonarQube logs"
    echo "  status  - Check SonarQube status"
    echo "  clean   - Stop and remove all containers and volumes (WARNING: deletes all data)"
    exit 1
    ;;
esac

.PHONY: build up down test logs clean deploy-k8s

# Default target
.DEFAULT_GOAL := help

# Variables
DOCKER_IMAGE = healthcare-service
DOCKER_TAG = latest
K8S_NAMESPACE = healthcare-service

## help: Display this help message
help:
	@echo "Available targets:"
	@echo "  build         - Build Docker image"
	@echo "  up            - Start services with docker-compose"
	@echo "  down          - Stop services"
	@echo "  test          - Run tests"
	@echo "  logs          - View application logs"
	@echo "  clean         - Clean up containers and volumes"
	@echo "  deploy-k8s    - Deploy to Kubernetes"
	@echo "  undeploy-k8s  - Remove from Kubernetes"

## build: Build Docker image
build:
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

## up: Start services with docker-compose
up:
	docker-compose up -d
	@echo "Services started. Health check: http://localhost:5000/health"

## down: Stop services
down:
	docker-compose down

## test: Run tests
test:
	pip install -r requirements.txt
	pip install pytest pytest-cov
	pytest tests/ -v --cov=. --cov-report=html

## logs: View application logs
logs:
	docker-compose logs -f app

## clean: Clean up containers and volumes
clean:
	docker-compose down -v
	docker system prune -f

## deploy-k8s: Deploy to Kubernetes
deploy-k8s:
	kubectl apply -f k8s/namespace.yaml
	kubectl apply -f k8s/configmap.yaml
	kubectl apply -f k8s/secret.yaml
	kubectl apply -f k8s/pvc.yaml
	kubectl apply -f k8s/db-deployment.yaml
	sleep 10
	kubectl apply -f k8s/deployment.yaml
	kubectl apply -f k8s/service.yaml
	kubectl apply -f k8s/ingress.yaml
	@echo "Deployment started. Check status with: kubectl get pods -n $(K8S_NAMESPACE)"

## undeploy-k8s: Remove from Kubernetes
undeploy-k8s:
	kubectl delete -f k8s/ingress.yaml
	kubectl delete -f k8s/service.yaml
	kubectl delete -f k8s/deployment.yaml
	kubectl delete -f k8s/db-deployment.yaml
	kubectl delete -f k8s/pvc.yaml
	kubectl delete -f k8s/secret.yaml
	kubectl delete -f k8s/configmap.yaml
	kubectl delete -f k8s/namespace.yaml

## dev: Run in development mode
dev:
	export FLASK_ENV=development && python app.py

## shell: Open shell in running container
shell:
	docker-compose exec app /bin/sh

## db-shell: Open PostgreSQL shell
db-shell:
	docker-compose exec db psql -U healthuser -d healthdb

.PHONY: help build up down logs migrate shell seed install clean deploy-prod tf_init tf_apply ssh

help:
	@echo "Propjection - Real Estate Projection Tool"
	@echo ""
	@echo "Available commands:"
	@echo "  make build          - Build Docker images"
	@echo "  make up             - Start services (docker-compose up -d)"
	@echo "  make down           - Stop services (docker-compose down)"
	@echo "  make logs           - Tail backend logs"
	@echo "  make migrate        - Run Django migrations"
	@echo "  make seed           - Load sample data"
	@echo "  make shell          - Open Django shell"
	@echo "  make install        - Install dependencies locally (for development)"
	@echo "  make clean          - Remove containers and volumes"
	@echo ""
	@echo "Quick start:"
	@echo "  make build && make up && make migrate && make seed"
	@echo "  Then visit http://localhost:5173"

build:
	docker-compose build

up:
	docker-compose up -d
	@echo ""
	@echo "Services starting..."
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:8000"
	@echo ""

down:
	docker-compose down

logs:
	docker-compose logs -f backend

migrate:
	docker-compose exec backend python manage.py migrate

seed:
	docker-compose exec backend python manage.py seed_sample

shell:
	docker-compose exec backend python manage.py shell

install:
	cd backend && python -m venv .venv && .venv/bin/pip install -r requirements.txt
	cd frontend && npm install

clean:
	docker-compose down -v
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete

test-api:
	curl http://localhost:8000/api/properties/

test-frontend:
	@echo "Frontend is running at http://localhost:5173"

deploy-prod:
	docker compose -f docker-compose.yml pull
	docker compose -f docker-compose.yml up -d --build

tf_init:
	terraform -chdir=infra init

tf_apply:
	terraform -chdir=infra init
	terraform -chdir=infra apply -auto-approve

tf_destroy:
	terraform -chdir=infra destroy -auto-approve
	
ssh:
	ssh -i ~/.ssh/id_rsa root@$$(terraform -chdir=infra output -raw droplet_ip)

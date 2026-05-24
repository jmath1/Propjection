.PHONY: help build up down logs migrate shell seed install clean test-api test-frontend deploy-plan deploy-infra deploy-frontend deploy-all deploy-logs

help:
	@echo "Propjection - Real Estate Projection Tool"
	@echo ""
	@echo "LOCAL DEVELOPMENT:"
	@echo "  make build          - Build Docker images"
	@echo "  make up             - Start services (docker-compose up -d)"
	@echo "  make down           - Stop services (docker-compose down)"
	@echo "  make logs           - Tail backend logs"
	@echo "  make migrate        - Run Django migrations"
	@echo "  make seed           - Load sample data"
	@echo "  make shell          - Open Django shell"
	@echo "  make install        - Install dependencies locally"
	@echo "  make clean          - Remove containers and volumes"
	@echo ""
	@echo "CLOUD DEPLOYMENT (DigitalOcean):"
	@echo "  make deploy-plan    - Review infrastructure changes"
	@echo "  make deploy-infra   - Deploy infrastructure (Spaces, CDN, App Platform)"
	@echo "  make deploy-frontend- Build & deploy frontend to CDN"
	@echo "  make deploy-all     - Complete deployment (infra + frontend)"
	@echo "  make deploy-logs    - View App Platform logs"
	@echo ""
	@echo "QUICK START (Local Dev):"
	@echo "  make build && make up && make migrate && make seed"
	@echo "  Then visit http://localhost:5173"

# ============================================================================
# LOCAL DEVELOPMENT
# ============================================================================

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

# ============================================================================
# CLOUD DEPLOYMENT (DigitalOcean)
# ============================================================================

deploy-plan:
	./deploy.sh plan

deploy-infra:
	./deploy.sh apply

deploy-frontend:
	./deploy.sh frontend

deploy-all:
	./deploy.sh all

deploy-logs:
	./deploy.sh logs

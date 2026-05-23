# Propjection

A full-stack web application for creating, saving, and analyzing real estate property income projections. Built with Django REST Framework, React, Vite, and Tailwind CSS.

## Features

- **Create & Manage Properties** — Add properties with basic information and save multiple projections per property
- **Flexible Projections** — Support for single-family homes, duplexes, triplexes, and multi-unit properties
- **Comprehensive Analysis** — Calculate:
  - Yearly income schedules (with unit-level rents and vacancy)
  - Operating expense projections
  - Mortgage amortization schedules
  - Equity growth and cap rates
  - Cash flow analysis and DSCR
  - Scenario analysis (Bull/Base/Bear cases)
  - Deal verdict metrics
- **Interactive Results** — View projections in tabular and charted formats
- **Scenario Planning** — Clone projections to explore "what-if" scenarios

## Quick Start

### Prerequisites
- Docker & Docker Compose, OR
- Python 3.11+, Node 20+, PostgreSQL 16

### With Docker (Recommended)

```bash
# Clone and navigate to project
cd Propjection

# Build and start services
make build && make up

# Run migrations
make migrate

# Load sample data (triplex from sample.xlsx)
make seed

# Open browser
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/api
```

### Without Docker (Local Development)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Set up database
python manage.py migrate
python manage.py seed_sample

# Run server
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

## Architecture

### Backend (Django REST Framework)
- **Models:** Property, Projection, RentalUnit
- **Calculator:** `ProjectionCalculator` — handles all financial math
- **API:** RESTful endpoints for CRUD operations + computed results
- **Database:** PostgreSQL (Docker) or SQLite (local dev)

### Frontend (React + Vite + Tailwind)
- **Pages:** Properties, Property Detail, Projection Form, Projection Results
- **State:** React hooks + Axios for API communication
- **Charts:** Recharts for visualization
- **Styling:** Tailwind CSS

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET, POST | `/api/properties/` | List / create properties |
| GET, PUT, DELETE | `/api/properties/{id}/` | Property CRUD |
| GET, POST | `/api/projections/` | List / create projections |
| GET, PUT, DELETE | `/api/projections/{id}/` | Projection CRUD |
| GET | `/api/projections/{id}/results/` | Get computed projection data |
| GET | `/api/projections/{id}/scenarios/` | Bull/Base/Bear scenarios |
| GET | `/api/projections/{id}/verdict/` | Deal verdict metrics |
| POST | `/api/projections/{id}/duplicate/` | Clone a projection |
| GET, POST, PUT, DELETE | `/api/units/` | Rental unit management |

## Project Structure

```
Propjection/
├── backend/
│   ├── config/              # Django settings
│   ├── api/
│   │   ├── models.py        # Property, Projection, RentalUnit
│   │   ├── calculator.py    # All projection math
│   │   ├── serializers.py   # DRF serializers
│   │   ├── views.py         # ViewSets
│   │   └── urls.py          # Routes
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/           # React pages
│   │   ├── api/             # Axios client
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── Makefile
└── README.md
```

## Sample Data

The `make seed` command loads a sample triplex projection with:
- Purchase price: $499,900
- Down payment: 10%
- 3 rental units ($1,400, $1,750, $1,550/month)
- 30-year hold with 3% appreciation
- Full expense and mortgage projections

This matches the structure from `sample.xlsx`.

## Key Calculations

### Projection Calculator
- **Derived inputs:** Loan amount, down payment, acquisition costs, monthly mortgage payment
- **Income:** Per-unit rents (with growth & owner-occupancy), vacancy loss, property management
- **Expenses:** Property tax (% of value), insurance, maintenance, utilities, utilities
- **Mortgage:** Annual principal/interest split, PMI, cumulative interest
- **Equity:** Home value appreciation, loan balance, equity buildup, net proceeds if sold
- **Cash Flow:** NOI, debt service, annual/monthly cash flow, DSCR, cumulative CF
- **Scenarios:** Bull/Base/Bear using assumption deltas
- **Verdict:** 9 benchmark metrics (1% rule, GRM, cap rate, CoC, DSCR, break-even year, MOIC, IRR)

## Development

### Running Tests
```bash
# Backend tests
docker-compose exec backend python manage.py test

# Frontend tests (if configured)
npm test
```

### Makefile Commands
```bash
make help           # Show all commands
make build          # Build images
make up             # Start services
make down           # Stop services
make migrate        # Run migrations
make seed           # Load sample data
make logs           # View backend logs
make shell          # Django shell
```

## Deployment

1. Update `docker-compose.yml` for production:
   - Change `DEBUG: False`
   - Set `SECRET_KEY` to a secure value
   - Update `ALLOWED_HOSTS`
   - Use a proper database password

2. Build and push images to registry:
   ```bash
   docker build -t yourreg/propjection-backend ./backend
   docker build -t yourreg/propjection-frontend ./frontend
   ```

3. Deploy to your hosting platform (AWS ECS, Google Cloud Run, etc.)

## Roadmap

- [ ] User authentication & multi-user support
- [ ] Export projections to PDF/Excel
- [ ] Historical comparison & version tracking
- [ ] Advanced scenario modeling
- [ ] Team collaboration
- [ ] Mobile app

## License

MIT

## Support

For issues or questions, open an issue on GitHub.

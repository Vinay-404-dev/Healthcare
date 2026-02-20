# Healthcare Flask Service

A production-ready Healthcare service built with Python Flask, containerized using Docker best practices, with complete DevOps tooling including CI/CD pipelines and Kubernetes orchestration.

[![CI/CD Pipeline](https://github.com/your-org/healthcare-service/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/your-org/healthcare-service/actions)
[![Docker Image](https://img.shields.io/docker/v/your-org/healthcare-service?label=docker)](https://hub.docker.com/r/your-org/healthcare-service)

## Architecture

```
┌─────────────────────────────────────────────┐
│           Kubernetes Cluster                │
│  ┌────────────────────────────────────────┐ │
│  │  Ingress (TLS, Rate Limiting)          │ │
│  └──────────────┬─────────────────────────┘ │
│                 │                            │
│  ┌──────────────▼─────────────────────────┐ │
│  │  Healthcare Service (3 replicas)       │ │
│  │  - Flask App (Gunicorn)                │ │
│  │  - Health Checks                       │ │
│  │  - Non-root user                       │ │
│  └──────────────┬─────────────────────────┘ │
│                 │                            │
│  ┌──────────────▼─────────────────────────┐ │
│  │  PostgreSQL StatefulSet                │ │
│  │  - Persistent Storage                  │ │
│  │  - Health Checks                       │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Features

- **RESTful API** for healthcare management (patients, appointments, medical records)
- **Multi-stage Docker** build for optimized image size (<200MB)
- **Security hardening**: Non-root user, minimal base image, vulnerability scanning
- **Docker Compose** for easy local development
- **CI/CD pipelines** with GitHub Actions and Jenkins
- **Kubernetes manifests** for production deployment
- **Comprehensive testing** with pytest
- **Health checks** for container orchestration
- **Database migrations** with Flask-Migrate

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.11+ (for local development)
- Kubernetes cluster (for K8s deployment)

### Local Development with Docker Compose

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/healthcare-service.git
   cd healthcare-service
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start services**
   ```bash
   docker-compose up -d
   ```

4. **Check health**
   ```bash
   curl http://localhost:5000/health
   ```

5. **Create a test patient**
   ```bash
   curl -X POST http://localhost:5000/api/patients \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Doe",
       "date_of_birth": "1990-01-01",
       "email": "john@example.com"
     }'
   ```

6. **Stop services**
   ```bash
   docker-compose down
   ```

### Local Development without Docker

1. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set environment variables**
   ```bash
   export FLASK_ENV=development
   export DATABASE_URL=sqlite:///healthcare.db
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

## API Endpoints

### Health Checks
- `GET /health` - Basic health check
- `GET /ready` - Readiness check with database connectivity

### Patients
- `GET /api/patients` - List all patients
- `GET /api/patients/<id>` - Get specific patient
- `POST /api/patients` - Create new patient
- `PUT /api/patients/<id>` - Update patient
- `DELETE /api/patients/<id>` - Delete patient

### Appointments
- `GET /api/appointments` - List all appointments
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/<id>` - Update appointment

### Medical Records
- `GET /api/patients/<id>/records` - Get patient records
- `POST /api/records` - Create new medical record

For detailed API documentation, see [API.md](API.md).

## Testing

```bash
# Install test dependencies
pip install pytest pytest-cov

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_app.py -v
```

## Docker

### Build Docker Image

```bash
docker build -t healthcare-service:latest .
```

### Run Docker Container

```bash
docker run -d \
  -p 5000:5000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  healthcare-service:latest
```

### Multi-platform Build

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t healthcare-service:latest .
```

## Kubernetes Deployment

### Deploy to Kubernetes

```bash
# Create namespace and resources
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/pvc.yaml

# Deploy database
kubectl apply -f k8s/db-deployment.yaml

# Deploy application
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### Check Deployment Status

```bash
kubectl get pods -n healthcare-service
kubectl get svc -n healthcare-service
kubectl logs -f deployment/healthcare-service -n healthcare-service
```

### Update Deployment

```bash
kubectl set image deployment/healthcare-service \
  healthcare-app=ghcr.io/your-org/healthcare-service:v2.0.0 \
  -n healthcare-service
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## CI/CD

### GitHub Actions

The project includes a comprehensive CI/CD pipeline that:
- Runs linting and tests
- Builds multi-platform Docker images
- Performs security scanning with Trivy
- Deploys to Kubernetes

### Jenkins

A Jenkinsfile is provided for Jenkins-based CI/CD with:
- Build and test stages
- Docker image creation and push
- Kubernetes deployment
- Email notifications

## Makefile Commands

```bash
# Build Docker image
make build

# Start services
make up

# Stop services
make down

# Run tests
make test

# Deploy to Kubernetes
make deploy-k8s

# View logs
make logs
```

## Project Structure

```
healthcare-service/
├── app.py                 # Main Flask application
├── models.py              # Database models
├── config.py              # Configuration management
├── requirements.txt       # Python dependencies
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Docker Compose orchestration
├── Jenkinsfile            # Jenkins CI/CD pipeline
├── Makefile               # Convenience commands
├── pytest.ini             # Pytest configuration
├── .github/
│   └── workflows/
│       └── ci-cd.yml      # GitHub Actions workflow
├── k8s/                   # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
└── tests/                 # Test suite
    ├── test_app.py
    └── test_models.py
```

## Security Considerations

- **Non-root user**: Application runs as non-root user (appuser) in Docker
- **Minimal base image**: Uses python:3.11-slim for reduced attack surface
- **Security scanning**: Integrated Trivy scanning in CI/CD pipeline
- **Secrets management**: Uses Kubernetes Secrets (consider Vault for production)
- **Read-only filesystem**: Can be enabled in Kubernetes security context
- **Resource limits**: CPU and memory limits defined in K8s manifests
- **TLS termination**: Configured in Ingress with cert-manager support

## Troubleshooting

### Application won't start
```bash
# Check logs
docker-compose logs app

# Verify database connection
docker-compose exec app python -c "from app import create_app; from models import db; app = create_app(); app.app_context().push(); db.session.execute(db.text('SELECT 1'))"
```

### Database connection issues
```bash
# Check database status
docker-compose exec db psql -U healthuser -d healthdb -c "SELECT version();"

# Reset database
docker-compose down -v
docker-compose up -d
```

### Kubernetes pods not starting
```bash
# Describe pod
kubectl describe pod <pod-name> -n healthcare-service

# Check events
kubectl get events -n healthcare-service --sort-by='.lastTimestamp'

# View logs
kubectl logs <pod-name> -n healthcare-service
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_ENV` | Environment (development/production) | development |
| `SECRET_KEY` | Flask secret key | dev-secret-key |
| `DATABASE_URL` | PostgreSQL connection URL | postgresql://healthuser:healthpass@db:5432/healthdb |
| `LOG_LEVEL` | Logging level | INFO |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Authors

- Vinay Kuthey - vinaykuthey@gmail.com
- Viraj Agrawal - virajagrawal23@gmail.com
- Vishakha Shadija - vishakhashadija225@gmail.com
- Vishakha Hilsayan - hilsayanvishakha@gmail.com
- Lakshita Singh - lakshitasingh142@gmail.com

## Acknowledgments

- Flask framework and community
- Docker and Kubernetes documentation
- GitHub Actions and Jenkins teams

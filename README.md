# NeuroCode AI - Enterprise Edition

## 🚀 Confusion-Aware Recursive Code Intelligence System

NeuroCode AI is a learning-first AI platform that transforms code debugging into a structured learning experience through a modular, recursive AI architecture.

## ⚡ Quick Start

**Want to run a demo right now?**

1. Double-click: `start-local.bat`
2. Double-click: `start-backend.bat`  
3. Double-click: `start-frontend.bat`
4. Open: http://localhost:3000

**That's it!** See [QUICK_START.md](QUICK_START.md) for details.

## 📚 Documentation

- **🎯 New User?** → [GET_STARTED.md](GET_STARTED.md)
- **💻 Local Demo?** → [QUICK_START.md](QUICK_START.md)
- **☁️ AWS Deploy?** → [infra/README.md](infra/README.md)
- **📖 All Docs?** → [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Enterprise Features](#enterprise-features)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- **Recursive Code Analysis**: Multi-stage AI analysis with tiny micro-models
- **Confusion Detection**: Real-time detection of user confusion points
- **Adaptive Explanations**: Personalized explanations based on learning level
- **Learning Memory**: Track progress and adapt to individual learning patterns
- **Multi-Language Support**: Python, JavaScript, TypeScript, Java, C++

### Enterprise Features
- **SSO Integration**: SAML, OAuth 2.0, Azure AD
- **Multi-Tenancy**: Isolated environments for organizations
- **Custom Model Training**: Train models on organization-specific code
- **Advanced Analytics**: Comprehensive learning and usage analytics
- **White-Label Support**: Customizable branding
- **On-Premise Deployment**: Deploy in your own infrastructure
- **API Access**: RESTful and GraphQL APIs
- **Audit Logging**: Complete audit trail for compliance

## 🏗️ Architecture

```
Frontend (Next.js) → API Gateway → Microservices
                                    ├── Auth Service
                                    ├── Code Analysis Service
                                    ├── Confusion Detection Service
                                    ├── Explanation Service
                                    ├── Learning Memory Service
                                    └── Model Inference Service
                                           ↓
                                    AI Models (6 Micro-Models)
                                           ↓
                                    Data Layer (PostgreSQL, Redis, InfluxDB)
```

## 📦 Prerequisites

- **Node.js** >= 18.0.0
- **Python** >= 3.10
- **Docker** >= 24.0
- **Kubernetes** >= 1.28 (for production)
- **PostgreSQL** >= 15
- **Redis** >= 7
- **RabbitMQ** >= 3.12

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/neurocode-ai/neurocode-ai.git
cd neurocode-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start with Docker Compose

```bash
npm run docker:up
```

This will start:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- RabbitMQ Management: http://localhost:15672
- InfluxDB: http://localhost:8086

### 5. Access the Application

Open your browser and navigate to:
- **Application**: http://localhost:3000
- **API Docs**: http://localhost:4000/api/docs
- **RabbitMQ Dashboard**: http://localhost:15672 (admin/admin)

## 📁 Project Structure

```
neurocode-ai/
├── frontend/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   ├── components/         # React Components
│   │   ├── hooks/              # Custom Hooks
│   │   ├── lib/                # Utilities & API
│   │   ├── store/              # Redux Store
│   │   └── types/              # TypeScript Types
│   ├── public/                 # Static Assets
│   └── package.json
│
├── backend/                     # Backend Microservices
│   ├── api-gateway/            # API Gateway Service
│   ├── auth-service/           # Authentication Service
│   ├── code-analysis-service/  # Code Analysis Service
│   ├── confusion-detection-service/
│   ├── explanation-service/
│   ├── learning-memory-service/
│   └── model-inference-service/
│
├── ml-models/                   # AI/ML Models
│   ├── syntax-analyzer/
│   ├── semantic-analyzer/
│   ├── complexity-scorer/
│   ├── confusion-detector/
│   ├── explanation-generator/
│   └── error-reasoner/
│
├── infrastructure/              # Infrastructure as Code
│   ├── kubernetes/             # K8s Manifests
│   ├── terraform/              # Terraform Configs
│   └── docker/                 # Dockerfiles
│
├── shared/                      # Shared Libraries
│   ├── types/                  # Shared TypeScript Types
│   ├── utils/                  # Shared Utilities
│   └── constants/              # Shared Constants
│
├── docs/                        # Documentation
├── scripts/                     # Build & Deploy Scripts
├── tests/                       # Integration Tests
├── requirements.md              # Requirements Document
├── design.md                    # Design Document
├── docker-compose.yml           # Docker Compose Config
└── package.json                 # Root Package Config
```

## 💻 Development

### Frontend Development

```bash
cd frontend
npm run dev
```

### Backend Development

```bash
# Start all services
npm run dev:backend

# Or start individual services
cd backend/api-gateway
npm run dev
```

### Run Tests

```bash
npm test
```

### Lint Code

```bash
npm run lint
```

## 🚢 Deployment

### Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f infrastructure/kubernetes/

# Check deployment status
kubectl get pods -n neurocode

# View logs
kubectl logs -f deployment/api-gateway -n neurocode
```

### Production Deployment (AWS EKS)

```bash
# Initialize Terraform
cd infrastructure/terraform
terraform init

# Plan deployment
terraform plan

# Apply infrastructure
terraform apply

# Deploy application
npm run k8s:deploy
```

## 🏢 Enterprise Features

### SSO Configuration

Configure SSO in `.env`:

```env
SSO_ENABLED=true
SSO_PROVIDER=saml
SAML_ENTRY_POINT=https://your-idp.com/sso
SAML_ISSUER=neurocode-ai
SAML_CERT=path/to/cert.pem
```

### Multi-Tenancy

Each organization gets isolated:
- Database schemas
- Model instances
- Analytics dashboards
- Custom configurations

### Custom Model Training

```bash
# Train custom model for organization
python ml-models/train_custom.py \
  --org-id=org_123 \
  --data-path=/path/to/org/code \
  --model-type=confusion-detector
```

### API Access

RESTful API:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/v1/code/analyze \
  -d '{"code": "def hello(): print(\"Hello\")", "language": "python"}'
```

GraphQL API:
```graphql
query {
  analysis(id: "ana_123") {
    segments {
      code
      confusionScore
    }
  }
}
```

## 📚 Documentation

- [Requirements Document](./requirements.md)
- [Design Document](./design.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guide](./CONTRIBUTING.md)

## 🔧 Configuration

### Environment Variables

```env
# Application
NODE_ENV=production
PORT=4000

# Database
POSTGRES_URL=postgresql://user:pass@localhost:5432/neurocode
REDIS_URL=redis://localhost:6379
INFLUXDB_URL=http://localhost:8086

# Message Queue
RABBITMQ_URL=amqp://localhost:5672

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# AI Models
MODEL_PATH=/models
MODEL_CACHE_SIZE=1000

# Enterprise
SSO_ENABLED=true
MULTI_TENANCY_ENABLED=true
ANALYTICS_ENABLED=true
```

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📊 Monitoring

Access monitoring dashboards:
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686

## 🔒 Security

- TLS 1.3 encryption
- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection

## 📈 Performance

- Response time: < 3s (p95)
- Throughput: 10,000+ requests/second
- Concurrent users: 50,000+
- Model inference: < 200ms per model
- Uptime: 99.9%

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

- **Documentation**: https://docs.neurocode.ai
- **Email**: support@neurocode.ai
- **Discord**: https://discord.gg/neurocode
- **GitHub Issues**: https://github.com/neurocode-ai/neurocode-ai/issues

## 🎯 Roadmap

### Q1 2026
- [ ] Mobile apps (iOS, Android)
- [ ] VS Code extension
- [ ] 10+ programming languages

### Q2 2026
- [ ] Video explanations
- [ ] Collaborative learning
- [ ] Gamification

### Q3 2026
- [ ] Multi-cloud support
- [ ] Advanced analytics
- [ ] Custom model marketplace

### Q4 2026
- [ ] On-device inference
- [ ] Offline mode
- [ ] Enterprise SLA

## 🌟 Acknowledgments

- CodeBERT team for pre-trained models
- Open-source community
- Early adopters and beta testers

---

**Built with ❤️ by the NeuroCode AI Team**

**Enterprise Edition** | **Learning-First, Not Output-First**

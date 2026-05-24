# DigitalOcean Deployment Guide

This guide covers deploying Propjection to DigitalOcean with:
- **Backend**: API served via DigitalOcean App Platform
- **Frontend**: Static files served via DigitalOcean Spaces + CDN
- **Database**: DigitalOcean Managed PostgreSQL (optional)

## Prerequisites

1. DigitalOcean account with API token
2. GitHub repository (for App Platform auto-deployment)
3. Terraform installed locally
4. AWS CLI or `doctl` for uploading frontend to Spaces

## Setup Steps

### 1. Configure Environment Variables

Create `infra/terraform.tfvars`:

```hcl
do_token                   = "dop_v1_xxxxxxxxxxxx"
region                     = "nyc3"

# App Platform settings
use_app_platform           = true
use_managed_db             = true
github_repo                = "your-username/Propjection"
django_secret_key          = "your-secret-key-here"
do_model_access_token      = "doo_v1_xxxxxxxxxxxx"

# Frontend CDN settings
use_droplet                = false
frontend_domain            = "app.yourdomain.com"  # Optional custom domain
certificate_id             = ""                     # If using custom domain

# Legacy droplet (set to false for modern deployment)
use_droplet                = false
```

### 2. Deploy Infrastructure with Terraform

```bash
cd infra
terraform init
terraform plan
terraform apply
```

This creates:
- DigitalOcean Spaces bucket for frontend
- CDN in front of Spaces
- Managed PostgreSQL database
- App Platform app for backend

### 3. Build Frontend

```bash
cd frontend
npm install
npm run build
```

This creates optimized static files in `frontend/dist/`.

### 4. Upload Frontend to Spaces

Using AWS CLI (compatible with DigitalOcean Spaces):

```bash
# Configure credentials
aws configure --profile digitalocean

# When prompted, enter:
# AWS Access Key ID: [your-spaces-access-key]
# AWS Secret Access Key: [your-spaces-secret-key]
# Default region: nyc3
# Default output format: json

# Upload frontend
aws s3 sync frontend/dist/ \
  s3://propjection-frontend/ \
  --endpoint-url https://nyc3.digitaloceanspaces.com \
  --profile digitalocean \
  --acl public-read \
  --delete
```

Or using a deploy script:

```bash
#!/bin/bash
# deploy-frontend.sh

SPACES_BUCKET="propjection-frontend"
SPACES_REGION="nyc3"

# Build frontend
cd frontend
npm install
npm run build

# Upload to Spaces
aws s3 sync dist/ \
  s3://${SPACES_BUCKET}/ \
  --endpoint-url https://${SPACES_REGION}.digitaloceanspaces.com \
  --delete \
  --acl public-read

echo "✅ Frontend deployed to CDN"
echo "Visit: $(terraform -chdir=../infra output -raw frontend_cdn_domain)"
```

### 5. Configure Backend Environment

Set environment variables in App Platform dashboard:
- `DEBUG` = False
- `ALLOWED_HOSTS` = api-propjection.ondigitalocean.app
- `SECRET_KEY` = [your-secret]
- `DATABASE_URL` = [auto-populated by App Platform]
- `DO_INFERENCE_MODEL_ACCESS_TOKEN` = [your-token]
- `FRONTEND_URL` = [your-cdn-domain]

App Platform automatically deploys when you push to GitHub.

### 6. Configure CORS on Backend

Update `backend/config/settings.py` to allow your frontend domain:

```python
CORS_ALLOWED_ORIGINS = [
    "https://propjection-frontend.nyc3.cdn.digitaloceanspaces.com",
    "https://app.yourdomain.com",
    "http://localhost:5173",  # Local dev
]
```

## Deployment Outputs

After `terraform apply`, you'll get:

```
frontend_cdn_domain = propjection-frontend.nyc3.cdn.digitaloceanspaces.com
frontend_bucket_name = propjection-frontend
backend_api_url = https://api-propjection.ondigitalocean.app
```

Update your frontend environment variables to point to the backend API URL.

## Monitoring & Logs

### App Platform Logs

```bash
doctl apps get <app-id> --format=json | jq '.spec.services[0].name'
doctl apps logs <app-id> --type=build
doctl apps logs <app-id> --type=run
```

### Database Backups

DigitalOcean Managed Database automatically backs up daily. Configure backup retention in the dashboard.

### CDN Cache Invalidation

If you need to invalidate the CDN cache:

```bash
# Clear all cache
aws cloudfront create-invalidation \
  --distribution-id <YOUR_DISTRIBUTION_ID> \
  --paths "/*"
```

## Cost Optimization

1. **Reduce droplet usage**: Keep `use_droplet = false`
2. **Managed database**: `use_managed_db = true` (automatic backups, no ops)
3. **Spaces storage**: Frontend is static, minimal storage costs
4. **CDN caching**: Cache headers in frontend for fast delivery

## Local Development

```bash
# Still use docker-compose for local dev
make build
make up
make migrate
```

Frontend dev server at `http://localhost:5173`
Backend API at `http://localhost:8000`

## Troubleshooting

**Frontend shows 404**
- Check CDN domain in Terraform outputs
- Verify frontend files uploaded to Spaces
- Check CORS configuration on backend

**Backend API errors**
- View logs: `doctl apps logs <app-id> --type=run`
- Check environment variables in App Platform dashboard
- Verify database connection: `DATABASE_URL` env var

**Database connection issues**
- Get connection string: `doctl databases get <db-id> --format connection_uri`
- Check firewall rules: only App Platform should connect
- Verify `use_managed_db = true` in terraform.tfvars

## Rollback

To revert to previous deployment:

```bash
# App Platform auto-deploys from git
# To rollback: revert commit and push
git revert <commit-hash>
git push origin main

# Terraform state
# To rollback infrastructure changes
terraform plan  # Review changes
terraform destroy  # If needed
```

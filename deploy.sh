#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Propjection Deployment Script${NC}"
echo ""

# Check dependencies
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${YELLOW}⚠️  $1 not found. Install with: $2${NC}"
        exit 1
    fi
}

check_command "terraform" "brew install terraform"
check_command "npm" "brew install node"
check_command "aws" "brew install awscli"

# Parse arguments
STAGE=${1:-"plan"}

case $STAGE in
    plan)
        echo -e "${BLUE}📋 Planning infrastructure changes...${NC}"
        cd infra
        terraform plan
        cd ..
        ;;

    apply)
        echo -e "${BLUE}🔨 Applying infrastructure changes...${NC}"
        cd infra
        terraform apply
        cd ..
        echo -e "${GREEN}✅ Infrastructure deployed${NC}"
        ;;

    frontend)
        echo -e "${BLUE}📦 Building frontend...${NC}"
        cd frontend
        npm install
        npm run build
        echo -e "${GREEN}✅ Frontend built${NC}"

        echo -e "${BLUE}📤 Uploading to Spaces...${NC}"

        # Get bucket name from terraform
        BUCKET=$(cd ../infra && terraform output -raw frontend_bucket_name)
        REGION=$(cd ../infra && terraform output -raw frontend_bucket_region)

        if [ -z "$BUCKET" ]; then
            echo -e "${YELLOW}⚠️  Could not get bucket name. Run 'terraform apply' first.${NC}"
            exit 1
        fi

        # Upload with AWS CLI
        aws s3 sync dist/ \
            s3://${BUCKET}/ \
            --endpoint-url https://${REGION}.digitaloceanspaces.com \
            --delete \
            --acl public-read

        cd ..
        echo -e "${GREEN}✅ Frontend deployed to CDN${NC}"

        # Show CDN URL
        CDN_DOMAIN=$(cd infra && terraform output -raw frontend_cdn_domain)
        echo -e "${GREEN}📍 CDN URL: https://${CDN_DOMAIN}${NC}"
        ;;

    logs)
        echo -e "${BLUE}📋 Showing App Platform logs...${NC}"

        # Get app ID from terraform state or require input
        if [ -z "$APP_ID" ]; then
            echo "Enter your App Platform App ID: "
            read APP_ID
        fi

        doctl apps logs $APP_ID --type=run --follow
        ;;

    destroy)
        echo -e "${YELLOW}⚠️  This will destroy all infrastructure!${NC}"
        read -p "Are you sure? Type 'yes' to confirm: " confirm

        if [ "$confirm" = "yes" ]; then
            cd infra
            terraform destroy
            cd ..
            echo -e "${GREEN}✅ Infrastructure destroyed${NC}"
        else
            echo "Cancelled"
        fi
        ;;

    all)
        echo -e "${BLUE}🚀 Full deployment: Infrastructure + Frontend${NC}"

        # Apply infrastructure
        cd infra
        terraform apply -auto-approve
        cd ..

        # Build and deploy frontend
        $0 frontend

        echo -e "${GREEN}✅ Full deployment complete!${NC}"
        ;;

    *)
        echo "Usage: $0 {plan|apply|frontend|logs|destroy|all}"
        echo ""
        echo "Commands:"
        echo "  plan       - Plan infrastructure changes"
        echo "  apply      - Apply infrastructure changes"
        echo "  frontend   - Build and deploy frontend to CDN"
        echo "  logs       - Show App Platform logs"
        echo "  destroy    - Destroy all infrastructure"
        echo "  all        - Full deployment (infrastructure + frontend)"
        echo ""
        echo "Examples:"
        echo "  $0 plan                # Review changes"
        echo "  $0 apply               # Deploy infrastructure"
        echo "  $0 frontend            # Deploy frontend"
        echo "  $0 all                 # Complete deployment"
        exit 1
        ;;
esac

# DigitalOcean Terraform Deployment

## Prerequisites
- DigitalOcean API token
- SSH key added to DigitalOcean
- Terraform installed (for local use)

## Usage

1. Set your DigitalOcean API token as an environment variable:
   export TF_VAR_do_token=your_token_here

2. (Optional) Set your SSH key IDs in terraform.tfvars or as a variable.

3. Deploy:
   terraform -chdir=infra init
   terraform -chdir=infra apply

Or use the GitHub Actions workflow for CI/CD.

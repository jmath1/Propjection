variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "region" {
  default     = "nyc3"
  description = "DigitalOcean region"
}

variable "size" {
  default     = "s-1vcpu-2gb"
  description = "Droplet size"
}

variable "image" {
  default     = "docker-20-04"
  description = "Droplet image"
}

variable "default_ssh_key" {
  default     = "~/.ssh/id_rsa.pub"
  description = "Path to SSH public key"
}

variable "ssh_keys" {
  description = "List of SSH key IDs or fingerprints to enable SSH access"
  type        = list(string)
  default     = []
}

variable "use_droplet" {
  default     = false
  description = "Whether to deploy using a Droplet (legacy) or App Platform"
}

variable "use_app_platform" {
  default     = true
  description = "Whether to deploy backend using DigitalOcean App Platform"
}

variable "use_managed_db" {
  default     = true
  description = "Whether to use DigitalOcean Managed Database"
}

variable "frontend_domain" {
  default     = ""
  description = "Custom domain for frontend CDN (optional)"
}

variable "certificate_id" {
  default     = ""
  description = "DigitalOcean managed TLS certificate ID for custom domain (optional)"
}

variable "github_repo" {
  default     = "jmath1/Propjection"
  description = "GitHub repository for App Platform deployment"
}

variable "database_url" {
  default     = ""
  description = "Database URL for external database (used if use_managed_db is false)"
  sensitive   = true
}

variable "django_secret_key" {
  default     = ""
  description = "Django SECRET_KEY for backend"
  sensitive   = true
}

variable "do_model_access_token" {
  default     = ""
  description = "DigitalOcean Inference Model Access Token"
  sensitive   = true
}

variable "vpc_uuid" {
  default     = ""
  description = "DigitalOcean VPC UUID for private networking (optional)"
}

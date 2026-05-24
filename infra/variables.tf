variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
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
    default = "~/.ssh/id_rsa.pub"
}

variable "ssh_keys" {
  description = "List of SSH key IDs or fingerprints to enable SSH access"
  type        = list(string)
  default     = []
}

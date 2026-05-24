# Terraform configuration for DigitalOcean deployment
provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_droplet" "app" {
  name   = "propjection-app"
  region = var.region
  size   = var.size
  image  = var.image
  ssh_keys = var.ssh_keys

  user_data = file("${path.module}/cloud-init.yaml")
}

resource "digitalocean_firewall" "app_fw" {
  name = "propjection-fw"
  droplet_ids = [digitalocean_droplet.app.id]
  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }
  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }
  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}

output "droplet_ip" {
  value = digitalocean_droplet.app.ipv4_address
}

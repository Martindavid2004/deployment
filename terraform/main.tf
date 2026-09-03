terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# 1. Look up the latest official Ubuntu 24.04 LTS AMI automatically for the chosen region
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical official AWS account ID

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# 2. Security Group (Firewall)
resource "aws_security_group" "codoai_sg" {
  name        = "codoai-security-group"
  description = "Allow HTTP, HTTPS, and SSH traffic for CodoAI"

  # SSH Access
  ingress {
    description = "SSH Access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP Web Traffic (Frontend Nginx & React SPA)
  ingress {
    description = "HTTP Traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS Secure Web Traffic (SSL)
  ingress {
    description = "HTTPS Traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # FastAPI Backend (Direct debug port)
  ingress {
    description = "FastAPI Backend Direct Access"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound traffic allowed (for Docker image pulls, package updates, Atlas connection)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "codoai-security-group"
  }
}

# 3. EC2 Instance with automated bootstrapping
resource "aws_instance" "codoai_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name != "" ? var.key_name : null
  vpc_security_group_ids = [aws_security_group.codoai_sg.id]

  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = "gp3"
    delete_on_termination = true
    tags = {
      Name = "codoai-root-volume"
    }
  }

  # Cloud-Init / User Data: Automates 100% of server configuration on boot
  user_data = <<-EOF
              #!/bin/bash
              set -e

              # 1. Update system packages
              export DEBIAN_FRONTEND=noninteractive
              apt-get update && apt-get upgrade -y
              apt-get install -y curl git ufw

              # 2. Configure 2GB Swap space (Prevents memory exhaustion on heavy compilation)
              fallocate -l 2G /swapfile
              chmod 600 /swapfile
              mkswap /swapfile
              swapon /swapfile
              echo '/swapfile none swap sw 0 0' >> /etc/fstab

              # 3. Install Docker Engine and Docker Compose Plugin
              curl -fsSL https://get.docker.com -o get-docker.sh
              sh get-docker.sh
              usermod -aG docker ubuntu
              apt-get install -y docker-compose-plugin docker-compose

              # 4. Create host data directories for production volumes
              mkdir -p /opt/codoai/data/mongodb /opt/codoai/data/mongodb-config /opt/codoai/temp/judge /opt/codoai/logs/backend /opt/codoai/data/backend
              chmod -R 777 /opt/codoai

              # 5. Clone CodoAI deployment repository
              cd /home/ubuntu
              git clone -b ${var.git_branch} ${var.git_repo_url} CodoAi
              chown -R ubuntu:ubuntu /home/ubuntu/CodoAi

              cd /home/ubuntu/CodoAi/deployment

              # 6. Generate production .env file
              cat <<EOT > .env
              # MongoDB Atlas Cloud Configuration
              MONGODB_URI=${var.mongodb_uri}
              MONGODB_DB_NAME=${var.mongodb_db_name}

              # JWT Authentication
              JWT_SECRET=${var.jwt_secret}
              JWT_ALGORITHM=HS256
              ACCESS_TOKEN_EXPIRE_MINUTES=1440

              # Google Gemini API
              GOOGLE_API_KEY=${var.google_api_key}

              # CORS Origins
              CORS_ORIGINS=http://localhost,http://127.0.0.1
              EOT

              chown ubuntu:ubuntu .env

              # 7. Launch CodoAI Containers (Frontend, Backend, Judge0)
              docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build frontend backend codoai-judge
              EOF

  tags = {
    Name        = "codoai-production-server"
    Environment = "production"
    Project     = "CodoAI"
  }
}

# 🚀 CodoAI Terraform Infrastructure as Code (AWS)

This Terraform configuration automates 100% of the AWS infrastructure and deployment for the **CodoAI Platform** (`t3.medium` EC2, Security Groups, Docker, Nginx Reverse Proxy, FastAPI Backend, and Judge0 Code Execution Engine).

---

## 📋 Prerequisites

1. **[Install Terraform](https://developer.hashicorp.com/terraform/install)** (or `winget install HashiCorp.Terraform` / `choco install terraform` on Windows).
2. **AWS Credentials**: Set up your AWS Access Key & Secret Access Key in your terminal or environment:
   ```powershell
   # On Windows PowerShell:
   $env:AWS_ACCESS_KEY_ID="your_access_key"
   $env:AWS_SECRET_ACCESS_KEY="your_secret_key"
   $env:AWS_DEFAULT_REGION="eu-north-1"
   ```
   *(Or run `aws configure` if you have AWS CLI installed).*

---

## ⚡ 1-Command Deployment

### 1. Initialize Terraform
Navigate to the terraform directory:
```bash
cd deployment/terraform
terraform init
```

### 2. (Optional) Customize Variables
Copy `terraform.tfvars.example` to `terraform.tfvars` if you want to customize your AWS region, instance type, or SSH key:
```bash
cp terraform.tfvars.example terraform.tfvars
```

### 3. Deploy Everything
```bash
terraform apply
```
Type **`yes`** when prompted.

Terraform will:
1. Provision the **Security Group** (Ports 22, 80, 443, 8000).
2. Find the latest **Ubuntu 24.04 LTS AMI**.
3. Launch the **`t3.medium` EC2 instance**.
4. Automatically run cloud-init to install Docker, clone your repository, and launch CodoAI containers in the background.

---

## 🌐 Accessing Your Application

Once `terraform apply` finishes, it will print your live URLs:
```text
Outputs:

server_public_ip = "13.51.123.45"
frontend_url     = "http://13.51.123.45"
backend_api_url  = "http://13.51.123.45:8000/docs"
ssh_command      = "ssh ubuntu@13.51.123.45"
```

*(Allow ~2-3 minutes after Terraform finishes for Docker to complete the initial container builds).*

---

## 🛑 Destroying Infrastructure (Stop All AWS Billing)

When you are done testing and want to ensure you pay **$0.00** overnight:

```bash
terraform destroy
```
Type **`yes`** when prompted. Every AWS resource will be completely cleaned up with zero leftover charges!

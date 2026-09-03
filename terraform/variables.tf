variable "aws_region" {
  description = "AWS Region to deploy CodoAI"
  type        = string
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 instance type (t3.medium recommended for 30+ users)"
  type        = string
  default     = "t3.medium"
}

variable "root_volume_size" {
  description = "Size of EBS root volume in GB (30GB is free under AWS storage allowance)"
  type        = number
  default     = 30
}

variable "git_repo_url" {
  description = "Git repository URL to clone on the server"
  type        = string
  default     = "https://github.com/Martindavid2004/deployment.git"
}

variable "git_branch" {
  description = "Git branch to check out"
  type        = string
  default     = "Fix/compiler"
}

variable "key_name" {
  description = "Name of an existing AWS Key Pair for SSH access (optional)"
  type        = string
  default     = ""
}

variable "mongodb_uri" {
  description = "MongoDB Atlas Connection String URI"
  type        = string
  default     = "mongodb+srv://proeduvate:Martin790430@cluster0.rtl8a.mongodb.net/codo-ai?retryWrites=true&w=majority"
  sensitive   = true
}

variable "mongodb_db_name" {
  description = "MongoDB Database Name"
  type        = string
  default     = "codo-ai"
}

variable "jwt_secret" {
  description = "JWT Secret for Authentication token signing"
  type        = string
  default     = "codoai-production-jwt-secret-key-replace-with-random"
  sensitive   = true
}

variable "google_api_key" {
  description = "Google Gemini API key for AI features (optional)"
  type        = string
  default     = "AIzaSyBytZzM9-V3DQn_Ipw8rGAm517DodTmSJY"
  sensitive   = true
}

output "server_public_ip" {
  description = "The Public IPv4 address of the CodoAI EC2 instance"
  value       = aws_instance.codoai_server.public_ip
}

output "frontend_url" {
  description = "URL to access the CodoAI React Web Application"
  value       = "http://${aws_instance.codoai_server.public_ip}"
}

output "backend_api_url" {
  description = "URL to access the FastAPI Backend Swagger Docs"
  value       = "http://${aws_instance.codoai_server.public_ip}:8000/docs"
}

output "ssh_command" {
  description = "SSH command to connect to your server"
  value       = var.key_name != "" ? "ssh -i ${var.key_name}.pem ubuntu@${aws_instance.codoai_server.public_ip}" : "ssh ubuntu@${aws_instance.codoai_server.public_ip}"
}

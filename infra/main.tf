terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.3"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
}

variable "vercel_api_token" {
  description = "Vercel API Token"
  type        = string
  sensitive   = true
}

resource "vercel_project" "liftdplus_web" {
  name      = "liftdplus-web"
  framework = "nextjs"
  git_repository = {
    type = "github"
    repo = "therkels/liftdplus"
  }
}

output "project_id" {
  value = vercel_project.liftdplus_web.id
}

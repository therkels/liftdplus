terraform {
  required_providers {
    vercel = {
      source = "vercel/vercel"
      version = "~> 0.3"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
}

variable "vercel_api_token" {
  description = "Vercel API Token"
  type = string
  sensitive = true
}
resource "vercel_project" "web_dev" {
  name      = "terraform-test-project"
  framework = "nextjs"
  git_repository = {
    type = "github"
    repo = "therkels/liftdplus"
  }
}

data "vercel_project_directory" "example" {
  path = "../liftdplus-web"
}

resource "vercel_deployment" "example" {
  project_id  = vercel_project.example.id
  files       = data.vercel_project_directory.example.files
  path_prefix = "../liftdplus-web"
  production  = false
}
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

variable "project_id" {
  description = "Vercel Project ID"
  type        = string
}

data "vercel_project_directory" "web" {
  path = "../../liftdplus-web"
}

resource "vercel_deployment" "liftdplus_deploy" {
  project_id  = var.project_id
  files       = data.vercel_project_directory.web.files
  path_prefix = "../../liftdplus-web"
  production  = true
}

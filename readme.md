# LM Studio Model Manager

This project sets up a web interface for managing LM Studio models, with an Nginx reverse proxy for secure access over the internet. It allows users to browse and download models without exposing the LM Studio server directly. The proxy includes basic HTTP authentication for added security.

## Features

- Web UI for browsing and downloading LM Studio models
- Nginx reverse proxy with SSL/TLS support (optional, requires additional configuration)
    - HTTP Basic Authentication via .htpasswd file
    - Dockerized setup for easy deployment
    - Auto-generated nginx configuration based on a template

## Prerequisites

- Docker Desktop installed and running
- Git installed for cloning the repository
- NPM

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/funktechno/lm_studio_manager.git
   cd lm-studio-model-manager
   ```

2. **Create `.htpasswd` File (for Authentication)**:
   If you don't have one already, create a file named `.htpasswd` in the root directory with your desired username and password. You can use the `htpasswd` utility for this (usually comes with Apache or Nginx):
   ```bash
   # On Linux/macOS
   sudo apt install apache2-utils  # If not already installed
   ftpasswd -c .htpasswd admin  # Create user 'admin' with password

   # On Windows (using WSL or similar)
   # Install Apache utils if needed, then run the same command
   ```
   
   Or generate using [this website](https://www.web2generators.com/apache-tools/htpasswd-generator)
   
   Note: This step is optional but recommended for security. If you skip it, access will be open to anyone on your network.
3. Setup Proxy. See [Proxy](./proxy/proxy.md)
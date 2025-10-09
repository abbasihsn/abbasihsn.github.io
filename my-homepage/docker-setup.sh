#!/bin/bash

# This script checks Docker setup and provides fixes for common issues

echo "Checking Docker installation..."

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
else
    echo "Docker is installed."
fi

# Check if Docker service is running
if ! systemctl is-active --quiet docker; then
    echo "Docker service is not running. Starting Docker..."
    sudo systemctl start docker
    sudo systemctl enable docker
else
    echo "Docker service is running."
fi

# Add current user to docker group to avoid permission issues
if ! groups | grep -q docker; then
    echo "Adding user to docker group..."
    sudo usermod -aG docker $USER
    echo "You may need to log out and log back in for group changes to take effect."
fi

# Check Docker Compose installation
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed or not in PATH. Installing Docker Compose v2..."
    # Install Docker Compose v2
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
    # Create a symlink for compatibility with old docker-compose command
    sudo ln -sf /usr/libexec/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose
else
    echo "Docker Compose is installed."
fi

echo ""
echo "=== Docker Environment Information ==="
docker --version
docker-compose --version
echo "Docker daemon status:"
sudo systemctl status docker | grep Active
echo ""
echo "If you're still having issues, try the following:"
echo "1. Log out and log back in (or restart your server)"
echo "2. Run: export DOCKER_HOST=unix:///var/run/docker.sock"
echo "3. Check if docker socket exists: ls -la /var/run/docker.sock"
echo "4. Check permissions: sudo chmod 666 /var/run/docker.sock" 
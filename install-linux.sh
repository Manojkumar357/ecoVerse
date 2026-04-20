#!/bin/bash

# EcoVision - Linux Installation Script
# This script will install all necessary requirements for EcoVision

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}              ECOVISION - Linux Installation Script${NC}"
echo -e "${BLUE}================================================================${NC}"
echo ""
echo "This script will install all necessary requirements for EcoVision"
echo "Please ensure you have sudo privileges for system packages."
echo ""
read -p "Press Enter to continue..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js on different distributions
install_nodejs() {
    echo -e "${YELLOW}[INFO] Installing Node.js...${NC}"
    
    if command_exists apt-get; then
        # Ubuntu/Debian
        echo "Detected Ubuntu/Debian system"
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif command_exists yum; then
        # CentOS/RHEL/Fedora (older)
        echo "Detected CentOS/RHEL system"
        curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
        sudo yum install -y nodejs npm
    elif command_exists dnf; then
        # Fedora (newer)
        echo "Detected Fedora system"
        curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
        sudo dnf install -y nodejs npm
    elif command_exists pacman; then
        # Arch Linux
        echo "Detected Arch Linux system"
        sudo pacman -S nodejs npm
    elif command_exists zypper; then
        # openSUSE
        echo "Detected openSUSE system"
        sudo zypper install nodejs npm
    else
        echo -e "${RED}ERROR: Could not detect package manager${NC}"
        echo "Please install Node.js manually from: https://nodejs.org/"
        exit 1
    fi
}

#!/bin/bash

# EcoVision - Smart Linux Installation Script
# This script will intelligently install only missing requirements

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}              ECOVISION - Smart Linux Installation Script${NC}"
echo -e "${BLUE}================================================================${NC}"
echo ""
echo "This script will intelligently install only missing requirements"
echo "Please ensure you have sudo privileges for system packages."
echo ""
read -p "Press Enter to continue..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if npm package is installed globally
npm_global_exists() {
    npm list -g "$1" >/dev/null 2>&1
}

# Function to get installed version
get_npm_version() {
    npm --version 2>/dev/null
}

# Function to get latest npm version
get_latest_npm_version() {
    npm view npm version 2>/dev/null
}

# Function to install Node.js on different distributions
install_nodejs() {
    echo -e "${YELLOW}[INFO] Installing Node.js...${NC}"
    
    if command_exists apt-get; then
        # Ubuntu/Debian
        echo "Detected Ubuntu/Debian system"
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif command_exists yum; then
        # CentOS/RHEL/Fedora (older)
        echo "Detected CentOS/RHEL system"
        curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
        sudo yum install -y nodejs npm
    elif command_exists dnf; then
        # Fedora (newer)
        echo "Detected Fedora system"
        curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
        sudo dnf install -y nodejs npm
    elif command_exists pacman; then
        # Arch Linux
        echo "Detected Arch Linux system"
        sudo pacman -S nodejs npm
    elif command_exists zypper; then
        # openSUSE
        echo "Detected openSUSE system"
        sudo zypper install nodejs npm
    else
        echo -e "${RED}ERROR: Could not detect package manager${NC}"
        echo "Please install Node.js manually from: https://nodejs.org/"
        exit 1
    fi
}

echo -e "${BLUE}[1/9] Checking system requirements...${NC}"

# Check if git is installed
if ! command_exists git; then
    echo -e "${YELLOW}Installing git...${NC}"
    if command_exists apt-get; then
        sudo apt-get update && sudo apt-get install -y git
    elif command_exists yum; then
        sudo yum install -y git
    elif command_exists dnf; then
        sudo dnf install -y git
    elif command_exists pacman; then
        sudo pacman -S git
    elif command_exists zypper; then
        sudo zypper install git
    fi
else
    echo -e "${GREEN}✓ git is already installed${NC}"
fi

echo -e "${BLUE}[2/9] Checking if Node.js is installed...${NC}"
if ! command_exists node; then
    echo -e "${YELLOW}Node.js not found. Installing...${NC}"
    install_nodejs
else
    echo -e "${GREEN}✓ Node.js is already installed${NC}"
    node --version
fi

echo -e "${BLUE}[3/9] Checking npm version...${NC}"
if ! command_exists npm; then
    echo -e "${RED}ERROR: npm is not installed${NC}"
    echo "Please install npm manually or reinstall Node.js"
    exit 1
else
    echo -e "${GREEN}✓ npm is working${NC}"
    current_npm=$(get_npm_version)
    latest_npm=$(get_latest_npm_version)
    echo "Current npm version: $current_npm"
    
    if [ "$current_npm" = "$latest_npm" ]; then
        echo -e "${GREEN}✓ npm is already up to date${NC}"
    else
        echo -e "${YELLOW}Updating npm from $current_npm to $latest_npm...${NC}"
        sudo npm install -g npm@latest
        if [ $? -ne 0 ]; then
            echo -e "${YELLOW}WARNING: Could not update npm globally, trying without sudo...${NC}"
            npm install -g npm@latest
        fi
    fi
fi

echo -e "${BLUE}[4/9] Checking build essentials...${NC}"
build_needed=false

if command_exists apt-get; then
    if ! dpkg -l | grep -q "build-essential"; then
        build_needed=true
    fi
elif command_exists yum; then
    if ! yum grouplist installed | grep -q "Development Tools"; then
        build_needed=true
    fi
elif command_exists dnf; then
    if ! dnf grouplist --installed | grep -q "Development Tools"; then
        build_needed=true
    fi
elif command_exists pacman; then
    if ! pacman -Qg base-devel >/dev/null 2>&1; then
        build_needed=true
    fi
elif command_exists zypper; then
    if ! zypper se -i -t pattern devel_basis >/dev/null 2>&1; then
        build_needed=true
    fi
fi

if [ "$build_needed" = true ]; then
    echo -e "${YELLOW}Installing build essentials...${NC}"
    if command_exists apt-get; then
        sudo apt-get install -y build-essential python3 python3-pip
    elif command_exists yum; then
        sudo yum groupinstall -y "Development Tools"
        sudo yum install -y python3 python3-pip
    elif command_exists dnf; then
        sudo dnf groupinstall -y "Development Tools"
        sudo dnf install -y python3 python3-pip
    elif command_exists pacman; then
        sudo pacman -S base-devel python python-pip
    elif command_exists zypper; then
        sudo zypper install -t pattern devel_basis
        sudo zypper install python3 python3-pip
    fi
else
    echo -e "${GREEN}✓ Build essentials are already installed${NC}"
fi

echo -e "${BLUE}[5/9] Checking global dependencies...${NC}"
missing_globals=()

if ! npm_global_exists "tsx"; then
    missing_globals+=("tsx")
fi

if ! npm_global_exists "nodemon"; then
    missing_globals+=("nodemon")
fi

if ! npm_global_exists "drizzle-kit"; then
    missing_globals+=("drizzle-kit")
fi

if ! npm_global_exists "esbuild"; then
    missing_globals+=("esbuild")
fi

if [ ${#missing_globals[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ All global dependencies are already installed${NC}"
else
    echo -e "${YELLOW}Installing missing global dependencies: ${missing_globals[*]}${NC}"
    npm install -g ${missing_globals[*]}
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}WARNING: Some global packages may not have installed${NC}"
    fi
fi

echo -e "${BLUE}[6/9] Checking project dependencies...${NC}"
if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    echo -e "${YELLOW}Project dependencies not found, installing...${NC}"
    need_install=true
else
    echo "Checking if dependencies are up to date..."
    npm outdated >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}Some dependencies need updates, reinstalling...${NC}"
        need_install=true
    else
        echo -e "${GREEN}✓ Project dependencies are already up to date${NC}"
        need_install=false
    fi
fi

if [ "$need_install" = true ]; then
    echo -e "${BLUE}[7/9] Clearing npm cache...${NC}"
    npm cache clean --force
    
    echo -e "${BLUE}[8/9] Installing/updating project dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}ERROR: Failed to install dependencies!${NC}"
        echo "Trying with legacy peer deps..."
        npm install --legacy-peer-deps
        if [ $? -ne 0 ]; then
            echo -e "${RED}ERROR: Installation failed. Please check the error messages above.${NC}"
            exit 1
        fi
    fi
else
    echo -e "${BLUE}[7/9] ✓ Skipping npm cache clear (not needed)${NC}"
    echo -e "${BLUE}[8/9] ✓ Skipping dependency installation (already up to date)${NC}"
fi

echo -e "${BLUE}[9/9] Checking database setup...${NC}"
if [ -f "db.sqlite" ]; then
    echo -e "${GREEN}✓ Database already exists, skipping setup${NC}"
else
    echo -e "${YELLOW}Setting up database...${NC}"
    npm run db:push
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}WARNING: Database setup failed, you may need to run 'npm run db:push' manually later${NC}"
    fi
fi

echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}                    INSTALLATION COMPLETE!${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""
echo "To start the application, run one of these commands:"
echo -e "${YELLOW}  npm run dev${NC}    (for development)"
echo -e "${YELLOW}  npm start${NC}      (for production)"
echo ""
echo "If you encounter port issues, try:"
echo -e "${YELLOW}  PORT=3001 npm run dev${NC}"
echo ""
echo "For any issues, check the troubleshooting section in README.md"
echo ""

read -p "Would you like to start the development server now? (y/N): " choice
case "$choice" in 
    y|Y|yes|YES ) 
        echo "Starting development server..."
        npm run dev
        ;;
    * ) 
        echo "You can start the server later with: npm run dev"
        ;;
esac
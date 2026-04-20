# 🚀 EcoVision Quick Installation Guide

This project includes automated installation scripts for both Windows and Linux systems. Simply run the appropriate script for your operating system to install all requirements automatically.

## 📋 Requirements

### For Windows:
- Windows 7 or later
- Administrator privileges (recommended)
- Internet connection

### For Linux:
- Ubuntu/Debian, CentOS/RHEL, Fedora, Arch Linux, or openSUSE
- sudo privileges
- Internet connection

## 🎯 Quick Start

### Windows Installation

1. **Download the project** to your computer
2. **Right-click** on `install-windows.bat`
3. **Select "Run as administrator"** (recommended)
4. **Follow the prompts** in the command window
5. **Wait for installation** to complete
6. **Choose to start the server** when prompted

**Alternative method:**
```cmd
# Open Command Prompt as Administrator
cd path\to\EcoVision
install-windows.bat
```

### Linux Installation

1. **Download the project** to your computer
2. **Open terminal** in the project directory
3. **Run the installation script:**
   ```bash
   ./install-linux.sh
   ```
4. **Enter your password** when prompted for sudo
5. **Follow the prompts**
6. **Choose to start the server** when prompted

**Alternative method:**
```bash
# Make script executable (if needed)
chmod +x install-linux.sh
# Run the script
bash install-linux.sh
```

## 📦 What Gets Installed

The installation scripts will automatically install:

### System Requirements:
- **Node.js** (Latest LTS version)
- **npm** (Node Package Manager)
- **Git** (Version control)
- **Build tools** (for native dependencies)
- **Python** (for some build processes)

### Global Dependencies:
- `tsx` (TypeScript execution)
- `nodemon` (Development server)
- `drizzle-kit` (Database toolkit)
- `esbuild` (Fast bundler)

### Project Dependencies:
- All packages listed in `package.json`
- Development dependencies
- Optional dependencies

## 🚀 After Installation

Once installation is complete, you can start the application:

### Development Mode:
```bash
npm run dev
```

### Production Mode:
```bash
npm run build
npm start
```

The application will be available at:
- **Local**: `http://localhost:3000`
- **Network**: `http://[your-ip]:3000`

## 🔧 Troubleshooting

### Common Issues:

#### Windows:
- **"npm is not recognized"**: Node.js not installed or not in PATH
  - Solution: Download Node.js from [nodejs.org](https://nodejs.org/)
- **Permission errors**: Run Command Prompt as Administrator
- **Port conflicts**: Use `set PORT=3001 && npm run dev`
- **Firewall issues**: Allow Node.js through Windows Firewall

#### Linux:
- **"Permission denied"**: Make script executable with `chmod +x install-linux.sh`
- **"sudo: command not found"**: Install sudo or run as root
- **Build failures**: Install build-essential package
- **Port conflicts**: Use `PORT=3001 npm run dev`

### Manual Installation:

If the automated scripts fail, you can install manually:

1. **Install Node.js**: Download from [nodejs.org](https://nodejs.org/)
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Setup database**:
   ```bash
   npm run db:push
   ```
4. **Start development server**:
   ```bash
   npm run dev
   ```

## 🆘 Support

If you encounter issues:

1. **Check the console output** for specific error messages
2. **Try running the script again** as administrator/sudo
3. **Clear npm cache**: `npm cache clean --force`
4. **Delete node_modules** and run script again
5. **Check your internet connection**

### Getting Help:
- Check the error messages in the console
- Ensure you have admin/sudo privileges
- Verify your internet connection
- Try the manual installation steps above

## 🎮 Usage

After successful installation:

1. **Start the application**: `npm run dev`
2. **Open your browser**: Navigate to `http://localhost:3000`
3. **Enjoy EcoVision!** 🌍

---

**Note**: The installation scripts are designed to handle most common scenarios automatically. If you encounter issues, please check the troubleshooting section above or try the manual installation method.
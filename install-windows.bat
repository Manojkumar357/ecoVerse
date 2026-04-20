@echo off
echo ================================================================
echo              ECOVISION - Smart Windows Installation Script
echo ================================================================
echo.
echo This script will intelligently install only missing requirements
echo Please ensure you have administrative privileges.
echo.
pause

echo [1/8] Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo After installing Node.js, run this script again.
    pause
    exit /b 1
) else (
    echo ✓ Node.js is already installed
    node --version
)

echo.
echo [2/8] Checking npm version...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not working properly
    pause
    exit /b 1
) else (
    echo ✓ npm is working
    npm --version
)

echo.
echo [3/8] Checking if npm needs update...
for /f "tokens=*" %%i in ('npm view npm version') do set latest_npm=%%i
for /f "tokens=*" %%i in ('npm --version') do set current_npm=%%i
if "%current_npm%"=="%latest_npm%" (
    echo ✓ npm is already up to date ^(%current_npm%^)
) else (
    echo Updating npm from %current_npm% to %latest_npm%...
    npm install -g npm@latest
    if %errorlevel% neq 0 (
        echo WARNING: Could not update npm (may need admin rights)
        echo Continuing with current version...
    )
)

echo.
echo [4/8] Checking global dependencies...
set "missing_globals="

npm list -g tsx >nul 2>&1
if %errorlevel% neq 0 set "missing_globals=%missing_globals% tsx"

npm list -g nodemon >nul 2>&1
if %errorlevel% neq 0 set "missing_globals=%missing_globals% nodemon"

npm list -g drizzle-kit >nul 2>&1
if %errorlevel% neq 0 set "missing_globals=%missing_globals% drizzle-kit"

npm list -g esbuild >nul 2>&1
if %errorlevel% neq 0 set "missing_globals=%missing_globals% esbuild"

if "%missing_globals%"=="" (
    echo ✓ All global dependencies are already installed
) else (
    echo Installing missing global dependencies:%missing_globals%
    npm install -g%missing_globals%
    if %errorlevel% neq 0 (
        echo WARNING: Some global packages may not have installed
        echo You may need to run as administrator
    )
)

echo.
echo [5/8] Checking project dependencies...
if not exist node_modules (
    echo node_modules not found, installing dependencies...
    goto install_deps
)

if not exist package-lock.json (
    echo package-lock.json not found, installing dependencies...
    goto install_deps
)

echo Checking if dependencies are up to date...
npm outdated >nul 2>&1
if %errorlevel% neq 0 (
    echo Some dependencies need updates, reinstalling...
    goto install_deps
) else (
    echo ✓ Project dependencies are already up to date
    goto skip_deps
)

:install_deps
echo [6/8] Clearing npm cache...
npm cache clean --force >nul 2>&1

echo [7/8] Installing/updating project dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    echo Trying with different flags...
    npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo ERROR: Installation failed. Please check the error messages above.
        pause
        exit /b 1
    )
)
goto db_setup

:skip_deps
echo [6/8] ✓ Skipping npm cache clear (not needed)
echo [7/8] ✓ Skipping dependency installation (already up to date)

:db_setup
echo.
echo [8/8] Checking database setup...
if exist db.sqlite (
    echo ✓ Database already exists, skipping setup
) else (
    echo Setting up database...
    npm run db:push
    if %errorlevel% neq 0 (
        echo WARNING: Database setup failed, you may need to run 'npm run db:push' manually later
    )
)

echo.
echo ================================================================
echo                    INSTALLATION COMPLETE!
echo ================================================================
echo.
echo To start the application, run one of these commands:
echo   npm run dev    (for development)
echo   npm start      (for production)
echo.
echo If you encounter port issues, try:
echo   set PORT=3001 ^&^& npm run dev
echo.
echo For any issues, check the troubleshooting section in README.md
echo.
pause

echo Would you like to start the development server now? (Y/N)
set /p choice=Enter your choice: 
if /i "%choice%"=="Y" (
    echo Starting development server...
    npm run dev
) else (
    echo You can start the server later with: npm run dev
    pause
)
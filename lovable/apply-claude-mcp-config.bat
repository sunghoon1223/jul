@echo off
echo ================================
echo Claude Desktop MCP Configuration
echo ================================
echo.

:: Get the current user's AppData directory
set "CLAUDE_CONFIG_DIR=%APPDATA%\Claude"
set "CONFIG_FILE=%CLAUDE_CONFIG_DIR%\claude_desktop_config.json"

echo Checking Claude Desktop configuration directory...
if not exist "%CLAUDE_CONFIG_DIR%" (
    echo Creating Claude Desktop config directory: %CLAUDE_CONFIG_DIR%
    mkdir "%CLAUDE_CONFIG_DIR%"
)

:: Backup existing config if it exists
if exist "%CONFIG_FILE%" (
    echo Backing up existing configuration...
    copy "%CONFIG_FILE%" "%CONFIG_FILE%.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%"
    echo Backup created: %CONFIG_FILE%.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%
)

:: Copy the optimized configuration
echo Copying optimized MCP configuration...
copy "claude_desktop_config_v4.0_complete_optimized.json" "%CONFIG_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===============================
    echo ✅ Configuration Applied Successfully!
    echo ===============================
    echo.
    echo Next steps:
    echo 1. Restart Claude Desktop application
    echo 2. The following MCP servers are now available:
    echo    - SHRIMP Task Manager (High Priority)
    echo    - Sylphlab Memory MCP (High Priority)
    echo    - RAG Memory MCP (High Priority)
    echo    - Sequential Thinking (High Priority)
    echo    - Edit File Lines (Medium Priority)
    echo    - Text Editor (Medium Priority)
    echo    - Filesystem (Medium Priority)
    echo    - Git (Medium Priority)
    echo    - Terminal (Medium Priority)
    echo    - SSH Manager (Lower Priority)
    echo    - SFTP Transfer (Lower Priority)
    echo    - Remote MySQL (Lower Priority)
    echo    - Server Monitor (Lower Priority)
    echo    - Browser Tools (Lower Priority)
    echo    - Playwright (Lower Priority)
    echo    - Magic UI (Lowest Priority)
    echo    - Figma Tools (Lowest Priority)
    echo    - YouTube Data (Lowest Priority)
    echo    - Notion (Lowest Priority)
    echo    - Google Search (Lowest Priority)
    echo    - Context7 (Lowest Priority)
    echo.
    echo 3. Features enabled:
    echo    - Context Continuity System
    echo    - Performance Optimizations
    echo    - Automatic Keyword Routing
    echo    - Health Monitoring
    echo    - Memory Optimization
    echo    - Token Saving
    echo.
    echo Configuration file location: %CONFIG_FILE%
) else (
    echo.
    echo ❌ Configuration failed to apply
    echo Please check the source file exists and you have write permissions
)

echo.
pause
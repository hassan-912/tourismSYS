@echo off
echo Starting Tourism Case Tracker...
echo Setting up environment paths...

:: Add Node.js and npm to path dynamically from system registry or common locations
set "PATH=%PATH%;C:\Program Files\nodejs"

echo Running Next.js server...
call npm run dev
pause

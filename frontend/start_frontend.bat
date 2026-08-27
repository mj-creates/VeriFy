@echo off
echo Cleaning up previous failed installations...
rmdir /s /q node_modules
del package-lock.json

echo.
echo Installing all UI animation packages...
npm install

echo.
echo Starting the Expo UI Server!
npm run dev

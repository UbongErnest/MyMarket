@echo off
echo ========================================
echo  WE Student Marketplace - APK Builder
echo ========================================
echo.

echo [1/4] Installing dependencies...
call npm install

echo.
echo [2/4] Building web app...
call npm run build

echo.
echo [3/4] Syncing with Capacitor...
call npx cap sync

echo.
echo [4/4] Building APK...
cd android
call gradlew assembleDebug

echo.
echo ========================================
echo  APK Build Complete!
echo ========================================
echo.
echo Your APK is located at:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
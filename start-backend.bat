@echo off
echo ========================================
echo JalKavach Backend Startup Script
echo ========================================
echo.

cd backend

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

echo Activating virtual environment...
call venv\Scripts\activate
echo.

echo Installing/Updating dependencies...
pip install -r requirements.txt
echo.

echo Starting Flask backend server...
echo Backend will be available at http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
python app.py

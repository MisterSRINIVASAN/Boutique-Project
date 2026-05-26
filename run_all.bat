@echo off
echo Starting Boutique Project...

echo Starting Backend...
start cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload"

echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting in new windows!
echo You can close this window now.
pause

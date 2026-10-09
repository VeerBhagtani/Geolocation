@echo off
REM Start the tool locally (Windows). Creates a virtualenv on first run.
cd /d "%~dp0"
if not exist .venv (
  python -m venv .venv
  .venv\Scripts\pip install -q -r requirements.txt
)
if not exist .env (
  copy .env.example .env >nul
  echo Created .env - put your Google API key in it, then run this again.
  pause
  exit /b 1
)
.venv\Scripts\python app.py
pause

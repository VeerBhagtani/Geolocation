@echo off
REM Start the tool locally (Windows). Creates a virtualenv on first run.
cd /d "%~dp0"
if not exist .venv (
  echo First run: installing, please wait 1-2 minutes...
  python -m venv .venv
  .venv\Scripts\pip install -q -r requirements.txt
)
start "" http://127.0.0.1:8765
.venv\Scripts\python app.py
pause

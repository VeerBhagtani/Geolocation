#!/usr/bin/env bash
# Start the tool locally (macOS / Linux). Creates a virtualenv on first run.
set -e
cd "$(dirname "$0")"
if [ ! -d .venv ]; then
  python3 -m venv .venv
  .venv/bin/pip install -q -r requirements.txt
fi
[ -f .env ] || { cp .env.example .env; echo "Created .env - put your Google API key in it, then run this again."; exit 1; }
exec .venv/bin/python app.py

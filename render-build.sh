#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "=== 1. Upgrading PIP and installing Python dependencies ==="
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "=== 2. Building Frontend (Vite + React) ==="
cd frontend
npm install
npm run build
cd ..

echo "=== 3. Ensuring Uploads & Data Directories Exist ==="
mkdir -p uploads/images uploads/audio uploads/spectrograms uploads/reports

echo "=== 4. Initializing Database & Seed Records ==="
python -c "from database import engine, Base; from models import User, Species, MonitoringSite, Survey; Base.metadata.create_all(bind=engine)"

echo "=== Render Build Complete! ==="

# Jooksutamise käsud

## Mine backendi
cd backend

## loo virtuaalne keskkond (1 kord)
python3 -m venv venv          # macOS/Linux
py -m venv venv               # Windows

## aktiveeri virtuaalne keskkond (1 kord)
source venv/bin/activate      # macOS/Linux
.\venv\Scripts\Activate.ps1   # Windows PowerShell
venv\Scripts\activate.bat     # Windows CMD

## lae alla sõltuvused
pip install -r requirements.txt

## kopeeri .env näidismalli
cp .env.example .env          # macOS/Linux
copy .env.example .env        # Windows

## jooksuta backendi
python3 main.py               # macOS/Linux
py main.py                    # Windows

## loo avalik URL Suno API-ga ühenduse saamiseks (kohustuslik)
ngrok http 8000

## frontend
cd frontend

## muuda failis frontend/js/api.js -> API_BASE_URL = "https://<sinu-ngroki-subdomain>.ngrok.io"

## alusta frontendi lokaalselt
python3 -m http.server 8080   # macOS/Linux
py -m http.server 8080        # Windows
npx serve .

## ava brauseris
http://localhost:8080

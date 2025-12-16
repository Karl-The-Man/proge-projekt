# Suno Muusika Generaator

Rakendus, mis genereerib AI abil muusikat Suno API kaudu.

# demo video appist

[Link](https://www.dropbox.com/scl/fi/gxwoh3vjax5m65otsbr2v/demo.mp4?rlkey=osp12wtf1mo6r9vvdhgjykaqw&st=8yxhstu1&dl=0)

## Mida on vaja enne käivitamist

1. Python 3
2. ngrok (laadi alla: https://ngrok.com/download või `brew install ngrok` macOS-il)

## Seadistamine

### 1. Loo .env fail

Loo fail `backend/.env`

```bash
cd backend
cp .env.example .env
```

asenda `backend/.env` failis SUNO_API_KEY oma API võtmega:

```
SUNO_API_KEY=sinu_api_võti_siia
```

API võtme saad: https://www.sunoapi.org/

### 2. Seadista ngrok

Tee endale ngrok konto: https://dashboard.ngrok.com/signup

Seejärel käivita terminalis:

```
ngrok config add-authtoken SINU_TOKEN_SIIA
```

## Käivitamine

Kõige lihtsam on käivitada nii:

```
./start.sh
```

Kui kõik töötab, siis ava brauseris: http://localhost:8080

Sulgemiseks vajuta `Ctrl+C`

## Kui midagi ei tööta

**"backend/.env file not found"** - sul puudub .env fail, loo see (vaata punkt 1)

**"ngrok is not installed"** - installi ngrok

**"Could not get ngrok URL"** - käivita `ngrok config add-authtoken SINU_TOKEN`

## Autorid

Oliver Iida, Karl Elmar Vikat, Elias Teikari

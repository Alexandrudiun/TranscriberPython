# Whisper Audio Transcription and Translation

Acest proiect oferă o aplicație web pentru transcrierea și traducerea fișierelor audio folosind Whisper și Google Translate. Aplicația web este construită cu React și serverul backend este construit cu Flask. Proiectul utilizează containere Docker pentru a simplifica distribuirea și rularea aplicației.

## Structura Proiectului

/root-directory
/server
Dockerfile
app.py
requirements.txt
...
/client
Dockerfile
package.json
package-lock.json
src/
...
docker-compose.yml
README.md

### Server Flask

Serverul Flask gestionează încărcarea fișierelor audio, transcrierea folosind Whisper și traducerea folosind Google Translate. De asemenea, generează și servește fișiere `.srt`.

### Client React

Aplicația React oferă o interfață web prin care utilizatorii pot încărca fișiere audio, vizualiza transcrierile și descărca fișiere `.srt`.

## Instalare și Rulare

### Cerințe

- Docker
- Docker Compose

### Configurarea mediului

1. Clonează acest depozit:

   ```bash
   git clone https://github.com/utilizator/proiect-whisper.git
   cd proiect-whisper
Construiește containerele Docker:
docker-compose build

Rulează containerele:
docker-compose up

Utilizare
Accesează aplicația web la http://localhost:3000.
Încarcă un fișier audio.
Selectează limba dorită pentru transcriere (Original sau English).
Apasă pe butonul "Upload" pentru a încărca fișierul și a începe transcrierea.
Vizualizează transcrierea textului pe pagină.
Apasă pe butonul "Download .srt File" pentru a descărca fișierul .srt generat.
Structura Fișierelor
server/Dockerfile
Fișierul Docker pentru serverul Flask

# Dockerfile pentru serverul Flask
FROM python:3.9-slim

# Setează directorul de lucru în container
WORKDIR /app

# Copiază fișierele requirements.txt și instalează dependențele
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiază toate fișierele aplicației în container
COPY . .

# Expune portul pe care rulează serverul Flask
EXPOSE 5000

# Rulează serverul Flask
CMD ["python", "app.py"]

client/Dockerfile
Fișierul Docker pentru aplicația React.

# Dockerfile pentru aplicația React
FROM node:16

# Setează directorul de lucru în container
WORKDIR /app

# Copiază fișierele package.json și package-lock.json și instalează dependențele
COPY package.json package-lock.json ./
RUN npm install

# Copiază toate fișierele aplicației în container
COPY . .

# Construiește aplicația pentru producție
RUN npm run build

# Instalează un server static pentru a servi aplicația
RUN npm install -g serve

# Expune portul pe care rulează aplicația
EXPOSE 3000

# Rulează aplicația
CMD ["serve", "-s", "build"]

docker-compose.yml
Fișierul Docker Compose pentru orchestrarea containerelor.

version: '3.8'

services:
  flask:
    build:
      context: ./server
    ports:
      - "5000:5000"
    volumes:
      - ./server:/app
    networks:
      - app-network

  react:
    build:
      context: ./client
    ports:
      - "3000:3000"
    volumes:
      - ./client:/app
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

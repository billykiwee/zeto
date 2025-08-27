#!/bin/bash
set -euo pipefail

# ────────────────────────────────────────────────────────────────
# 0) Définition des constantes
# ────────────────────────────────────────────────────────────────

PI_USERNAME="$(whoami)"
INSTALL_DIR="$(pwd)"
COMPOSE_FILE="docker-compose.yml"
CONTAINER_NAME="billykiwee-playtime"
DESKTOP_DIR="/home/${PI_USERNAME}/Desktop"
AUTOSTART_DIR="/home/${PI_USERNAME}/.config/autostart"
DESKTOP_FILE="${DESKTOP_DIR}/Playtime.desktop"
ICON_PATH="${INSTALL_DIR}/icon.png"
API_CONTAINER_PORT=5001
API_LOCAL_PORT=8888

# ────────────────────────────────────────────────────────────────
# 1) Création du docker-compose.yml si manquant
# ────────────────────────────────────────────────────────────────

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "📄 Création du fichier $COMPOSE_FILE…"
    tee "$COMPOSE_FILE" >/dev/null <<EOL
version: "3.8"
services:
  playtime:
    image: billykiwee/playtime:latest
    container_name: "${CONTAINER_NAME}"
    pull_policy: always
    network_mode: host
    privileged: true
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      - /etc/machine-id:/etc/machine-id:ro
      - /var/lib/dbus/machine-id:/var/lib/dbus/machine-id:ro
      - ./videos:/app/videos
      - ./config.json:/app/config.json
      - /sys/class/gpio:/sys/class/gpio
      - /dev:/dev
    devices:
      - /dev/vchiq
      - /dev/dri
      - /dev/snd
      - /dev/gpiomem
      - /dev/ttyUSB0
      - /dev/gpiochip0
      - /dev/gpiochip1
      - /dev/gpiochip2
      - /dev/gpiochip3
      - /dev/gpiochip4
    group_add:
      - audio
      - video
    restart: unless-stopped
    working_dir: /app
    command: ["python", "app.py"]
EOL
    echo "✅ docker-compose.yml généré."
fi

# ────────────────────────────────────────────────────────────────
# 2) Installation de Docker si nécessaire
# ────────────────────────────────────────────────────────────────

if ! command -v docker >/dev/null; then
    echo "📦 Docker non détecté. Installation…"
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker "$PI_USERNAME"
    echo "🔁 Redémarre ta session pour utiliser Docker sans sudo."
else
    echo "✅ Docker déjà installé."
fi

# ────────────────────────────────────────────────────────────────
# 3) Installation du plugin Docker Compose si nécessaire
# ────────────────────────────────────────────────────────────────

if ! docker compose version &>/dev/null; then
    echo "📦 Plugin Docker Compose manquant. Installation…"
    sudo mkdir -p /usr/lib/docker/cli-plugins
    sudo curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-aarch64 \
        -o /usr/lib/docker/cli-plugins/docker-compose
    sudo chmod +x /usr/lib/docker/cli-plugins/docker-compose
    echo "✅ Plugin Docker Compose installé."
else
    echo "✅ Plugin Docker Compose déjà présent."
fi

# ────────────────────────────────────────────────────────────────
# 4) Démarrage du daemon Docker
# ────────────────────────────────────────────────────────────────

if command -v systemctl &>/dev/null; then
    if ! systemctl is-active --quiet docker; then
        echo "▶️  Démarrage du daemon Docker..."
        sudo systemctl start docker
        sleep 2
    fi
fi

# ────────────────────────────────────────────────────────────────
# 5) Vérification que Docker est fonctionnel
# ────────────────────────────────────────────────────────────────

for i in {1..10}; do
    if docker info &>/dev/null; then
        echo "✅ Docker est opérationnel."
        break
    else
        echo "⏳ Docker ne répond pas encore... ($i/10)"
        sleep 2
    fi
    if [ "$i" -eq 10 ]; then
        echo "❌ Docker ne répond pas après 10 tentatives."
        exit 1
    fi
done

# ────────────────────────────────────────────────────────────────
# 6) Connexion Docker Hub si nécessaire
# ────────────────────────────────────────────────────────────────

if ! grep -q '"https://index.docker.io/v1/"' "$HOME/.docker/config.json" 2>/dev/null; then
    echo "🔒 Connexion Docker Hub requise."
    docker login -u <DOCKER_HUB_USER> -p <DOCKER_HUB_PASSWORD>
else
    echo "🔓 Connexion Docker Hub déjà établie."
fi

# ────────────────────────────────────────────────────────────────
# 7) Création de config.json si nécessaire
# ────────────────────────────────────────────────────────────────

if [ ! -f "config.json" ]; then
    echo "📄 Création de config.json…"
    cat >config.json <<EOF
{
  "apiKey": "<API_KEY>",
  "apiUrl": "<API_URL>",
  "id": "<MODULE_ID>"
}
EOF
    echo "✅ config.json créé."
else
    echo "✅ config.json déjà présent."
fi


# ────────────────────────────────────────────────────────────────
# 7) Création du raccourci bureau et autostart
# ────────────────────────────────────────────────────────────────

mkdir -p "$DESKTOP_DIR" "$AUTOSTART_DIR"

if [ ! -f "$DESKTOP_FILE" ]; then
    echo "📄 Création de Playtime.desktop…"
    cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Playtime
Comment=Lancer l'application Playtime
Exec=bash -c "cd ${INSTALL_DIR} || exit 1 && chmod +x launch.sh && ./launch.sh; exec bash"
Icon=${INSTALL_DIR}/icon.png
Terminal=false
Categories=Game;
EOF
    echo "✅ Playtime.desktop créé."
else
    echo "✅ Playtime.desktop déjà présent."
fi

chmod +x "$DESKTOP_FILE"
cp "$DESKTOP_FILE" "$AUTOSTART_DIR/"
echo "✅ Raccourci bureau & autostart configurés."


# ────────────────────────────────────────────────────────────────
# 8.0) Activité le SPI du pi
# ────────────────────────────────────────────────────────────────
sudo raspi-config nonint do_spi 0

# ────────────────────────────────────────────────────────────────
# 8.1) Lancement initial du conteneur
# ────────────────────────────────────────────────────────────────

echo "🔎 Validation de la configuration Compose…"
if ! docker compose config >/dev/null; then
  echo "❌ docker-compose.yml invalide :"
  docker compose config
  exit 1
fi

echo "🚀 Lancement initial du conteneur Docker..."
if ! docker compose up -d 2>&1 | tee /tmp/compose_up.log; then
  echo "❌ Échec de docker compose up. Détails :"
  cat /tmp/compose_up.log
  exit 1
fi

docker compose up -d

echo "⏳ Attente du démarrage du conteneur '${CONTAINER_NAME}'..."

TIMEOUT=30
ELAPSED=0

while true; do
    STATUS=$(docker inspect -f '{{.State.Status}}' "$CONTAINER_NAME" 2>/dev/null)

    if [ "$STATUS" = "running" ]; then
        echo "✅ Conteneur '${CONTAINER_NAME}' est lancé et fonctionnel."
        break
    elif [ "$STATUS" = "exited" ] || [ "$STATUS" = "dead" ]; then
        echo "❌ Le conteneur '${CONTAINER_NAME}' a quitté prématurément (status: $STATUS)."
        docker logs "$CONTAINER_NAME"
        exit 1
    fi

    if [ $ELAPSED -ge $TIMEOUT ]; then
        echo "❌ Temps d'attente dépassé (${TIMEOUT} secondes)."
        docker logs "$CONTAINER_NAME"
        exit 1
    fi

    sleep 1
    ELAPSED=$((ELAPSED + 1))
done

# ────────────────────────────────────────────────────────────────
# 9) Récupération des fichiers locaux depuis le conteneur
# ────────────────────────────────────────────────────────────────

echo "📂 Démarrage de la copie des fichiers depuis le conteneur '$CONTAINER_NAME'..."

docker cp "$CONTAINER_NAME:/app/module/update.sh" . >/dev/null
echo "✅ Copie réussie : update.sh"

docker cp "$CONTAINER_NAME:/app/module/api_local.py" . >/dev/null
echo "✅ Copie réussie : api_local.py"

docker cp "$CONTAINER_NAME:/app/module/icon.png" . >/dev/null
echo "✅ Copie réussie : icon.png"

docker cp "$CONTAINER_NAME:/app/index.html" . >/dev/null
echo "✅ Copie réussie : index.html"

docker cp "$CONTAINER_NAME:/app/module/launch.sh" . >/dev/null
echo "✅ Copie réussie : launch.sh"

docker cp "$CONTAINER_NAME:/app/module/setup.sh" . >/dev/null
echo "✅ Copie réussie : setup.sh"

docker cp "$CONTAINER_NAME:/app/module/led.py" . >/dev/null
echo "✅ Copie réussie : led.py"

docker cp "$CONTAINER_NAME:/app/module/usb_wifi.py" . >/dev/null
echo "✅ Copie réussie : usb_wifi.py"

# Création du .env
cat > .env <<EOF
PI_USERNAME=${PI_USERNAME}
INSTALL_DIR=${INSTALL_DIR}
COMPOSE_FILE=${COMPOSE_FILE}
CONTAINER_NAME=${CONTAINER_NAME}
DESKTOP_DIR=/home/${PI_USERNAME}/Desktop
AUTOSTART_DIR=/home/${PI_USERNAME}/.config/autostart
DESKTOP_FILE=${DESKTOP_FILE}
ICON_PATH=${ICON_PATH}
API_CONTAINER_PORT=${API_CONTAINER_PORT}
API_LOCAL_PORT=${API_LOCAL_PORT}
EOF

# Rendre tous les fichier .sh executable
sudo chmod +x *.sh


# ────────────────────────────────────────────────────────────────
# 10) Création de la mise à jour automatique du conteneur via cron
# ────────────────────────────────────────────────────────────────

UPDATE_SCRIPT="${INSTALL_DIR}/update.sh"
sudo chmod +x "$UPDATE_SCRIPT"
CRON_LINE="0 * * * * $UPDATE_SCRIPT"

# Ajouter la tâche cron si elle n'existe pas déjà
(crontab -l 2>/dev/null | grep -Fxq "$CRON_LINE") || {
    (crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -
    echo "✅ Tâche cron ajoutée : $CRON_LINE"
}

# ────────────────────────────────────────────────────────────────
# 11) Lancement du navigateur kiosque
# ────────────────────────────────────────────────────────────────

echo "🌐 Lancement du navigateur en mode kiosque..."
bash "./launch.sh" &

# ────────────────────────────────────────────────────────────────
# 12) Suppression du script d’installation
# ────────────────────────────────────────────────────────────────

echo "✅ Installation terminée."
echo "Vous pouvez redémarer ou cliquer sur le raccourci du burreau pour lancer Playtime"
rm -- "$0"
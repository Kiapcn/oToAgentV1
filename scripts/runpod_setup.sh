#!/bin/bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Démarrage de la configuration de sécurité RunPod...${NC}"

# Vérification des privilèges root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Ce script doit être exécuté en tant que root${NC}"
    exit 1
fi

# Mise à jour du système
echo -e "${YELLOW}Mise à jour du système...${NC}"
apt-get update
apt-get upgrade -y

# Installation des outils de sécurité
echo -e "${YELLOW}Installation des outils de sécurité...${NC}"
apt-get install -y ufw fail2ban

# Configuration du firewall
echo -e "${YELLOW}Configuration du firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 8000/tcp  # Port pour l'API FastAPI
ufw allow 443/tcp   # HTTPS
ufw enable

# Configuration de Fail2Ban
echo -e "${YELLOW}Configuration de Fail2Ban...${NC}"
cat > /etc/fail2ban/jail.local << EOL
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[apache-auth]
enabled = true
port = http,https
filter = apache-auth
logpath = /var/log/apache2/error.log
maxretry = 3
EOL

# Redémarrage de Fail2Ban
systemctl restart fail2ban

# Création du répertoire pour les logs
echo -e "${YELLOW}Configuration des logs...${NC}"
mkdir -p /var/log/oto
touch /var/log/oto/security.log
touch /var/log/oto/api.log

# Configuration des permissions
chmod 644 /var/log/oto/*.log
chown root:root /var/log/oto/*.log

# Installation de logwatch pour la surveillance des logs
echo -e "${YELLOW}Installation de logwatch...${NC}"
apt-get install -y logwatch

# Configuration de logwatch
cat > /etc/logwatch/conf/logwatch.conf << EOL
Output = mail
Format = text
MailTo = admin@oto.com
MailFrom = logwatch@oto.com
Detail = High
EOL

echo -e "${GREEN}Configuration terminée avec succès!${NC}"
echo -e "${YELLOW}N'oubliez pas de:${NC}"
echo -e "1. Configurer l'adresse email dans /etc/logwatch/conf/logwatch.conf"
echo -e "2. Vérifier les règles du firewall avec 'ufw status'"
echo -e "3. Vérifier le statut de Fail2Ban avec 'fail2ban-client status'" 
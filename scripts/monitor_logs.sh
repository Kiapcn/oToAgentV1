#!/bin/bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérification des privilèges root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Ce script doit être exécuté en tant que root${NC}"
    exit 1
fi

# Fonction pour afficher le menu
show_menu() {
    echo -e "\n${BLUE}=== Menu de Surveillance des Logs ===${NC}"
    echo -e "1. Surveiller les logs de sécurité"
    echo -e "2. Surveiller les logs de l'API"
    echo -e "3. Voir les tentatives de connexion échouées"
    echo -e "4. Voir les IPs bloquées par Fail2Ban"
    echo -e "5. Quitter"
    echo -e "${YELLOW}Choisissez une option (1-5):${NC}"
}

# Fonction pour surveiller les logs de sécurité
monitor_security_logs() {
    echo -e "${GREEN}Surveillance des logs de sécurité...${NC}"
    echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter${NC}"
    tail -f /var/log/oto/security.log | while read line; do
        echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] $line${NC}"
    done
}

# Fonction pour surveiller les logs de l'API
monitor_api_logs() {
    echo -e "${GREEN}Surveillance des logs de l'API...${NC}"
    echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter${NC}"
    tail -f /var/log/oto/api.log | while read line; do
        echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $line${NC}"
    done
}

# Fonction pour voir les tentatives de connexion échouées
show_failed_attempts() {
    echo -e "${GREEN}Dernières tentatives de connexion échouées:${NC}"
    grep "Failed password" /var/log/auth.log | tail -n 10
    echo -e "${YELLOW}Appuyez sur Entrée pour continuer...${NC}"
    read
}

# Fonction pour voir les IPs bloquées
show_banned_ips() {
    echo -e "${GREEN}IPs actuellement bloquées par Fail2Ban:${NC}"
    fail2ban-client status | grep "IP list"
    echo -e "${YELLOW}Appuyez sur Entrée pour continuer...${NC}"
    read
}

# Boucle principale
while true; do
    show_menu
    read -r choice
    case $choice in
        1) monitor_security_logs ;;
        2) monitor_api_logs ;;
        3) show_failed_attempts ;;
        4) show_banned_ips ;;
        5) echo -e "${GREEN}Au revoir!${NC}"; exit 0 ;;
        *) echo -e "${RED}Option invalide${NC}" ;;
    esac
done 
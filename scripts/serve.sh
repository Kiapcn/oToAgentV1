#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Démarrage du serveur local...${NC}"
echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter le serveur${NC}"

# Vérifier si Python 3 est installé
if command -v python3 &> /dev/null; then
    # Démarrer le serveur Python
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    # Démarrer le serveur Python (version 2)
    python -m SimpleHTTPServer 8000
else
    echo -e "${RED}Python n'est pas installé. Veuillez installer Python 3.${NC}"
    exit 1
fi 
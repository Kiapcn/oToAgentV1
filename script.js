document.addEventListener("DOMContentLoaded", function () {
    console.log("oToV2 Base Project Loaded");

    function logMessage(message) {
        const consoleOutput = document.getElementById("console-output");
        const newMessage = document.createElement("p");
        newMessage.textContent = message;
        consoleOutput.appendChild(newMessage);
    }

    logMessage("Bienvenue sur oToV2 - Console de log active.");
});

class Logger {
    constructor() {
        this.consoleOutput = document.getElementById('console-output');
        this.maxEntries = 1000;
        this.isDebugMode = false;
        this.securityLevel = 'info'; // 'debug', 'info', 'warning', 'error'
        this.initialize();
    }

    initialize() {
        if (!this.consoleOutput) {
            console.error('Logger: Console output element not found');
            return;
        }
        this.info('Logger initialisé');
        this.setupSecurityListeners();
    }

    setupSecurityListeners() {
        // Détection des erreurs JavaScript
        window.onerror = (msg, url, lineNo, columnNo, error) => {
            this.error(`Erreur JavaScript: ${msg} (${url}:${lineNo}:${columnNo})`);
            return false;
        };

        // Détection des promesses non gérées
        window.addEventListener('unhandledrejection', (event) => {
            this.error(`Promesse non gérée: ${event.reason}`);
        });
    }

    formatTimestamp() {
        const now = new Date();
        return `[${now.toLocaleTimeString()}]`;
    }

    setDebugMode(enabled) {
        this.isDebugMode = enabled;
        this.info(`Mode debug ${enabled ? 'activé' : 'désactivé'}`);
    }

    setSecurityLevel(level) {
        const validLevels = ['debug', 'info', 'warning', 'error'];
        if (validLevels.includes(level)) {
            this.securityLevel = level;
            this.info(`Niveau de sécurité changé à: ${level}`);
        } else {
            this.warning(`Niveau de sécurité invalide: ${level}`);
        }
    }

    shouldLog(level) {
        const levels = {
            'debug': 0,
            'info': 1,
            'warning': 2,
            'error': 3
        };
        return levels[level] >= levels[this.securityLevel];
    }

    addEntry(message, type = 'info') {
        if (!this.consoleOutput || !this.shouldLog(type)) return;

        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        
        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = this.formatTimestamp();
        
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        
        entry.appendChild(timestamp);
        entry.appendChild(messageSpan);
        
        this.consoleOutput.appendChild(entry);
        
        // Limite le nombre d'entrées
        while (this.consoleOutput.children.length > this.maxEntries) {
            this.consoleOutput.removeChild(this.consoleOutput.firstChild);
        }
        
        // Auto-scroll vers le bas
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }

    info(message) {
        this.addEntry(message, 'info');
    }

    warning(message) {
        this.addEntry(message, 'warning');
    }

    error(message) {
        this.addEntry(message, 'error');
    }

    debug(message) {
        if (this.isDebugMode) {
            this.addEntry(message, 'debug');
        }
    }

    clear() {
        if (this.consoleOutput) {
            this.consoleOutput.innerHTML = '';
            this.info('Console effacée');
        }
    }

    // Méthode pour exporter les logs
    exportLogs() {
        const logs = Array.from(this.consoleOutput.children).map(entry => ({
            timestamp: entry.querySelector('.timestamp').textContent,
            message: entry.querySelector('span:not(.timestamp)').textContent,
            type: entry.className.split(' ')[1].replace('log-', '')
        }));
        return JSON.stringify(logs, null, 2);
    }
}

// Initialisation du logger au chargement du document
document.addEventListener("DOMContentLoaded", function () {
    // Création de l'instance du logger
    const logger = new Logger();
    
    // Rendre le logger disponible globalement
    window.logger = logger;

    // Configuration initiale
    logger.setSecurityLevel('info');
    logger.setDebugMode(false);
    
    // Logs de démarrage
    logger.info('Application démarrée');
    logger.info('Bienvenue sur oToV2 - Console de log active');
    logger.debug('Mode debug disponible');
    logger.warning('Veuillez configurer les paramètres de sécurité');
});

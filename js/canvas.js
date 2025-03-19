// Configuration
const config = {
    canvasSize: Math.max(window.innerWidth * 2, window.innerHeight * 2), // Toile plus grande que l'écran
    minZoom: 0.1,
    maxZoom: 3,
    padding: 20,
    paperWidth: 210, // A4 width en pixels
    paperHeight: 297, // A4 height en pixels
    postItSize: 100, // Post-it plus petit que A4
    backgroundColor: '#f5e6d3', // Beige clair
    frameWidth: 20, // Cadre plus fin
    hoverScale: 1.1,
    warpEffect: 15 // Intensité de l'effet de décollement
};

// Variables globales
let canvas, ctx;
let viewportX = 0;
let viewportY = 0;
let zoom = 1;
let isDragging = false;
let lastX = 0;
let lastY = 0;
let agents = [];
let users = [];
let hoveredElement = null;
let selectedElement = null;

// Couleurs pour les punaises
const pinColors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeead',
    '#d4a5a5', '#9b59b6', '#3498db', '#e74c3c', '#2ecc71'
];

// Création d'une texture de liège plus réaliste
function createCorkTexture() {
    return config.backgroundColor; // On retourne simplement la couleur beige
}

// Classe pour représenter un papier (agent ou utilisateur)
class Paper {
    constructor(isAgent = false, data = {}) {
        this.width = isAgent ? config.postItSize : config.paperWidth;
        this.height = isAgent ? config.postItSize : config.paperHeight;
        this.x = 0; // Position initiale au centre
        this.y = 0;
        this.rotation = data.rotation || (Math.random() - 0.5) * 10;
        this.isAgent = isAgent;
        this.color = isAgent ? '#fff3d4' : '#ffffff';
        this.pinColor = '#ff6b6b';
        this.id = data.id;
        this.content = data.content || '';
        this.type = data.type || '';
        
        if (!data.position_x) {
            this.setRandomPosition();
        }
    }

    setRandomPosition() {
        if (this.isAgent) {
            // Les agents sont placés près du centre avec un léger décalage aléatoire
            this.x = (Math.random() - 0.5) * 300;
            this.y = (Math.random() - 0.5) * 300;
        } else {
            // Les utilisateurs sont placés plus loin du centre
            const angle = Math.random() * Math.PI * 2;
            const distance = 400 + Math.random() * 200;
            this.x = Math.cos(angle) * distance;
            this.y = Math.sin(angle) * distance;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        
        if (this === hoveredElement) {
            ctx.scale(config.hoverScale, config.hoverScale);
        }
        
        ctx.rotate(this.rotation * Math.PI / 180);

        // Ombre simplifiée
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Fond du papier simplifié
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Punaise simplifiée
        ctx.fillStyle = this.pinColor;
        ctx.beginPath();
        ctx.arc(0, -this.height/2 + 10, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    isPointInside(x, y) {
        const dx = x - (this.x + this.width/2);
        const dy = y - (this.y + this.height/2);
        const rotatedX = dx * Math.cos(-this.rotation * Math.PI / 180) - dy * Math.sin(-this.rotation * Math.PI / 180);
        const rotatedY = dx * Math.sin(-this.rotation * Math.PI / 180) + dy * Math.cos(-this.rotation * Math.PI / 180);
        
        return Math.abs(rotatedX) < this.width/2 && Math.abs(rotatedY) < this.height/2;
    }

    handleClick() {
        if (this.isAgent) {
            // Pour les agents : affichage dans un modal
            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');
            
            modalContent.innerHTML = `
                <h2>Agent #${this.id}</h2>
                <div class="content">
                    ${this.content || 'Aucun contenu pour le moment'}
                </div>
                <div class="type">Type: ${this.type}</div>
                <div class="metadata">
                    <div>Position: (${Math.round(this.x)}, ${Math.round(this.y)})</div>
                    <div>Rotation: ${Math.round(this.rotation)}°</div>
                </div>
            `;

            modal.style.display = 'block';
            
            // Gestion de la fermeture du modal pour les agents
            const closeBtn = document.querySelector('.close-modal');
            closeBtn.onclick = () => modal.style.display = 'none';
            window.onclick = (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            };
        } else {
            // Pour les utilisateurs : redirection vers une nouvelle page
            const userPage = window.open('', '_blank');
            userPage.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Utilisateur #${this.id}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 20px;
                            background: #f5f5f5;
                        }
                        h1 {
                            color: #333;
                            border-bottom: 2px solid #ddd;
                            padding-bottom: 10px;
                        }
                    </style>
                </head>
                <body>
                    <h1>Utilisateur #${this.id}</h1>
                    <p>Page en construction...</p>
                </body>
                </html>
            `);
            userPage.document.close();
        }
    }
}

// Initialisation
function init() {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    document.getElementById('canvas-container').appendChild(canvas);

    // Initialisation du moniteur de performance
    initPerformanceMonitor();

    // Création des agents et utilisateurs initiaux
    for (let i = 0; i < 3; i++) {
        agents.push(new Paper(true));
    }
    users.push(new Paper(false));

    // Centrer la vue initiale
    viewportX = canvas.width/2;
    viewportY = canvas.height/2;

    setupEventListeners();
    render();
}

function setupEventListeners() {
    // Gestion du zoom
    canvas.addEventListener('wheel', handleWheel);
    
    // Gestion du pan
    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', endDrag);
    
    // Gestion du redimensionnement de la fenêtre
    window.addEventListener('resize', resizeCanvas);

    // Boutons de contrôle
    document.getElementById('zoom-in').addEventListener('click', () => zoomCanvas(1.2));
    document.getElementById('zoom-out').addEventListener('click', () => zoomCanvas(0.8));
    document.getElementById('reset-view').addEventListener('click', resetView);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
}

function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoomCanvas(delta, e.offsetX, e.offsetY);
}

function zoomCanvas(delta, mouseX = canvas.width/2, mouseY = canvas.height/2) {
    const newZoom = zoom * delta;
    if (newZoom >= config.minZoom && newZoom <= config.maxZoom) {
        // Zoom vers le point de la souris
        const factor = 1 - delta;
        viewportX += (mouseX - viewportX) * factor;
        viewportY += (mouseY - viewportY) * factor;
        zoom = newZoom;
        render();
    }
}

function startDrag(e) {
    isDragging = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
    canvas.style.cursor = 'grabbing';
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewportX) / zoom;
    const y = (e.clientY - rect.top - viewportY) / zoom;

    // Vérification du survol
    const allElements = [...agents, ...users];
    hoveredElement = allElements.find(element => element.isPointInside(x, y));
    
    if (hoveredElement) {
        canvas.style.cursor = 'pointer';
    } else {
        canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
    }

    // Gestion du drag
    if (isDragging && !hoveredElement) {
        const dx = e.offsetX - lastX;
        const dy = e.offsetY - lastY;
        viewportX += dx;
        viewportY += dy;
        lastX = e.offsetX;
        lastY = e.offsetY;
    }

    render();
}

function handleMouseUp(e) {
    if (hoveredElement && !isDragging) {
        hoveredElement.handleClick();
    }
    endDrag();
}

function endDrag() {
    isDragging = false;
    canvas.style.cursor = 'grab';
}

function resetView() {
    viewportX = canvas.width/2;
    viewportY = canvas.height/2;
    zoom = 1;
    render();
}

function render() {
    if (window.stats) window.stats.begin();

    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(viewportX, viewportY);
    ctx.scale(zoom, zoom);

    // Dessin des papiers
    [...agents, ...users].forEach(paper => paper.draw(ctx));

    ctx.restore();

    if (window.stats) window.stats.end();
    requestAnimationFrame(render);
}

function drawGrid() {
    const gridSize = 50;
    const gridColor = '#e5e5e5';
    
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    
    // Calcul des limites de la grille visible
    const startX = Math.floor(-viewportX / zoom / gridSize) * gridSize;
    const startY = Math.floor(-viewportY / zoom / gridSize) * gridSize;
    const endX = startX + (canvas.width / zoom) + gridSize;
    const endY = startY + (canvas.height / zoom) + gridSize;
    
    // Dessin des lignes verticales
    for (let x = startX; x <= endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
    }
    
    // Dessin des lignes horizontales
    for (let y = startY; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
    }
}

// Ajout de la fonction d'initialisation du moniteur
function initPerformanceMonitor() {
    // Création d'un script pour charger Stats.js
    const script = document.createElement('script');
    script.onload = function() {
        window.stats = new Stats();
        window.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(window.stats.dom);
        window.stats.dom.style.position = 'fixed';
        window.stats.dom.style.top = '60px';
        window.stats.dom.style.left = '10px';
        window.stats.dom.style.zIndex = '1000';
    };
    script.src = 'https://mrdoob.github.io/stats.js/build/stats.min.js';
    document.head.appendChild(script);
}

// Démarrage
init(); 
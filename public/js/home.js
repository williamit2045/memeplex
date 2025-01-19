// home.js
const cardContent = {
    card1: {
        hoverText: "The gold of our era is knowledge, and by making reading a more engaging process, we can generate more of it.",
        overlayTitle: "Transform Your Reading Experience",
        overlayText: "Step into an interactive content platform where every tag and comment enriches understanding. Share insights, discover connections, and contribute to a growing knowledge network."
    },
    card2: {
        hoverText: "By making it more interactive to digest online content, our network can develop knowledge about public content for everyone.",
        overlayTitle: "Navigate the Knowledge Network",
        overlayText: "Explore a dynamic ecosystem of interconnected ideas. Uncover patterns and insights that emerge from our community's collective wisdom."
    },
    card3: {
        hoverText: "Readers and curators can both get paid getting better at communicating.",
        overlayTitle: "Pioneer the Knowledge Economy",
        overlayText: "Transform your intellectual contributions into tangible rewards. Our platform offers sponsorships and recognition for quality content creators."
    }
};

// Initialize hover text for all cards
function initializeHoverText() {
    document.querySelectorAll('.card').forEach(card => {
        const hoverText = card.querySelector('.hover-text');
        if (hoverText && card.id) {
            hoverText.textContent = cardContent[card.id].hoverText;
        }
    });
}

let lastTappedCard = null;
let lastTapTime = 0;

function handleCardInteraction(card) {
    const now = Date.now();
    const cardId = card.id;
    
    // Handle desktop click
    if (window.matchMedia('(hover: hover)').matches) {
        showFullscreenOverlay(cardId);
        return;
    }
    
    // Handle mobile touch
    if (lastTappedCard === card && (now - lastTapTime) < 300) {
        showFullscreenOverlay(cardId);
    } else {
        if (lastTappedCard && lastTappedCard !== card) {
            lastTappedCard.classList.remove('hover-active');
        }
        card.classList.toggle('hover-active');
    }
    
    lastTappedCard = card;
    lastTapTime = now;
}

function showFullscreenOverlay(cardId) {
    const overlay = document.getElementById('fullscreenOverlay');
    const title = document.getElementById('overlayTitle');
    const text = document.getElementById('overlayText');
    
    if (overlay && title && text) {
        overlay.setAttribute('data-card', cardId);
        title.textContent = cardContent[cardId].overlayTitle;
        text.textContent = cardContent[cardId].overlayText;
        overlay.classList.add('active');
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize hover text
    initializeHoverText();

    // Set up overlay click handler
    document.getElementById('fullscreenOverlay').addEventListener('click', function() {
        this.classList.remove('active');
    });

    // Add touch device class if needed
    if (!window.matchMedia('(hover: hover)').matches) {
        document.querySelectorAll('.card').forEach(card => {
            card.classList.add('touch-device');
        });
    }
});
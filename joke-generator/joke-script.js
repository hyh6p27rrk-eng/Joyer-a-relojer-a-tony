// ===========================
// JOKE GENERATOR JAVASCRIPT
// ===========================

// API Configuration
const API_BASE_URL = 'https://v2.jokeapi.dev/joke';
const STORAGE_KEY_FAVORITES = 'jokeGeneratorFavorites';
const STORAGE_KEY_HISTORY = 'jokeGeneratorHistory';
const STORAGE_KEY_SETTINGS = 'jokeGeneratorSettings';

// State Management
let state = {
    currentJoke: null,
    jokeCount: 0,
    selectedCategory: 'any',
    safeMode: true,
    darkMode: false,
    favorites: [],
    history: []
};

// DOM Elements
const newJokeBtn = document.getElementById('newJokeBtn');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const jokeContent = document.getElementById('jokeContent');
const jokeType = document.getElementById('jokeType');
const loader = document.getElementById('loader');
const categoryBtns = document.querySelectorAll('.category-btn');
const safeModeCheckbox = document.getElementById('safeMode');
const darkModeCheckbox = document.getElementById('darkMode');
const clearAllBtn = document.getElementById('clearAllBtn');
const jokeCountDisplay = document.getElementById('jokeCount');
const favoriteCountDisplay = document.getElementById('favoriteCount');
const favoritesList = document.getElementById('favoritesList');
const historyList = document.getElementById('historyList');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadFavorites();
    loadHistory();
    setupEventListeners();
    displayWelcomeMessage();
});

// ===========================
// EVENT LISTENERS
// ===========================

function setupEventListeners() {
    newJokeBtn.addEventListener('click', getRandomJoke);
    copyBtn.addEventListener('click', copyJokeToClipboard);
    shareBtn.addEventListener('click', shareJoke);
    clearAllBtn.addEventListener('click', clearAllData);
    safeModeCheckbox.addEventListener('change', toggleSafeMode);
    darkModeCheckbox.addEventListener('change', toggleDarkMode);

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.selectedCategory = e.target.dataset.category;
            getRandomJoke();
        });
    });
}

// ===========================
// FETCH JOKE FROM API
// ===========================

async function getRandomJoke() {
    try {
        showLoader(true);
        newJokeBtn.disabled = true;

        // Build API URL
        const category = state.selectedCategory === 'any' ? 'Any' : state.selectedCategory;
        const safeParam = state.safeMode ? '?safe-mode' : '';
        const url = `${API_BASE_URL}/${category}${safeParam}`;

        // Fetch joke
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        // Check for error
        if (data.error) {
            displayError('No jokes found for this category!');
            showLoader(false);
            newJokeBtn.disabled = false;
            return;
        }

        // Store joke
        state.currentJoke = data;
        state.jokeCount++;

        // Display joke
        displayJoke(data);

        // Add to history
        addToHistory(data);

        // Update counters
        updateCounters();

        showLoader(false);
        newJokeBtn.disabled = false;

    } catch (error) {
        console.error('Error fetching joke:', error);
        displayError('Failed to fetch joke. Please try again!');
        showLoader(false);
        newJokeBtn.disabled = false;
    }
}

// ===========================
// DISPLAY JOKE
// ===========================

function displayJoke(joke) {
    let jokeText = '';

    if (joke.type === 'single') {
        jokeText = joke.joke;
    } else if (joke.type === 'twopart') {
        jokeText = `${joke.setup}<br><br><strong>${joke.delivery}</strong>`;
    }

    jokeContent.innerHTML = jokeText;

    // Display joke category
    let categoryLabel = joke.category.toUpperCase();
    if (joke.safe === false) {
        categoryLabel += ' • EXPLICIT';
    }

    jokeType.innerHTML = `<span>${categoryLabel} • ${joke.type.toUpperCase()}</span>`;

    // Add animation
    jokeContent.style.animation = 'none';
    setTimeout(() => {
        jokeContent.style.animation = 'fadeIn 0.5s ease';
    }, 10);
}

function displayError(message) {
    jokeContent.textContent = '❌ ' + message;
    jokeType.innerHTML = '<span>ERROR</span>';
    state.currentJoke = null;
}

function displayWelcomeMessage() {
    jokeContent.innerHTML = '<i class="fas fa-smile" style="font-size: 3rem; color: #667eea;"></i><p style="margin-top: 20px;">Click "New Joke" to get started!</p>';
    jokeType.innerHTML = '<span>READY TO LAUGH</span>';
}

// ===========================
// LOADER
// ===========================

function showLoader(show) {
    if (show) {
        loader.classList.remove('hidden');
    } else {
        loader.classList.add('hidden');
    }
}

// ===========================
// COPY & SHARE
// ===========================

function copyJokeToClipboard() {
    if (!state.currentJoke) {
        alert('No joke to copy!');
        return;
    }

    let jokeText = '';

    if (state.currentJoke.type === 'single') {
        jokeText = state.currentJoke.joke;
    } else if (state.currentJoke.type === 'twopart') {
        jokeText = `${state.currentJoke.setup}\n\n${state.currentJoke.delivery}`;
    }

    navigator.clipboard.writeText(jokeText).then(() => {
        showNotification('✓ Joke copied to clipboard!');
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    }).catch(() => {
        alert('Failed to copy joke');
    });
}

function shareJoke() {
    if (!state.currentJoke) {
        alert('No joke to share!');
        return;
    }

    let jokeText = '';

    if (state.currentJoke.type === 'single') {
        jokeText = state.currentJoke.joke;
    } else if (state.currentJoke.type === 'twopart') {
        jokeText = `${state.currentJoke.setup}\n${state.currentJoke.delivery}`;
    }

    if (navigator.share) {
        navigator.share({
            title: '😂 Check out this joke!',
            text: jokeText,
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback for browsers that don't support Web Share API
        const encodedText = encodeURIComponent(jokeText);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
        window.open(twitterUrl, '_blank');
        showNotification('📱 Opening Twitter to share...');
    }
}

// ===========================
// FAVORITES
// ===========================

function addToFavorites() {
    if (!state.currentJoke) return;

    const jokeId = generateJokeId(state.currentJoke);
    
    // Check if already favorited
    if (state.favorites.some(fav => generateJokeId(fav) === jokeId)) {
        showNotification('Already in favorites!');
        return;
    }

    state.favorites.push(state.currentJoke);
    saveFavorites();
    updateFavoritesList();
    updateCounters();
    showNotification('❤️ Added to favorites!');
}

function removeFromFavorites(jokeId) {
    state.favorites = state.favorites.filter(fav => generateJokeId(fav) !== jokeId);
    saveFavorites();
    updateFavoritesList();
    updateCounters();
    showNotification('❌ Removed from favorites');
}

function updateFavoritesList() {
    if (state.favorites.length === 0) {
        favoritesList.innerHTML = '<p class="no-favorites">No favorites yet. Click on a joke to add it!</p>';
        return;
    }

    favoritesList.innerHTML = state.favorites.map((joke, index) => {
        const jokeId = generateJokeId(joke);
        const jokeText = joke.type === 'single' ? joke.joke : `${joke.setup} - ${joke.delivery}`;
        
        return `
            <div class="joke-item" data-joke-id="${jokeId}">
                <div class="joke-item-text">${escapeHtml(jokeText)}</div>
                <div class="joke-item-actions">
                    <button class="joke-item-btn" onclick="copyFavorite('${jokeId}')" title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="joke-item-btn" onclick="removeFromFavorites('${jokeId}')" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function copyFavorite(jokeId) {
    const joke = state.favorites.find(fav => generateJokeId(fav) === jokeId);
    if (!joke) return;

    let jokeText = '';
    if (joke.type === 'single') {
        jokeText = joke.joke;
    } else {
        jokeText = `${joke.setup}\n\n${joke.delivery}`;
    }

    navigator.clipboard.writeText(jokeText).then(() => {
        showNotification('✓ Copied!');
    });
}

// ===========================
// HISTORY
// ===========================

function addToHistory(joke) {
    // Limit history to 10 items
    if (state.history.length >= 10) {
        state.history.pop();
    }

    state.history.unshift(joke);
    saveHistory();
    updateHistoryList();
}

function updateHistoryList() {
    if (state.history.length === 0) {
        historyList.innerHTML = '<p class="no-history">No history yet.</p>';
        return;
    }

    historyList.innerHTML = state.history.map((joke, index) => {
        const jokeId = generateJokeId(joke);
        const jokeText = joke.type === 'single' ? joke.joke : `${joke.setup} - ${joke.delivery}`;
        
        return `
            <div class="joke-item" data-joke-id="${jokeId}">
                <div class="joke-item-text">${escapeHtml(jokeText)}</div>
                <div class="joke-item-actions">
                    <button class="joke-item-btn" onclick="copyFavorite('${jokeId}')" title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="joke-item-btn" onclick="addToFavorites()" title="Add to Favorites">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ===========================
// SETTINGS
// ===========================

function toggleSafeMode(e) {
    state.safeMode = e.target.checked;
    saveSettings();
    showNotification(state.safeMode ? '🛡️ Safe Mode ON' : '⚠️ Safe Mode OFF');
}

function toggleDarkMode(e) {
    state.darkMode = e.target.checked;
    saveSettings();
    
    if (state.darkMode) {
        document.body.classList.add('dark-mode');
        showNotification('🌙 Dark Mode ON');
    } else {
        document.body.classList.remove('dark-mode');
        showNotification('☀️ Light Mode ON');
    }
}

function clearAllData() {
    if (confirm('Are you sure? This will clear all favorites and history!')) {
        state.favorites = [];
        state.history = [];
        state.jokeCount = 0;
        state.currentJoke = null;
        
        saveFavorites();
        saveHistory();
        saveSettings();
        
        updateFavoritesList();
        updateHistoryList();
        updateCounters();
        displayWelcomeMessage();
        
        showNotification('🗑️ All data cleared!');
    }
}

// ===========================
// LOCAL STORAGE
// ===========================

function saveFavorites() {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(state.favorites));
}

function loadFavorites() {
    const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
    if (saved) {
        state.favorites = JSON.parse(saved);
        updateFavoritesList();
    }
}

function saveHistory() {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(state.history));
}

function loadHistory() {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (saved) {
        state.history = JSON.parse(saved);
        updateHistoryList();
    }
}

function saveSettings() {
    const settings = {
        safeMode: state.safeMode,
        darkMode: state.darkMode,
        jokeCount: state.jokeCount
    };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
        const settings = JSON.parse(saved);
        state.safeMode = settings.safeMode;
        state.darkMode = settings.darkMode;
        state.jokeCount = settings.jokeCount || 0;
        
        // Apply settings
        safeModeCheckbox.checked = state.safeMode;
        darkModeCheckbox.checked = state.darkMode;
        
        if (state.darkMode) {
            document.body.classList.add('dark-mode');
        }
        
        updateCounters();
    }
}

// ===========================
// UTILITIES
// ===========================

function updateCounters() {
    jokeCountDisplay.textContent = state.jokeCount;
    favoriteCountDisplay.textContent = state.favorites.length;
}

function generateJokeId(joke) {
    // Create a unique ID based on joke content
    const text = joke.type === 'single' ? joke.joke : `${joke.setup}${joke.delivery}`;
    return btoa(text).substring(0, 8);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: 600;
        z-index: 2000;
        animation: slideInUp 0.3s ease;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===========================
// KEYBOARD SHORTCUTS
// ===========================

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        getRandomJoke();
    }
    if (e.code === 'KeyC' && e.ctrlKey) {
        e.preventDefault();
        copyJokeToClipboard();
    }
    if (e.code === 'KeyF' && e.ctrlKey) {
        e.preventDefault();
        addToFavorites();
    }
});

// ===========================
// ANIMATIONS
// ===========================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(20px);
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

console.log('😂 Joke Generator loaded successfully!');
console.log('💡 Tip: Press SPACE to get a new joke, CTRL+C to copy, CTRL+F to favorite!');
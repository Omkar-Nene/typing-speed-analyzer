const typingText = document.querySelector('.typing-text p')
const inputField = document.querySelector('.wrapper .input-field')
const time = document.querySelector('.time span b')
const mistakes = document.querySelector('.mistakes span')
const wpm = document.querySelector('.wpm span')
const cpm = document.querySelector('.cpm span')
const tryAgain = document.querySelector('button')
const contentDiv = document.querySelector('.content')
const typingTextDiv = document.querySelector('.typing-text')
const contentBox = document.querySelector('.content-box')
const instructionsDiv = document.querySelector('.mt-6.text-center')

// Leaderboard elements
const usernameModal = document.getElementById('username-modal')
const usernameInput = document.getElementById('username-input')
const usernameSubmit = document.getElementById('username-submit')
const userDisplay = document.getElementById('user-display')
const changeUserBtn = document.getElementById('change-user-btn')
const leaderboardBtn = document.getElementById('leaderboard-btn')
const leaderboardModal = document.getElementById('leaderboard-modal')
const closeLeaderboard = document.getElementById('close-leaderboard')
const globalTab = document.getElementById('global-tab')
const personalTab = document.getElementById('personal-tab')
const leaderboardBody = document.getElementById('leaderboard-body')
const personalStats = document.getElementById('personal-stats')

// Initialize managers
const userManager = new UserManager()
const leaderboardManager = new LeaderboardManager()

//set value
let timer;
let maxTime = 60;
let timeLeft = maxTime;
let charIndex = 0;
let mistakesCount = 0;
let isTyping = false;
let maxMistakes = 0; // Track highest mistake count ever reached


//loads the paragraph to be written
function loadParagraph(){
    const paragraph = [
        "The quick brown fox jumps over the lazy dog near the riverbank. Meanwhile, children play happily in the park under the warm afternoon sun.",
        "Technology has transformed how we communicate and work in the modern world. Smartphones and computers connect us instantly across vast distances.",
        "Learning new skills requires patience, practice, and dedication every single day. Progress may seem slow at first, but consistency always pays off.",
        "The ocean waves crash against the rocky shore as seagulls circle overhead. Fishermen prepare their boats for an early morning journey.",
        "Music brings people together regardless of language or cultural differences. A simple melody can evoke powerful emotions and cherished memories.",
        "Reading books opens doors to new worlds and expands our imagination. Every story teaches us something valuable about life and human nature.",
        "Mountain peaks covered in snow stand majestically against the clear blue sky. Hikers challenge themselves to reach the summit before sunset.",
        "Coffee shops buzz with conversation as people meet to share ideas. The aroma of freshly brewed coffee fills the cozy atmosphere.",
        "Artists express their creativity through colors, shapes, and innovative techniques. Each painting tells a unique story that words cannot capture.",
        "Gardens flourish when given proper care, sunlight, and regular watering. Flowers bloom beautifully, attracting butterflies and busy bees.",
        "Scientists work diligently to solve complex problems facing our planet today. Research and innovation drive progress toward a better future.",
        "Basketball players practice their shots and teamwork throughout the season. Victory requires discipline, strategy, and excellent coordination.",
        "Ancient civilizations built magnificent structures that still amaze us today. Their architectural achievements demonstrate remarkable engineering skills.",
        "Cooking delicious meals brings joy to both the chef and diners. Fresh ingredients combined with passion create memorable culinary experiences.",
        "Writing clearly and concisely takes time and effort to master properly. Good communication skills are essential in every profession."
    ];

        const randomIndex = Math.floor(Math.random()*paragraph.length);
        const selectedText = paragraph[randomIndex];

        typingText.innerHTML='';

        // Wrap each character in a span
        let html = '';
        for (let i = 0; i < selectedText.length; i++) {
            const char = selectedText[i];
            if (char === ' ') {
                html += '<span class="space"> </span>';
            } else {
                html += `<span>${char}</span>`;
            }
        }
        typingText.innerHTML = html;

        typingText.querySelectorAll('span')[0].classList.add('active');
        document.addEventListener('keydown', (e)=> {
            // Only focus input if no modal is open
            if (usernameModal.classList.contains('hidden') && leaderboardModal.classList.contains('hidden')) {
                inputField.focus();
            }
        });
        typingText.addEventListener('click', ()=>inputField.focus());
}

//handle user input
function initTyping(){
    const characters = typingText.querySelectorAll('span');
    let typedValue = inputField.value;

    // Prevent typing beyond the text length
    if (typedValue.length > characters.length) {
        inputField.value = typedValue.substring(0, characters.length);
        typedValue = inputField.value;
    }

    // Start timer on first keystroke
    if (!isTyping && typedValue.length > 0) {
        timer = setInterval(initTimer, 1000);
        isTyping = true;
    }

    // If input is empty or time is up, don't process
    if (timeLeft <= 0) {
        clearInterval(timer);
        return;
    }

    // Count current mistakes
    let currentMistakes = 0;
    let correctChars = 0;

    characters.forEach((span, index) => {
        const typedChar = typedValue[index];
        const targetChar = span.innerText;

        // Remove all previous classes
        span.classList.remove('correct', 'incorrect', 'active');

        if (typedChar == null) {
            // Not typed yet
            if (index === typedValue.length) {
                span.classList.add('active');
            }
        } else if (typedChar === targetChar) {
            // Correct character
            span.classList.add('correct');
            correctChars++;
        } else {
            // Incorrect character
            span.classList.add('incorrect');
            currentMistakes++;
        }
    });

    // Track maximum mistakes (cumulative - doesn't decrease when corrected)
    if (currentMistakes > maxMistakes) {
        maxMistakes = currentMistakes;
    }

    // Update stats
    charIndex = typedValue.length;
    mistakes.innerText = maxMistakes;
    cpm.innerText = correctChars;

    // Check if typing is complete
    if (typedValue.length >= characters.length) {
        mistakesCount = maxMistakes; // Set final mistake count
        showResults();
    }
}

function initTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        time.innerText = timeLeft;
        const wpmValue = Math.round(((charIndex - mistakesCount)/5)/(maxTime - timeLeft)*60);
        wpm.innerText = wpmValue;
    }
    else {
        clearInterval(timer);
        showResults();
    }
}

async function showResults() {
    clearInterval(timer);
    inputField.blur();

    // Hide typing area, stats section, and instructions
    typingTextDiv.style.display = 'none';
    contentDiv.style.display = 'none';
    instructionsDiv.style.display = 'none';

    // Calculate final stats
    const finalWPM = parseInt(wpm.innerText);
    const finalCPM = parseInt(cpm.innerText);
    const finalMistakes = mistakesCount;
    const timeTaken = maxTime - timeLeft;
    const accuracy = Math.round(((charIndex - mistakesCount) / charIndex) * 100) || 0;

    // Save score to Supabase
    const username = userManager.getUser();
    const scoreData = {
        name: username,
        wpm: finalWPM,
        cpm: finalCPM,
        mistakes: finalMistakes,
        accuracy: accuracy,
        time_taken: timeTaken
    };

    await saveScoreToLeaderboard(scoreData);

    // Calculate composite score
    const compositeScore = leaderboardManager.calculateScore(finalWPM, accuracy, finalMistakes);
    const scoreBreakdown = leaderboardManager.getScoreBreakdown(finalWPM, accuracy, finalMistakes);

    // Get user's rank
    const rank = await leaderboardManager.getUserRank(username, compositeScore);

    // Create results div to replace everything in content-box
    const resultsDiv = document.createElement('div');
    resultsDiv.id = 'results-display';
    resultsDiv.className = 'text-center py-6';
    resultsDiv.innerHTML = `
        <h2 class="text-2xl font-bold text-green-600 mb-4">Test Complete!</h2>

        <!-- Composite Score Display -->
        <div class="mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-xl p-6 shadow-lg">
            <p class="text-sm font-medium opacity-90 mb-2">Your Composite Score</p>
            <p class="text-5xl font-bold mb-2">${compositeScore}/10</p>
            <p class="text-xs opacity-90">Speed: ${scoreBreakdown.wpm} + Accuracy: ${scoreBreakdown.accuracy} + Consistency: ${scoreBreakdown.consistency}</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-md">
                <p class="text-sm font-medium opacity-90 mb-1">WPM</p>
                <p class="text-3xl font-bold">${finalWPM}</p>
            </div>
            <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 shadow-md">
                <p class="text-sm font-medium opacity-90 mb-1">CPM</p>
                <p class="text-3xl font-bold">${finalCPM}</p>
            </div>
            <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-4 shadow-md">
                <p class="text-sm font-medium opacity-90 mb-1">Mistakes</p>
                <p class="text-3xl font-bold">${finalMistakes}</p>
            </div>
            <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4 shadow-md">
                <p class="text-sm font-medium opacity-90 mb-1">Accuracy</p>
                <p class="text-3xl font-bold">${accuracy}%</p>
            </div>
        </div>
        <p class="text-gray-600 text-sm mb-2">Time: ${timeTaken}s</p>
        ${rank ? `<p class="text-indigo-600 font-semibold mb-4">🏆 Your Rank: #${rank} globally</p>` : ''}
        <div class="flex gap-3 justify-center">
            <button id="view-leaderboard-btn" class="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 active:scale-95 transition-all duration-200">
                📊 View Leaderboard
            </button>
            <button id="try-again-btn" class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 active:scale-95 transition-all duration-200">
                Try Again
            </button>
        </div>
    `;

    contentBox.appendChild(resultsDiv);

    // Add event listeners to the new buttons
    document.getElementById('try-again-btn').addEventListener('click', reset);
    document.getElementById('view-leaderboard-btn').addEventListener('click', openLeaderboard);
}

function reset() {
    // Remove results display if it exists
    const resultsDiv = document.getElementById('results-display');
    if (resultsDiv) {
        resultsDiv.remove();
    }

    // Show typing area, stats section, and instructions again
    typingTextDiv.style.display = 'flex';
    contentDiv.style.display = 'block';
    instructionsDiv.style.display = 'block';

    loadParagraph();
    clearInterval(timer);
    timeLeft = maxTime;
    time.innerText = timeLeft;
    inputField.value = '';
    charIndex = 0;
    mistakesCount = 0;
    maxMistakes = 0;
    isTyping = false;
    wpm.innerText = 0;
    cpm.innerText = 0;
    mistakes.innerText = 0;
}

inputField.addEventListener("input", initTyping);
tryAgain.addEventListener('click', reset);

// ========== LEADERBOARD FUNCTIONALITY ==========

// Check if user exists, if not show username modal
function initializeApp() {
    if (!userManager.hasUser()) {
        usernameModal.classList.remove('hidden');
    } else {
        updateUserDisplay();
        loadParagraph();
    }
}

// Generate avatar color based on username
function getAvatarColor(username) {
    const colors = [
        'from-red-500 to-pink-600',
        'from-blue-500 to-indigo-600',
        'from-green-500 to-emerald-600',
        'from-yellow-500 to-orange-600',
        'from-purple-500 to-pink-600',
        'from-indigo-500 to-purple-600',
        'from-cyan-500 to-blue-600',
        'from-rose-500 to-red-600',
        'from-teal-500 to-cyan-600',
        'from-amber-500 to-yellow-600'
    ];

    // Generate a consistent index based on username
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

// Update user display in header
function updateUserDisplay() {
    const username = userManager.getUser();
    if (username) {
        // Update username text
        userDisplay.textContent = username;

        // Update avatar
        const avatar = document.getElementById('user-avatar');
        const initial = username.charAt(0).toUpperCase();
        avatar.textContent = initial;

        // Set avatar color based on username
        const colorClass = getAvatarColor(username);
        avatar.className = `w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-lg shadow-md`;
    }
}

// Username modal handlers
usernameSubmit.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        userManager.saveUser(username);
        updateUserDisplay();
        usernameModal.classList.add('hidden');
        loadParagraph();
    } else {
        alert('Please enter a valid name');
    }
});

// Allow Enter key to submit username
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        usernameSubmit.click();
    }
});

// Change user button handler
changeUserBtn.addEventListener('click', () => {
    // Clear current test if in progress
    clearInterval(timer);

    // Show username modal
    usernameInput.value = '';
    usernameModal.classList.remove('hidden');
    usernameInput.focus();

    // Reset the typing test
    reset();
});

// Leaderboard modal handlers
leaderboardBtn.addEventListener('click', openLeaderboard);
closeLeaderboard.addEventListener('click', () => {
    leaderboardModal.classList.add('hidden');
});

// Close modal when clicking outside
leaderboardModal.addEventListener('click', (e) => {
    if (e.target === leaderboardModal) {
        leaderboardModal.classList.add('hidden');
    }
});

async function openLeaderboard() {
    leaderboardModal.classList.remove('hidden');
    await loadGlobalLeaderboard();
}

// Tab switching
globalTab.addEventListener('click', async () => {
    leaderboardManager.currentView = 'global';
    updateTabStyles('global');
    personalStats.classList.add('hidden');
    await loadGlobalLeaderboard();
});

personalTab.addEventListener('click', async () => {
    leaderboardManager.currentView = 'personal';
    updateTabStyles('personal');
    personalStats.classList.remove('hidden');
    await loadPersonalHistory();
    await loadPersonalStats();
});

function updateTabStyles(activeTab) {
    if (activeTab === 'global') {
        globalTab.className = 'tab-btn px-6 py-2 font-semibold text-indigo-600 border-b-2 border-indigo-600';
        personalTab.className = 'tab-btn px-6 py-2 font-semibold text-gray-500 hover:text-indigo-600';
    } else {
        personalTab.className = 'tab-btn px-6 py-2 font-semibold text-indigo-600 border-b-2 border-indigo-600';
        globalTab.className = 'tab-btn px-6 py-2 font-semibold text-gray-500 hover:text-indigo-600';
    }
}

// Score info modal handlers
const scoreInfoBtn = document.getElementById('score-info-btn');
const scoreInfoModal = document.getElementById('score-info-modal');
const closeScoreInfo = document.getElementById('close-score-info');
const closeScoreInfoBtn = document.getElementById('close-score-info-btn');

scoreInfoBtn.addEventListener('click', () => {
    scoreInfoModal.classList.remove('hidden');
});

closeScoreInfo.addEventListener('click', () => {
    scoreInfoModal.classList.add('hidden');
});

closeScoreInfoBtn.addEventListener('click', () => {
    scoreInfoModal.classList.add('hidden');
});

scoreInfoModal.addEventListener('click', (e) => {
    if (e.target === scoreInfoModal) {
        scoreInfoModal.classList.add('hidden');
    }
});

// Load global leaderboard
async function loadGlobalLeaderboard() {
    const result = await leaderboardManager.getGlobalLeaderboard();
    if (result.success) {
        renderLeaderboard(result.data, false);
    } else {
        leaderboardBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-500">Failed to load leaderboard</td></tr>';
    }
}

// Load personal history
async function loadPersonalHistory() {
    const username = userManager.getUser();
    const result = await leaderboardManager.getPersonalHistory(username);
    if (result.success) {
        renderLeaderboard(result.data, true);
    } else {
        leaderboardBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-500">No scores yet. Complete a test to see your history!</td></tr>';
    }
}

// Load personal stats
async function loadPersonalStats() {
    const username = userManager.getUser();
    const stats = await leaderboardManager.getPersonalStats(username);

    document.getElementById('best-wpm').textContent = stats.bestWpm;
    document.getElementById('avg-wpm').textContent = stats.avgWpm;
    document.getElementById('total-tests').textContent = stats.totalTests;
}

// Render leaderboard table
function renderLeaderboard(scores, isPersonal) {
    const currentUser = userManager.getUser();

    if (!scores || scores.length === 0) {
        leaderboardBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-500">No scores yet. Be the first!</td></tr>';
        return;
    }

    leaderboardBody.innerHTML = scores.map((score, index) => {
        const rank = index + 1;
        const isCurrentUser = score.name === currentUser;
        const rowClass = isCurrentUser ? 'bg-indigo-50' : '';

        // Generate avatar for each user
        const initial = score.name.charAt(0).toUpperCase();
        const colorClass = getAvatarColor(score.name);

        return `
            <tr class="${rowClass}">
                <td class="px-4 py-3 text-left font-semibold">${leaderboardManager.getRankEmoji(rank)}</td>
                <td class="px-4 py-3 text-left">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            ${initial}
                        </div>
                        <span class="font-medium">${score.name}${isCurrentUser ? ' <span class="text-indigo-600 text-xs">(You)</span>' : ''}</span>
                    </div>
                </td>
                <td class="px-4 py-3 text-center font-bold text-yellow-600 text-lg">${score.score}/10</td>
                <td class="px-4 py-3 text-center text-blue-600">${score.wpm}</td>
                <td class="px-4 py-3 text-center text-purple-600">${score.accuracy}%</td>
                <td class="px-4 py-3 text-center text-red-600">${score.mistakes}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-500">${leaderboardManager.formatDate(score.created_at)}</td>
            </tr>
        `;
    }).join('');
}

// Save score after test completion
async function saveScoreToLeaderboard(scoreData) {
    const result = await leaderboardManager.saveScore(scoreData);
    if (result.success) {
        console.log('Score saved successfully!');
        return true;
    } else {
        console.error('Failed to save score:', result.error);
        return false;
    }
}

// Initialize the app
initializeApp();

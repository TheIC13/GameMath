// Math Adventure Quest - script.js
let gameState = {
    currentLevel: 1,
    totalStars: 0,
    tickets: 0,
    levelStars: Array(10).fill(0), // 0 = not completed, 1 = completed
    questions: [],
    currentQuestionIndex: 0,
    soundEnabled: true
};

// Sound effects using Web Audio API
function playSound(frequency, duration, type = 'sine', volume = 0.3) {
    if (!gameState.soundEnabled) return;
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;

        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);

        showSoundIndicator();
    } catch (e) {
        console.log('Audio not supported', e);
    }
}

function showSoundIndicator() {
    const indicator = document.getElementById('sound-indicator');
    if (!indicator) return;
    indicator.style.display = 'block';
    setTimeout(() => {
        indicator.style.display = 'none';
    }, 500);
}

function playCorrectSound() {
    playSound(523, 0.18);
    setTimeout(() => playSound(659, 0.18), 100);
    setTimeout(() => playSound(784, 0.22), 200);
}

function playWrongSound() {
    playSound(400, 0.25, 'sawtooth', 0.2);
    setTimeout(() => playSound(300, 0.35, 'sawtooth', 0.18), 150);
}

function playClickSound() {
    playSound(800, 0.08, 'square', 0.18);
}

function playLevelCompleteSound() {
    playSound(523, 0.18);
    setTimeout(() => playSound(659, 0.18), 100);
    setTimeout(() => playSound(784, 0.18), 200);
    setTimeout(() => playSound(1047, 0.34), 300);
}

function playTicketSound() {
    playSound(659, 0.26);
    setTimeout(() => playSound(784, 0.26), 150);
    setTimeout(() => playSound(1047, 0.26), 300);
    setTimeout(() => playSound(1319, 0.44), 450);
}

function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const soundIcon = document.getElementById('sound-icon');
    if (soundIcon) soundIcon.textContent = gameState.soundEnabled ? '🔊' : '🔇';
    if (gameState.soundEnabled) playClickSound();
}

// Question database (10 levels). Each level contains 6 questions.
const questionDatabase = {
    1: [
        { question: "5 + 3 = ?", options: [8, 7, 9, 6], correct: 0, emoji: "🔢" },
        { question: "10 - 4 = ?", options: [6, 7, 5, 8], correct: 0, emoji: "➖" },
        { question: "7 + 2 = ?", options: [9, 8, 10, 7], correct: 0, emoji: "➕" },
        { question: "4 + 6 = ?", options: [10, 9, 11, 8], correct: 0, emoji: "🔢" },
        { question: "8 - 3 = ?", options: [5, 4, 6, 7], correct: 0, emoji: "➖" },
        { question: "6 + 1 = ?", options: [7, 6, 8, 5], correct: 0, emoji: "➕" }
    ],
    2: [
        { question: "12 + 8 = ?", options: [20, 19, 21, 18], correct: 0, emoji: "🔢" },
        { question: "15 - 7 = ?", options: [8, 9, 7, 6], correct: 0, emoji: "➖" },
        { question: "9 + 6 = ?", options: [15, 14, 16, 13], correct: 0, emoji: "➕" },
        { question: "11 + 9 = ?", options: [20, 19, 21, 18], correct: 0, emoji: "🔢" },
        { question: "16 - 8 = ?", options: [8, 7, 9, 6], correct: 0, emoji: "➖" },
        { question: "13 + 4 = ?", options: [17, 16, 18, 15], correct: 0, emoji: "➕" }
    ],
    3: [
        { question: "25 + 15 = ?", options: [40, 39, 41, 38], correct: 0, emoji: "🔢" },
        { question: "30 - 12 = ?", options: [18, 19, 17, 20], correct: 0, emoji: "➖" },
        { question: "14 + 17 = ?", options: [31, 30, 32, 29], correct: 0, emoji: "➕" },
        { question: "22 + 18 = ?", options: [40, 39, 41, 38], correct: 0, emoji: "🔢" },
        { question: "35 - 16 = ?", options: [19, 18, 20, 17], correct: 0, emoji: "➖" },
        { question: "26 + 14 = ?", options: [40, 39, 41, 38], correct: 0, emoji: "➕" }
    ],
    4: [
        { question: "6 × 4 = ?", options: [24, 22, 26, 20], correct: 0, emoji: "✖️" },
        { question: "15 ÷ 3 = ?", options: [5, 4, 6, 3], correct: 0, emoji: "➗" },
        { question: "7 × 3 = ?", options: [21, 20, 22, 19], correct: 0, emoji: "✖️" },
        { question: "5 × 6 = ?", options: [30, 29, 31, 28], correct: 0, emoji: "✖️" },
        { question: "18 ÷ 2 = ?", options: [9, 8, 10, 7], correct: 0, emoji: "➗" },
        { question: "4 × 8 = ?", options: [32, 31, 33, 30], correct: 0, emoji: "✖️" }
    ],
    5: [
        { question: "8 × 7 = ?", options: [56, 54, 58, 52], correct: 0, emoji: "✖️" },
        { question: "36 ÷ 6 = ?", options: [6, 5, 7, 4], correct: 0, emoji: "➗" },
        { question: "9 × 5 = ?", options: [45, 44, 46, 43], correct: 0, emoji: "✖️" },
        { question: "7 × 8 = ?", options: [56, 54, 58, 52], correct: 0, emoji: "✖️" },
        { question: "42 ÷ 7 = ?", options: [6, 5, 7, 4], correct: 0, emoji: "➗" },
        { question: "6 × 9 = ?", options: [54, 53, 55, 52], correct: 0, emoji: "✖️" }
    ],
    6: [
        { question: "12 × 8 = ?", options: [96, 94, 98, 92], correct: 0, emoji: "✖️" },
        { question: "72 ÷ 9 = ?", options: [8, 7, 9, 6], correct: 0, emoji: "➗" },
        { question: "11 × 6 = ?", options: [66, 64, 68, 62], correct: 0, emoji: "✖️" },
        { question: "9 × 12 = ?", options: [108, 106, 110, 104], correct: 0, emoji: "✖️" },
        { question: "81 ÷ 9 = ?", options: [9, 8, 10, 7], correct: 0, emoji: "➗" },
        { question: "7 × 11 = ?", options: [77, 75, 79, 73], correct: 0, emoji: "✖️" }
    ],
    7: [
        { question: "มีลูกอม 24 เม็ด แบ่งให้เด็ก 6 คน เท่าๆ กัน คนละกี่เม็ด?", options: [4, 3, 5, 6], correct: 0, emoji: "🍭" },
        { question: "ซื้อดินสอ 3 แท่ง แท่งละ 15 บาท ใช้เงินทั้งหมดกี่บาท?", options: [45, 40, 50, 35], correct: 0, emoji: "✏️" },
        { question: "ในห้องมีโต๊ะ 8 ตัว โต๊ะละ 4 ขา รวมกี่ขา?", options: [32, 30, 34, 28], correct: 0, emoji: "🪑" },
        { question: "มีขนม 36 ชิ้น แบ่งใส่จาน 9 ใบ เท่าๆ กัน จานละกี่ชิ้น?", options: [4, 3, 5, 6], correct: 0, emoji: "🍪" },
        { question: "ซื้อหนังสือ 5 เล่ม เล่มละ 12 บาท ใช้เงินทั้งหมดกี่บาท?", options: [60, 55, 65, 50], correct: 0, emoji: "📖" },
        { question: "สวนมีต้นไม้ 7 แถว แถวละ 6 ต้น รวมกี่ต้น?", options: [42, 40, 44, 38], correct: 0, emoji: "🌲" }
    ],
    8: [
        { question: "รถบัสมี 45 ที่นั่ง มีผู้โดยสาร 28 คน เหลือที่นั่งว่างกี่ที่?", options: [17, 16, 18, 15], correct: 0, emoji: "🚌" },
        { question: "ซื้อของเล่น 6 ชิ้น ชิ้นละ 25 บาท ใช้เงินทั้งหมดกี่บาท?", options: [150, 145, 155, 140], correct: 0, emoji: "🧸" },
        { question: "มีเหรียญ 10 บาท จำนวน 12 เหรียญ รวมเป็นเงินกี่บาท?", options: [120, 115, 125, 110], correct: 0, emoji: "🪙" },
        { question: "โรงภาพยนตร์มี 8 แถว แถวละ 15 ที่นั่ง รวมกี่ที่นั่ง?", options: [120, 115, 125, 110], correct: 0, emoji: "🎬" },
        { question: "มีลูกบอล 84 ลูก ใส่กล่องละ 12 ลูก ได้กี่กล่อง?", options: [7, 6, 8, 5], correct: 0, emoji: "⚽" },
        { question: "ร้านขายปากกา 9 แพ็ค แพ็คละ 18 บาท รวมเป็นเงินกี่บาท?", options: [162, 160, 164, 158], correct: 0, emoji: "🖊️" }
    ],
    9: [
        { question: "สวนมีต้นไผ่ 144 ต้น ปลูกเป็น 12 แถว แถวละกี่ต้น?", options: [12, 11, 13, 10], correct: 0, emoji: "🎋" },
        { question: "ห้องสมุดมีหนังสือ 15 ชั้น ชั้นละ 24 เล่ม รวมกี่เล่ม?", options: [360, 350, 370, 340], correct: 0, emoji: "📚" },
        { question: "แบ่งลูกกวาด 96 เม็ด ใส่ถุง 8 ถุง เท่าๆ กัน ถุงละกี่เม็ด?", options: [12, 11, 13, 10], correct: 0, emoji: "🍬" },
        { question: "โรงงานผลิตขนม 16 ชั่วโมง ชั่วโมงละ 45 ชิ้น รวมกี่ชิ้น?", options: [720, 710, 730, 700], correct: 0, emoji: "🏭" },
        { question: "มีดอกไม้ 168 ดอก จัดช่อละ 14 ดอก ได้กี่ช่อ?", options: [12, 11, 13, 10], correct: 0, emoji: "💐" },
        { question: "ร้านอาหารมี 18 โต๊ะ โต๊ะละ 6 ที่นั่ง รวมกี่ที่นั่ง?", options: [108, 106, 110, 104], correct: 0, emoji: "🍽️" }
    ],
    10: [
        { question: "25 + 37 = ?", options: [62, 61, 63, 60], correct: 0, emoji: "➕" },
        { question: "84 - 29 = ?", options: [55, 54, 56, 53], correct: 0, emoji: "➖" },
        { question: "13 × 7 = ?", options: [91, 89, 93, 87], correct: 0, emoji: "✖️" },
        { question: "144 ÷ 12 = ?", options: [12, 11, 13, 10], correct: 0, emoji: "➗" },
        { question: "โรงเรียนมีนักเรียน 18 ห้อง ห้องละ 35 คน รวมกี่คน?", options: [630, 620, 640, 610], correct: 0, emoji: "🏫" },
        { question: "ร้านขายไข่ 252 ฟอง บรรจุกล่องละ 12 ฟอง ได้กี่กล่อง?", options: [21, 20, 22, 19], correct: 0, emoji: "🥚" }
    ]
};

// Utility: Fisher-Yates shuffle
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function initializeGame() {
    generateLevelGrid();
    updateDisplay();
}

function generateLevelGrid() {
    const levelGrid = document.getElementById('level-grid');
    levelGrid.innerHTML = '';

    for (let i = 1; i <= 10; i++) {
        const isCompleted = gameState.levelStars[i-1] === 1;
        const isLocked = i > gameState.currentLevel && !isCompleted;
        const isCurrent = i === gameState.currentLevel;

        let card = document.createElement('div');
        card.className = 'level-card text-white rounded-2xl p-6 text-center shadow-lg';

        let icon = '';
        if (isCompleted) { card.classList.add('completed'); icon = '⭐'; }
        else if (isCurrent) { card.classList.add('current'); icon = '🎯'; }
        else if (isLocked) { card.classList.add('locked'); icon = '🔒'; }
        else { card.classList.add('bg-gradient-to-br','from-purple-500','to-blue-600'); icon = '📝'; }

        card.innerHTML = `<div class="text-4xl mb-2">${icon}</div>
                          <div class="font-bold text-xl">ด่าน ${i}</div>
                          <div class="text-sm opacity-90">${getLevelDescription(i)}</div>`;

        if (!isLocked) {
            card.onclick = () => { playClickSound(); startLevel(i); };
        }

        levelGrid.appendChild(card);
    }
}

function getLevelDescription(level) {
    if (level <= 3) return 'บวก-ลบ';
    if (level <= 6) return 'คูณ-หาร';
    return 'โจทย์ประยุกต์';
}

function startLevel(level) {
    gameState.currentLevel = level;
    const questions = questionDatabase[level] || [];
    gameState.questions = shuffleArray([...questions]);
    gameState.currentQuestionIndex = 0;

    document.getElementById('level-screen').classList.add('hidden');
    document.getElementById('question-screen').classList.remove('hidden');

    showQuestion();
}

function showQuestion() {
    const question = gameState.questions[gameState.currentQuestionIndex];
    if (!question) return;

    document.getElementById('current-level').textContent = gameState.currentLevel;
    document.getElementById('question-number').textContent = gameState.currentQuestionIndex + 1;
    document.getElementById('total-questions').textContent = gameState.questions.length;
    document.getElementById('question-emoji').textContent = question.emoji || '❓';
    document.getElementById('math-problem').textContent = question.question || '';

    // Prepare options and track correct after shuffle
    const shuffledOptions = [...question.options];
    const correctAnswer = shuffledOptions[question.correct];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);

    const optionsContainer = document.getElementById('answer-options');
    optionsContainer.innerHTML = '';
    shuffledOptions.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-3xl font-bold py-6 px-8 rounded-2xl shadow-lg min-h-[80px] flex items-center justify-center';
        btn.textContent = opt;
        btn.onclick = () => selectAnswer(idx, newCorrectIndex);
        optionsContainer.appendChild(btn);
    });

    document.getElementById('feedback-area').classList.add('hidden');
}

function selectAnswer(selectedIndex, correctIndex) {
    const buttons = document.querySelectorAll('.answer-btn');
    const isCorrect = selectedIndex === correctIndex;
    if (isCorrect) playCorrectSound(); else playWrongSound();

    buttons.forEach((btn, index) => {
        btn.disabled = true;
        if (index === selectedIndex) btn.classList.add(isCorrect ? 'correct' : 'wrong');
        if (index === correctIndex && !isCorrect) btn.classList.add('correct');
    });

    setTimeout(() => showFeedback(isCorrect), 900);
}

function showFeedback(isCorrect) {
    const area = document.getElementById('feedback-area');
    const emoji = document.getElementById('feedback-emoji');
    const text = document.getElementById('feedback-text');

    if (isCorrect) {
        emoji.textContent = '🎉';
        text.textContent = 'ยินดีด้วย! คำตอบถูกต้อง';
        text.className = 'text-2xl font-bold mb-4 text-green-600';
        area.classList.remove('hidden');
    } else {
        emoji.textContent = '😅';
        text.textContent = 'ตอบผิด! เริ่มด่านใหม่ใน 1.5 วินาที...';
        text.className = 'text-2xl font-bold mb-4 text-red-600';
        area.classList.remove('hidden');
        setTimeout(() => restartLevel(), 1500);
    }
}

function nextQuestion() {
    playClickSound();
    gameState.currentQuestionIndex++;
    if (gameState.currentQuestionIndex < gameState.questions.length) showQuestion();
    else finishLevel();
}

function finishLevel() {
    // award star if first time
    if (gameState.levelStars[gameState.currentLevel - 1] === 0) {
        gameState.levelStars[gameState.currentLevel - 1] = 1;
        gameState.totalStars++;
        playLevelCompleteSound();
        updateDisplay();
        if (gameState.totalStars === 10) {
            gameState.tickets++;
            setTimeout(() => { playTicketSound(); showRewardModal(); }, 1200);
        }
    }
    // unlock next
    if (gameState.currentLevel < 10) gameState.currentLevel++;
    backToLevels();
}

function restartLevel() {
    startLevel(gameState.currentLevel);
}

function backToLevels() {
    playClickSound();
    document.getElementById('question-screen').classList.add('hidden');
    document.getElementById('level-screen').classList.remove('hidden');
    generateLevelGrid();
}

function updateDisplay() {
    document.getElementById('total-stars').textContent = gameState.totalStars;
    document.getElementById('progress-text').textContent = `${gameState.totalStars}/10 ดาว`;
    const progressPercent = (gameState.totalStars / 10) * 100;
    document.getElementById('progress-bar').style.width = progressPercent + '%';
}

function showRewardModal() {
    const rm = document.getElementById('reward-modal');
    if (!rm) return;
    rm.classList.remove('hidden'); rm.classList.add('flex');
}

function closeRewardModal() {
    playClickSound();
    const rm = document.getElementById('reward-modal');
    if (!rm) return;
    rm.classList.add('hidden'); rm.classList.remove('flex');
}

function showTickets() {
    playClickSound();
    document.getElementById('tickets-count').textContent = gameState.tickets;
    const tm = document.getElementById('tickets-modal');
    tm.classList.remove('hidden'); tm.classList.add('flex');
}

function closeTicketsModal() {
    playClickSound();
    const tm = document.getElementById('tickets-modal');
    tm.classList.add('hidden'); tm.classList.remove('flex');
}

// Initialize
window.onload = initializeGame;

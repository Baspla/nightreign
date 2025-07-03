

// Phase definitions in seconds
const phases = [
    { name: "Storm 1 Phase", duration: 4 * 60 + 25 },
    { name: "Storm is shrinking", duration: 2 * 60 + 55 },
    { name: "Strom 2 Phase", duration: 3 * 60 + 25 },
    { name: "Storm is shrinking further", duration: 2 * 60 + 55 },
];
const bossFightName = "Boss Fight";
const totalDuration = phases.reduce((sum, p) => sum + p.duration, 0);

let currentPhase = 0;
let phaseTimeLeft = phases[0].duration;
let elapsed = 0;
let timer = null;
let running = false;

const phaseDiv = document.getElementById('phase');
const timeDiv = document.getElementById('time');
const progressIndicator = document.getElementById('progress-indicator');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const phaseJumpBtns = document.querySelectorAll('.phase-jump');

function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function getPhaseStartElapsed(phaseIdx) {
    let sum = 0;
    for (let i = 0; i < phaseIdx; ++i) sum += phases[i].duration;
    return sum;
}

function updateDisplay() {
    if (currentPhase < phases.length) {
        phaseDiv.textContent = phases[currentPhase].name;
        timeDiv.textContent = formatTime(phaseTimeLeft);
    } else {
        phaseDiv.textContent = bossFightName;
        timeDiv.textContent = "--:--";
    }
    // Indicator position: not filled, just a bar showing current progress
    const progress = Math.min(elapsed / totalDuration, 1);
    const barWidth = progressIndicator.parentElement.offsetWidth;
    // Center the indicator bar (12px wide)
    const indicatorWidth = 12;
    progressIndicator.style.left = `calc(${progress * 100}% - ${indicatorWidth / 2}px)`;
}

function nextPhase() {
    currentPhase++;
    if (currentPhase < phases.length) {
        phaseTimeLeft = phases[currentPhase].duration;
    } else {
        phaseTimeLeft = 0;
    }
}

function resetTimer() {
    clearTimeout(timer);
    running = false;
    currentPhase = 0;
    phaseTimeLeft = phases[0].duration;
    elapsed = 0;
    startBtn.textContent = "Start";
    updateDisplay();
}

function tick() {
    if (currentPhase < phases.length) {
        if (phaseTimeLeft > 0) {
            phaseTimeLeft--;
            elapsed++;
        } else {
            nextPhase();
        }
        updateDisplay();
        if (currentPhase < phases.length) {
            timer = setTimeout(tick, 1000);
        } else {
            // Boss Fight reached, allow restart
            running = false;
            startBtn.textContent = "Start";
            updateDisplay();
        }
    }
}

startBtn.addEventListener('click', () => {
    if (running) return;
    if (currentPhase >= phases.length) {
        resetTimer();
    }
    running = true;
    startBtn.textContent = "GL HF";
    tick();
});

resetBtn.addEventListener('click', () => {
    resetTimer();
});

phaseJumpBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const phaseIdx = parseInt(btn.getAttribute('data-phase'));
        clearTimeout(timer);
        running = false;
        currentPhase = phaseIdx;
        phaseTimeLeft = phases[phaseIdx].duration;
        elapsed = getPhaseStartElapsed(phaseIdx);
        startBtn.textContent = "Start";
        updateDisplay();
    });
});

const phaseDividers = document.getElementById('phase-dividers');

// Calculate cumulative phase percentages
function updateDividers() {
    phaseDividers.innerHTML = '';
    let cumDuration = 0;
    for (let i = 0; i < phases.length - 1; i++) {
        cumDuration += phases[i].duration;
        const percent = (cumDuration / totalDuration) * 100;
        const divider = document.createElement('div');
        divider.className = 'absolute top-0 h-full border-l border-gray-500';
        divider.style.left = `calc(${percent}% - 1px)`; // -1px to center the 2px border
        phaseDividers.appendChild(divider);
    }
}

// Call this after DOM is ready and on resize
updateDividers();
window.addEventListener('resize', updateDividers);


// Initial display
updateDisplay();

// Responsive: update indicator on resize
window.addEventListener('resize', updateDisplay);
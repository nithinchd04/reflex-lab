let currentUser = localStorage.getItem('activeOperator');
let scores = JSON.parse(localStorage.getItem('labScores')) || { reaction: '--', aim: 0, clicks: 0 };

// --- UI INITIALIZATION ---
window.onload = () => {
    if (currentUser) {
        document.getElementById('user-display').innerText = `OPERATOR: ${currentUser}`;
        document.getElementById('auth-trigger-btn').classList.add('hidden');
        document.getElementById('logout-btn').classList.remove('hidden');
    }
    updatePointsDisplay();
};

function openAuth() { document.getElementById('login-overlay').classList.remove('hidden'); }
function closeAuth() { document.getElementById('login-overlay').classList.add('hidden'); }

function toggleAuthMode(isSignUp) {
    document.getElementById('auth-title').innerText = isSignUp ? "REGISTER IDENTITY" : "SYSTEM LOGIN";
    document.getElementById('login-actions').classList.toggle('hidden', isSignUp);
    document.getElementById('signup-actions').classList.toggle('hidden', !isSignUp);
}

function handleSignUp() {
    const user = document.getElementById('auth-user').value.trim();
    const pass = document.getElementById('auth-pass').value.trim();
    if (user.length < 3) return alert("ID TOO SHORT");
    let users = JSON.parse(localStorage.getItem('userDB')) || {};
    if (users[user]) return alert("ID TAKEN");
    users[user] = pass;
    localStorage.setItem('userDB', JSON.stringify(users));
    alert("REGISTERED. PLEASE LOGIN.");
    toggleAuthMode(false);
}

function handleLogin() {
    const user = document.getElementById('auth-user').value.trim();
    const pass = document.getElementById('auth-pass').value.trim();
    let users = JSON.parse(localStorage.getItem('userDB')) || {};
    if (users[user] && users[user] === pass) {
        localStorage.setItem('activeOperator', user);
        location.reload();
    } else alert("ACCESS DENIED");
}

function logoutOperator() {
    localStorage.removeItem('activeOperator');
    location.reload();
}

// --- GAME ENGINE ---
function switchGame(id) {
    document.querySelectorAll('.game-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('game-' + id).classList.add('active');
    event.currentTarget.classList.add('active');
}

function updatePointsDisplay() {
    document.getElementById('re-best').innerText = scores.reaction;
    document.getElementById('aim-best').innerText = scores.aim;
    document.getElementById('click-best').innerText = scores.clicks;
    if(currentUser) localStorage.setItem('labScores', JSON.stringify(scores));
}

// --- REACTION ---
let reState = 'waiting', reStart;
function handleReaction() {
    const box = document.getElementById('reaction-box'), txt = document.getElementById('re-status');
    if (reState === 'waiting') {
        reState = 'ready'; box.className = 'game-screen ready'; txt.innerText = 'WAIT...';
        setTimeout(() => {
            if (reState !== 'ready') return;
            reState = 'go'; box.className = 'game-screen go'; txt.innerText = 'CLICK!'; reStart = Date.now();
        }, Math.random() * 3000 + 2000);
    } else if (reState === 'go') {
        let diff = Date.now() - reStart;
        reState = 'waiting'; box.className = 'game-screen waiting'; txt.innerText = diff + 'ms';
        if (scores.reaction === '--' || diff < parseInt(scores.reaction)) { scores.reaction = diff + 'ms'; updatePointsDisplay(); }
    }
}

// --- AIM ---
let aimScore = 0, aimTime = 30, aimActive = false;
function startAimTrainer() {
    if(aimActive) return;
    aimScore = 0; aimTime = 30; aimActive = true;
    let timer = setInterval(() => {
        aimTime--; document.getElementById('aim-timer').innerText = aimTime;
        if (aimTime <= 0) {
            clearInterval(timer); aimActive = false; document.getElementById('aim-area').innerHTML = '';
            if (aimScore > scores.aim) { scores.aim = aimScore; updatePointsDisplay(); }
            alert("Aim Session Over. Score: " + aimScore);
        }
    }, 1000);
    spawnTarget();
}
function spawnTarget() {
    if(!aimActive) return;
    const area = document.getElementById('aim-area'); area.innerHTML = '';
    const t = document.createElement('div'); t.className = 'target';
    t.style.top = Math.random() * 85 + '%'; t.style.left = Math.random() * 85 + '%';
    t.onclick = (e) => { e.stopPropagation(); aimScore += 1; document.getElementById('aim-score').innerText = aimScore; spawnTarget(); };
    area.appendChild(t);
}

// --- CLICKER ---
let clickScore = 0, clickTime = 10, clickActive = false;
function startClickerGame() {
    if(clickActive) return;
    clickScore = 0; clickTime = 10; clickActive = true;
    let timer = setInterval(() => {
        clickTime--; document.getElementById('click-timer').innerText = clickTime;
        if (clickTime <= 0) {
            clearInterval(timer); clickActive = false;
            if (clickScore > scores.clicks) { scores.clicks = clickScore; updatePointsDisplay(); }
            alert("Test Complete: " + clickScore + " clicks");
        }
    }, 1000);
}
function handleSpeedClick() { if (clickActive) { clickScore++; document.getElementById('click-score').innerText = clickScore; } }
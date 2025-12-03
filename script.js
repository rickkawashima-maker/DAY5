// Configuration
// IMPORTANT: Replace this URL with your deployed Google Apps Script Web App URL
const GAS_WEB_APP_URL = 'YOUR_GAS_WEB_APP_URL_HERE';

const userId = 'user01';
const userName = 'あなたの名前';

// DOM Elements
const timeDisplay = document.getElementById('current-time');
const dateDisplay = document.getElementById('current-date');
const statusText = document.getElementById('status-text');
const clockInBtn = document.getElementById('clock-in-btn');
const clockOutBtn = document.getElementById('clock-out-btn');
const taskCompleteBtn = document.getElementById('task-complete-btn');
const loadingOverlay = document.getElementById('loading-overlay');

// State
let isClockedIn = false;

// Initialization
function init() {
    updateTime();
    setInterval(updateTime, 1000);
    loadState();

    clockInBtn.addEventListener('click', () => handleAction('clock_in'));
    clockOutBtn.addEventListener('click', () => handleAction('clock_out'));
    taskCompleteBtn.addEventListener('click', () => handleAction('task_complete'));
}

function updateTime() {
    const now = new Date();
    timeDisplay.textContent = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    dateDisplay.textContent = now.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' });
}

function loadState() {
    const savedState = localStorage.getItem('attendanceState');
    if (savedState) {
        const state = JSON.parse(savedState);
        const today = new Date().toLocaleDateString('ja-JP');

        if (state.date !== today) {
            resetState();
        } else {
            isClockedIn = state.isClockedIn;
            updateUI();
        }
    }
}

function saveState() {
    const state = {
        date: new Date().toLocaleDateString('ja-JP'),
        isClockedIn: isClockedIn
    };
    localStorage.setItem('attendanceState', JSON.stringify(state));
}

function resetState() {
    isClockedIn = false;
    saveState();
    updateUI();
}

function updateUI() {
    if (isClockedIn) {
        statusText.textContent = '勤務中';
        statusText.style.color = 'var(--secondary-color)';
        clockInBtn.disabled = true;
        clockOutBtn.disabled = false;
    } else {
        statusText.textContent = '出勤前 / 退勤済';
        statusText.style.color = 'var(--primary-color)';
        clockInBtn.disabled = false;
        clockOutBtn.disabled = true;
    }
}

async function handleAction(actionType) {
    if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL === 'YOUR_GAS_WEB_APP_URL_HERE') {
        alert('エラー: GAS Web App URLが設定されていません。\n\nscript.jsの3行目にGASのWebアプリURLを設定してください。');
        return;
    }

    showLoading(true);

    const payload = {
        action: actionType,
        userId: userId,
        userName: userName,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: JSON.stringify(payload)
        });

        if (actionType === 'clock_in') {
            isClockedIn = true;
            saveState();
            updateUI();
            alert('出勤しました！\n今日も一日頑張りましょう！');
        } else if (actionType === 'clock_out') {
            isClockedIn = false;
            saveState();
            updateUI();
            alert('退勤しました。\nお疲れ様でした！');
        } else if (actionType === 'task_complete') {
            alert('課題完了を報告しました！\n素晴らしい！🎉');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('通信エラーが発生しました。\nもう一度お試しください。');
    } finally {
        showLoading(false);
    }
}

function showLoading(isLoading) {
    if (isLoading) {
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}

// Start
init();

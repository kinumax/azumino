/**
 * ドローン大冒険ゲーム - メインスクリプト
 * 投げ銭機能とコインゲーム対応版
 */

// ゲーム変数
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameRunning = false;
let gameLoopRequestId = null;
let score = 0;
let hp = 100;
let level = 1;
let coins = 0;
let selectedAmount = 0.1;
let streamerSettings = {
    name: '',
    address: 'r4Qo5WWskpMpxhHosZKXoSJucyVLug2U97' // デフォルトアドレス
};

// ドローンのアップグレード状態
let droneUpgrades = {
    hp: 0,
    attack: 0,
    speed: 0,
    special: false
};

// ドローン
const drone = { 
    x: 400, 
    y: 500, 
    width: 50, 
    height: 30, 
    speed: 6, 
    vx: 0, 
    vy: 0, 
    angle: 0,
    attackPower: 1
};

// ゲームオブジェクト
const enemies = [];
const bullets = [];

// タッチ操作用の変数
let touchJoystick = { active: false, startX: 0, startY: 0, moveX: 0, moveY: 0, identifier: null };

// 最後のフレーム時間（パフォーマンス最適化用）
let lastFrameTime = 0;

// キー入力
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    // 設定の読み込み
    loadSettings();
    loadUpgrades();
    
    // イベントリスナーの設定
    setupEventListeners();
    
    // キャンバスのリサイズ
    resizeCanvas();
    
    // モバイル対応の強化を適用
    setupMobileEnhancements();
});

// イベントリスナーの設定
function setupEventListeners() {
    document.getElementById('setupButton').addEventListener('click', () => showScreen('setupScreen'));
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', startGame);
    document.getElementById('backToStartButton').addEventListener('click', () => showScreen('startScreen'));
    document.getElementById('backToSetupButton').addEventListener('click', () => showScreen('setupScreen'));
    document.getElementById('saveSettingsButton').addEventListener('click', saveSettings);
    document.getElementById('showTipButton').addEventListener('click', showTipScreen);
    document.getElementById('generateQRButton').addEventListener('click', generateQR);
    document.getElementById('backToGameButton').addEventListener('click', () => showScreen('gameOverScreen'));
    document.getElementById('playCoinsButton').addEventListener('click', startCoinGame);
    document.getElementById('skipCoinGameButton').addEventListener('click', skipCoinGame);
    document.getElementById('backToMainGameButton').addEventListener('click', () => showScreen('gameOverScreen'));
    
    // 投げ銭完了ボタン
    const tipCompleteButton = document.getElementById('tipCompleteButton');
    if (tipCompleteButton) {
        tipCompleteButton.addEventListener('click', function() {
            // 投げ銭完了メッセージ
            const messageEl = document.getElementById('tipMessage');
            if (messageEl) {
                messageEl.innerHTML = `
                    <div style="color:#4CAF50;font-size:18px;margin-bottom:10px;">投げ銭ありがとうございます！</div>
                    <div>次回のコインゲームでボーナスが適用されます！</div>
                `;
            }
            
            // 2秒後にゲーム画面に戻る
            setTimeout(() => {
                showScreen('gameOverScreen');
            }, 2000);
        });
    }

    // アップグレードボタンのイベントリスナー
    document.querySelectorAll('.upgrade-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const cost = parseInt(this.dataset.cost);
            const type = this.dataset.type;
            upgradeWithCoins(type, cost);
        });
    });

    // 投げ銭金額選択ボタンのイベントリスナー
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            selectedAmount = parseFloat(this.dataset.amount);
        });
    });
    
    // コインゲーム投げ銭ボタン
    const coinGameTipButton = document.getElementById('coinGameTipButton');
    if (coinGameTipButton) {
        coinGameTipButton.addEventListener('click', showTipScreen);
    }
    
    // リサイズイベント
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => {
        setTimeout(resizeCanvas, 300);
    });
}

// キャンバスのリサイズ
function resizeCanvas() {
    const aspectRatio = 4 / 3;
    const maxWidth = window.innerWidth * 0.95;
    const maxHeight = window.innerHeight * 0.75;

    let newWidth = maxWidth;
    let newHeight = newWidth / aspectRatio;

    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * aspectRatio;
    }

    canvas.width = Math.max(newWidth, 320);
    canvas.height = Math.max(newHeight, 240);

    if (gameRunning) {
        drone.x = Math.min(drone.x, canvas.width - drone.width / 2);
        drone.y = Math.min(drone.y, canvas.height - drone.height / 2);
        drone.x = Math.max(drone.x, drone.width / 2);
        drone.y = Math.max(drone.y, drone.height / 2);
    } else {
        drone.x = canvas.width / 2;
        drone.y = canvas.height / 2;
    }
}

// 画面表示切替
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    if (screenId) document.getElementById(screenId).style.display = 'flex';
}

// 設定の読み込み
function loadSettings() {
    const saved = localStorage.getItem('droneGameStreamerSettings');
    if (saved) {
        streamerSettings = JSON.parse(saved);
        document.getElementById('streamerName').value = streamerSettings.name;
        document.getElementById('walletAddress').value = streamerSettings.address;
    }
}

// アップグレードの読み込み
function loadUpgrades() {
    const saved = localStorage.getItem('droneGameUpgrades');
    if (saved) {
        droneUpgrades = JSON.parse(saved);
        applyUpgrades();
    }
}

// アップグレードの保存
function saveUpgrades() {
    localStorage.setItem('droneGameUpgrades', JSON.stringify(droneUpgrades));
}

// アップグレードの適用
function applyUpgrades() {
    // HPアップグレード適用
    const hpBonus = droneUpgrades.hp * 10; // 10%ずつ増加
    hp = 100 + Math.floor(100 * hpBonus / 100);
    
    // 攻撃力アップグレード適用
    drone.attackPower = 1 + (droneUpgrades.attack * 0.1); // 10%ずつ増加
    
    // 速度アップグレード適用
    drone.speed = 6 + (droneUpgrades.speed * 0.6); // 10%ずつ増加
    
    updateUI();
}

// コインでのアップグレード
function upgradeWithCoins(type, cost) {
    const remainingCoins = parseInt(document.getElementById('remainingCoins').textContent);
    if (remainingCoins < cost) {
        document.getElementById('upgradeMessage').textContent = 'コインが足りません！';
        document.getElementById('upgradeMessage').className = 'error';
        return;
    }
    
    // アップグレード適用
    switch (type) {
        case 'hp':
            droneUpgrades.hp++;
            break;
        case 'attack':
            droneUpgrades.attack++;
            break;
        case 'speed':
            droneUpgrades.speed++;
            break;
        case 'special':
            droneUpgrades.special = true;
            break;
    }
    
    // コイン消費
    coins -= cost;
    document.getElementById('remainingCoins').textContent = coins;
    
    // アップグレード保存
    saveUpgrades();
    
    // メッセージ表示
    document.getElementById('upgradeMessage').textContent = 'アップグレード完了！';
    document.getElementById('upgradeMessage').className = 'success';
    
    // ボタン状態更新
    updateUpgradeButtons();
}

// アップグレードボタンの状態更新
function updateUpgradeButtons() {
    document.querySelectorAll('.upgrade-btn').forEach(btn => {
        const cost = parseInt(btn.dataset.cost);
        if (coins < cost) {
            btn.classList.add('disabled');
        } else {
            btn.classList.remove('disabled');
        }
        
        // 特殊能力は一度だけ購入可能
        if (btn.dataset.type === 'special' && droneUpgrades.special) {
            btn.classList.add('disabled');
            btn.textContent = '特殊能力 (取得済)';
        }
    });
}

// 設定の保存
function saveSettings() {
    const name = document.getElementById('streamerName').value.trim();
    const address = document.getElementById('walletAddress').value.trim();
    const validation = document.getElementById('validationMessage');
    
    if (!address) {
        validation.textContent = 'ウォレットアドレスを入力してください';
        validation.className = 'validation-message error';
        validation.style.display = 'block';
        return;
    }
    
    if (!address.startsWith('r') || address.length < 25 || address.length > 35) {
        validation.textContent = '有効なXRPアドレスを入力してください';
        validation.className = 'validation-message error';
        validation.style.display = 'block';
        return;
    }
    
    streamerSettings = { name, address };
    localStorage.setItem('droneGameStreamerSettings', JSON.stringify(streamerSettings));
    
    validation.textContent = '設定が保存されました！';
    validation.className = 'validation-message success';
    validation.style.display = 'block';
    
    setTimeout(() => showScreen('startScreen'), 1500);
}

// ゲーム開始
function startGame() {
    showScreen('');
    gameRunning = true;
    score = 0;
    hp = 100;
    level = 1;
    enemies.length = 0;
    bullets.length = 0;
    
    drone.x = canvas.width / 2;
    drone.y = canvas.height / 2;
    drone.vx = 0;
    drone.vy = 0;
    drone.angle = 0;
    
    // アップグレード適用
    applyUpgrades();
    
    updateUI();
    
    // モバイルコントロールの表示
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        document.getElementById('mobileControls').style.display = 'flex';
    }
    
    lastFrameTime = performance.now();
    gameLoopRequestId = requestAnimationFrame(gameLoop);
}

// ゲームループ
function gameLoop(timestamp) {
    if (!gameRunning) {
        gameLoopRequestId = null;
        return;
    }

    const now = timestamp || performance.now();
    const deltaTime = now - lastFrameTime;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    
    if (deltaTime >= frameInterval) {
        lastFrameTime = now - (deltaTime % frameInterval);
        
        // ゲーム状態の更新
        updateGameState();
        
        // 描画処理
        draw();
        updateUI();
    }
    
    // 次のフレームを要求
    gameLoopRequestId = requestAnimationFrame(gameLoop);
}

// ゲーム状態の更新
function updateGameState() {
    // ドローン制御
    if (keys['ArrowLeft']) {
        drone.vx -= 0.3;
        drone.angle = Math.max(drone.angle - 0.1, -0.3);
    }
    if (keys['ArrowRight']) {
        drone.vx += 0.3;
        drone.angle = Math.min(drone.angle + 0.1, 0.3);
    }
    if (keys['ArrowUp']) drone.vy -= 0.4;
    if (keys['ArrowDown']) drone.vy += 0.2;
    
    drone.vx *= 0.95;
    drone.vy += 0.1;
    drone.vy *= 0.98;
    drone.angle *= 0.95;
    
    drone.x += drone.vx;
    drone.y += drone.vy;
    
    drone.x = Math.max(0, Math.min(canvas.width - drone.width, drone.x));
    drone.y = Math.max(0, Math.min(canvas.height - drone.height, drone.y));

    if (keys[' ']) {
        bullets.push({
            x: drone.x + drone.width/2 - 2,
            y: drone.y,
            width: 4,
            height: 12,
            speed: 12,
            power: drone.attackPower
        });
        keys[' '] = false;
    }

    if (Math.random() < 0.015 + level * 0.005) {
        enemies.push({
            x: Math.random() * (canvas.width - 40),
            y: -40,
            width: 35,
            height: 35,
            speed: 1.5 + level * 0.3 + Math.random() * 2,
            hp: 1 + Math.floor(level / 3)
        });
    }

    bullets.forEach((bullet, i) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) bullets.splice(i, 1);
    });

    enemies.forEach((enemy, i) => {
        enemy.y += enemy.speed;
        if (enemy.y > canvas.height) {
            enemies.splice(i, 1);
            hp -= 15;
        }
    });

    bullets.forEach((bullet, bi) => {
        enemies.forEach((enemy, ei) => {
            if (isColliding(bullet, enemy)) {
                bullets.splice(bi, 1);
                enemy.hp -= bullet.power;
                if (enemy.hp <= 0) {
                    enemies.splice(ei, 1);
                    score += 10 + level * 5;
                    
                    // コインをランダムでドロップ (20%の確率)
                    if (Math.random() < 0.2) {
                        coins += 1;
                        updateUI();
                    }
                }
            }
        });
    });

    enemies.forEach((enemy, i) => {
        if (isColliding(drone, enemy)) {
            enemies.splice(i, 1);
            hp -= 25;
        }
    });

    const newLevel = Math.floor(score / 200) + 1;
    if (newLevel > level) {
        level = newLevel;
        hp = Math.min(100, hp + 20);
        
        // レベルアップ時にコインゲームを発生させる (25%の確率)
        if (Math.random() < 0.25) {
            gameRunning = false;
            setTimeout(() => {
                startCoinGame();
            }, 1000);
            return;
        }
    }

    if (hp <= 0) {
        gameRunning = false;
        showGameOver();
    }
}

// 衝突判定
function isColliding(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// 描画処理
function draw() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ドローン描画
    ctx.save();
    ctx.translate(drone.x + drone.width/2, drone.y + drone.height/2);
    ctx.rotate(drone.angle);
    
    ctx.fillStyle = '#FF1493';
    ctx.fillRect(-drone.width/2, -drone.height/2, drone.width, drone.height);
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-20, -15);
    ctx.lineTo(20, -15);
    ctx.moveTo(-20, 15);
    ctx.lineTo(20, 15);
    ctx.stroke();
    
    // 特殊能力が解放されている場合、特殊なエフェクトを追加
    if (droneUpgrades.special) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(0, 0, drone.width * 0.7, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
    
    // 敵描画
    ctx.fillStyle = '#FF4500';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
    
    // 弾丸描画
    ctx.fillStyle = '#00FF00';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// UI更新
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('hp').textContent = Math.max(0, hp);
    document.getElementById('level').textContent = level;
    document.getElementById('coins').textContent = coins;
}

// ゲームオーバー表示
function showGameOver() {
    const streamerName = streamerSettings.name || '配信者';
    document.getElementById('finalScore').textContent = `最終スコア: ${score}点`;
    document.getElementById('streamerInfo').textContent = `${streamerName}さんのプレイ`;
    showScreen('gameOverScreen');
    
    // モバイルコントロールを非表示
    document.getElementById('mobileControls').style.display = 'none';
}

// 投げ銭画面表示
function showTipScreen() {
    const streamerName = streamerSettings.name || '配信者';
    document.getElementById('tipStreamerInfo').textContent = `${streamerName}さんへの投げ銭`;
    document.getElementById('displayAddress').textContent = streamerSettings.address;
    
    // 投げ銭完了ボタンを表示
    const tipCompleteButton = document.getElementById('tipCompleteButton');
    if (tipCompleteButton) {
        tipCompleteButton.style.display = 'none';
    }
    
    // QRコードエリアを非表示
    const qrCodeArea = document.getElementById('qrCodeArea');
    if (qrCodeArea) {
        qrCodeArea.style.display = 'none';
    }
    
    // メッセージをクリア
    const messageEl = document.getElementById('tipMessage');
    if (messageEl) {
        messageEl.textContent = '';
    }
    
    showScreen('tipScreen');
}

// QRコード生成
function generateQR() {
    const qrCodeArea = document.getElementById('qrCodeArea');
    const qrImage = document.getElementById('qrImage');
    const messageEl = document.getElementById('tipMessage');
    const tipCompleteButton = document.getElementById('tipCompleteButton');
    
    // ローディング表示
    messageEl.textContent = 'QRコードを生成中...';
    
    const paymentUrl = `https://xrp.to/${streamerSettings.address}?amount=${selectedAmount}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(paymentUrl)}`;
    
    // 画像読み込み完了時の処理
    qrImage.onload = function() {
        // ボーナスコイン計算
        const bonusCoins = Math.floor(selectedAmount * 10);
        
        // メッセージ表示
        messageEl.innerHTML = `
            <div>${selectedAmount} XRPの投げ銭QRコードを生成しました！</div>
            <div style="margin-top:8px;color:#FFD700">次回のコインゲームで<b>${bonusCoins}コイン</b>のボーナスが付与されます！</div>
        `;
        
        // 投げ銭完了ボタンを表示
        if (tipCompleteButton) {
            tipCompleteButton.style.display = 'block';
        }
        
        // ボーナスコインを保存
        localStorage.setItem('tipBonus', bonusCoins);
    };
    
    // エラー処理
    qrImage.onerror = function() {
        messageEl.textContent = 'QRコードの生成に失敗しました。もう一度お試しください。';
        messageEl.style.color = '#FF6347';
    };
    
    qrImage.src = qrUrl;
    qrCodeArea.style.display = 'block';
}

// コインゲームスキップ
function skipCoinGame() {
    showScreen('gameOverScreen');
}


/**
 * コイン集めミニゲーム
 * ドローン大冒険の追加ゲーム要素
 */

// コインゲームの状態
let coinGameState = {
    active: false,
    timeLeft: 30,
    coinsCollected: 0,
    gameInterval: null,
    canvas: null,
    ctx: null,
    player: null,
    coins: [],
    obstacles: [],
    specialItems: [],
    effects: [],
    bonusApplied: false
};

// コインゲーム初期化
function initCoinGame() {
    // キャンバスの設定
    coinGameState.canvas = document.getElementById('coinGameCanvas');
    coinGameState.ctx = coinGameState.canvas.getContext('2d');
    
    // キャンバスサイズの最適化
    optimizeCoinGameCanvas();
    
    // ゲーム状態のリセット
    coinGameState.active = true;
    coinGameState.timeLeft = 30;
    coinGameState.coinsCollected = 0;
    coinGameState.coins = [];
    coinGameState.obstacles = [];
    coinGameState.specialItems = [];
    coinGameState.effects = [];
    coinGameState.bonusApplied = false;
    
    // プレイヤー（ドローン）の初期化
    coinGameState.player = {
        x: coinGameState.canvas.width / 2,
        y: coinGameState.canvas.height / 2,
        size: 20,
        speed: 5,
        magnetActive: false,
        magnetTimer: 0
    };
    
    // 初期コインの生成
    for (let i = 0; i < 5; i++) {
        spawnCoin();
    }
    
    // 初期障害物の生成
    for (let i = 0; i < 3; i++) {
        spawnObstacle();
    }
    
    // 投げ銭ボーナスの適用
    applyTipBonus();
    
    // ゲームループの開始
    coinGameState.gameInterval = setInterval(updateCoinGame, 1000 / 60);
    
    // タイマーの開始
    startCoinGameTimer();
    
    // イベントリスナーの設定
    setupCoinGameControls();
}

// コインゲームキャンバスの最適化
function optimizeCoinGameCanvas() {
    const canvas = coinGameState.canvas;
    if (!canvas) return;
    
    // 画面サイズに応じたキャンバスサイズ調整
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    let canvasWidth, canvasHeight;
    
    if (screenWidth < 480) {
        // スマートフォン（小）
        canvasWidth = Math.min(320, screenWidth * 0.9);
    } else if (screenWidth < 768) {
        // スマートフォン（大）
        canvasWidth = Math.min(400, screenWidth * 0.9);
    } else {
        // タブレット・PC
        canvasWidth = Math.min(500, screenWidth * 0.8);
    }
    
    canvasHeight = canvasWidth * 0.75; // 4:3のアスペクト比
    
    // キャンバスの論理サイズを設定
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // キャンバスのスタイルサイズを設定
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    
    // デバイスピクセル比に応じたスケーリング
    const devicePixelRatio = window.devicePixelRatio || 1;
    const ctx = coinGameState.ctx;
    
    // モバイルデバイスでは低解像度に抑える
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const scaleFactor = isMobile ? Math.min(devicePixelRatio, 1.5) : devicePixelRatio;
    
    if (scaleFactor !== 1) {
        canvas.width = canvasWidth * scaleFactor;
        canvas.height = canvasHeight * scaleFactor;
        ctx.scale(scaleFactor, scaleFactor);
    }
}

// 投げ銭ボーナスの適用
function applyTipBonus() {
    const tipBonus = localStorage.getItem('tipBonus');
    if (tipBonus && !coinGameState.bonusApplied) {
        const bonusCoins = parseInt(tipBonus);
        if (bonusCoins > 0) {
            // ボーナスコインを画面中央に生成
            for (let i = 0; i < Math.min(bonusCoins, 10); i++) {
                coinGameState.coins.push({
                    x: coinGameState.canvas.width / 2 + (Math.random() * 100 - 50),
                    y: coinGameState.canvas.height / 2 + (Math.random() * 100 - 50),
                    size: 15,
                    type: i < bonusCoins / 2 ? 'normal' : (i < bonusCoins * 0.8 ? 'rare' : 'super_rare'),
                    value: i < bonusCoins / 2 ? 1 : (i < bonusCoins * 0.8 ? 3 : 5),
                    collected: false,
                    angle: Math.random() * Math.PI * 2,
                    speed: 1 + Math.random()
                });
            }
            
            // 特殊効果の表示を強化
            coinGameState.effects.push({
                text: `投げ銭ボーナス +${bonusCoins}コイン!`,
                x: coinGameState.canvas.width / 2,
                y: coinGameState.canvas.height / 2,
                size: 24,
                color: '#FFD700',
                life: 180 // 表示時間延長
            });
            
            // 追加の視覚効果
            // 金色の輝きエフェクト
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 50 + Math.random() * 100;
                coinGameState.effects.push({
                    text: '✨',
                    x: coinGameState.canvas.width / 2 + Math.cos(angle) * distance,
                    y: coinGameState.canvas.height / 2 + Math.sin(angle) * distance,
                    size: 16 + Math.random() * 16,
                    color: '#FFD700',
                    life: 60 + Math.random() * 60
                });
            }
            
            coinGameState.bonusApplied = true;
            localStorage.removeItem('tipBonus'); // ボーナスを使用したらクリア
        }
    }
}

// コインの生成
function spawnCoin() {
    // コインタイプの決定（通常、レア、スーパーレア）
    const rand = Math.random();
    const type = rand < 0.7 ? 'normal' : (rand < 0.9 ? 'rare' : 'super_rare');
    const value = type === 'normal' ? 1 : (type === 'rare' ? 3 : 5);
    
    coinGameState.coins.push({
        x: Math.random() * (coinGameState.canvas.width - 30) + 15,
        y: Math.random() * (coinGameState.canvas.height - 30) + 15,
        size: 15,
        type: type,
        value: value,
        collected: false,
        angle: Math.random() * Math.PI * 2,
        speed: 1 + Math.random()
    });
}

// 障害物の生成
function spawnObstacle() {
    const isMoving = Math.random() > 0.5;
    
    coinGameState.obstacles.push({
        x: Math.random() * (coinGameState.canvas.width - 40) + 20,
        y: Math.random() * (coinGameState.canvas.height - 40) + 20,
        width: 20 + Math.random() * 20,
        height: 20 + Math.random() * 20,
        type: isMoving ? 'moving' : 'static',
        speed: 1 + Math.random() * 2,
        direction: Math.random() * Math.PI * 2
    });
}

// 特殊アイテムの生成
function spawnSpecialItem() {
    const types = ['magnet', 'time_bonus', 'coin_bonus'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    coinGameState.specialItems.push({
        x: Math.random() * (coinGameState.canvas.width - 30) + 15,
        y: Math.random() * (coinGameState.canvas.height - 30) + 15,
        size: 20,
        type: type,
        collected: false,
        angle: Math.random() * Math.PI * 2,
        pulseSize: 0,
        pulseDirection: 1
    });
}

// タイマーの開始
function startCoinGameTimer() {
    const timerElement = document.getElementById('coinGameTimer');
    
    const timerInterval = setInterval(() => {
        coinGameState.timeLeft--;
        timerElement.textContent = coinGameState.timeLeft;
        
        // 残り時間が10秒以下になったら警告表示
        if (coinGameState.timeLeft <= 10) {
            timerElement.style.color = '#FF0000';
        }
        
        // 時間切れ
        if (coinGameState.timeLeft <= 0) {
            clearInterval(timerInterval);
            endCoinGame();
        }
    }, 1000);
}

// コインゲームの更新
function updateCoinGame() {
    if (!coinGameState.active) return;
    
    // プレイヤーの更新
    updateCoinGamePlayer();
    
    // コインの更新
    updateCoins();
    
    // 障害物の更新
    updateObstacles();
    
    // 特殊アイテムの更新
    updateSpecialItems();
    
    // エフェクトの更新
    updateEffects();
    
    // 衝突判定
    checkCoinGameCollisions();
    
    // 新しいオブジェクトの生成
    if (Math.random() < 0.02 && coinGameState.coins.length < 10) {
        spawnCoin();
    }
    
    if (Math.random() < 0.005 && coinGameState.obstacles.length < 5) {
        spawnObstacle();
    }
    
    if (Math.random() < 0.002 && coinGameState.specialItems.length < 2) {
        spawnSpecialItem();
    }
    
    // 描画
    drawCoinGame();
}

// プレイヤーの更新
function updateCoinGamePlayer() {
    // キーボード操作
    if (keys['w'] || keys['ArrowUp']) {
        coinGameState.player.y -= coinGameState.player.speed;
    }
    if (keys['s'] || keys['ArrowDown']) {
        coinGameState.player.y += coinGameState.player.speed;
    }
    if (keys['a'] || keys['ArrowLeft']) {
        coinGameState.player.x -= coinGameState.player.speed;
    }
    if (keys['d'] || keys['ArrowRight']) {
        coinGameState.player.x += coinGameState.player.speed;
    }
    
    // タッチ操作（モバイル）
    if (touchJoystick && touchJoystick.active) {
        coinGameState.player.x += touchJoystick.moveX * 0.1;
        coinGameState.player.y += touchJoystick.moveY * 0.1;
    }
    
    // 画面境界チェック
    coinGameState.player.x = Math.max(coinGameState.player.size, Math.min(coinGameState.canvas.width - coinGameState.player.size, coinGameState.player.x));
    coinGameState.player.y = Math.max(coinGameState.player.size, Math.min(coinGameState.canvas.height - coinGameState.player.size, coinGameState.player.y));
    
    // マグネット効果の更新
    if (coinGameState.player.magnetActive) {
        coinGameState.player.magnetTimer--;
        if (coinGameState.player.magnetTimer <= 0) {
            coinGameState.player.magnetActive = false;
        }
    }
}

// コインの更新
function updateCoins() {
    coinGameState.coins.forEach((coin, index) => {
        // コインの動き
        coin.angle += 0.02;
        coin.x += Math.cos(coin.angle) * coin.speed * 0.5;
        coin.y += Math.sin(coin.angle) * coin.speed * 0.5;
        
        // 画面境界チェック
        if (coin.x < coin.size || coin.x > coinGameState.canvas.width - coin.size) {
            coin.angle = Math.PI - coin.angle;
        }
        if (coin.y < coin.size || coin.y > coinGameState.canvas.height - coin.size) {
            coin.angle = -coin.angle;
        }
        
        // マグネット効果
        if (coinGameState.player.magnetActive) {
            const dx = coinGameState.player.x - coin.x;
            const dy = coinGameState.player.y - coin.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 150) { // マグネットの効果範囲
                coin.x += (dx / dist) * 2;
                coin.y += (dy / dist) * 2;
            }
        }
    });
}

// 障害物の更新
function updateObstacles() {
    coinGameState.obstacles.forEach(obstacle => {
        if (obstacle.type === 'moving') {
            obstacle.x += Math.cos(obstacle.direction) * obstacle.speed;
            obstacle.y += Math.sin(obstacle.direction) * obstacle.speed;
            
            // 画面境界チェック
            if (obstacle.x < 0 || obstacle.x > coinGameState.canvas.width - obstacle.width) {
                obstacle.direction = Math.PI - obstacle.direction;
            }
            if (obstacle.y < 0 || obstacle.y > coinGameState.canvas.height - obstacle.height) {
                obstacle.direction = -obstacle.direction;
            }
        }
    });
}

// 特殊アイテムの更新
function updateSpecialItems() {
    coinGameState.specialItems.forEach(item => {
        // 脈動エフェクト
        item.pulseSize += 0.1 * item.pulseDirection;
        if (item.pulseSize > 1 || item.pulseSize < 0) {
            item.pulseDirection *= -1;
        }
        
        // 回転
        item.angle += 0.03;
    });
}

// エフェクトの更新
function updateEffects() {
    coinGameState.effects.forEach((effect, index) => {
        effect.life--;
        if (effect.life <= 0) {
            coinGameState.effects.splice(index, 1);
        }
    });
}

// 衝突判定
function checkCoinGameCollisions() {
    // プレイヤーとコインの衝突
    coinGameState.coins.forEach((coin, index) => {
        const dx = coinGameState.player.x - coin.x;
        const dy = coinGameState.player.y - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < coinGameState.player.size + coin.size) {
            // コイン獲得
            coinGameState.coinsCollected += coin.value;
            document.getElementById('coinGameCount').textContent = coinGameState.coinsCollected;
            
            // エフェクト追加
            coinGameState.effects.push({
                text: `+${coin.value}`,
                x: coin.x,
                y: coin.y,
                size: 16,
                color: coin.type === 'normal' ? '#FFD700' : (coin.type === 'rare' ? '#C0C0C0' : '#FFA500'),
                life: 60
            });
            
            // コイン削除
            coinGameState.coins.splice(index, 1);
        }
    });
    
    // プレイヤーと障害物の衝突
    coinGameState.obstacles.forEach(obstacle => {
        if (coinGameState.player.x + coinGameState.player.size > obstacle.x &&
            coinGameState.player.x - coinGameState.player.size < obstacle.x + obstacle.width &&
            coinGameState.player.y + coinGameState.player.size > obstacle.y &&
            coinGameState.player.y - coinGameState.player.size < obstacle.y + obstacle.height) {
            
            // コインを失う（1枚）
            if (coinGameState.coinsCollected > 0) {
                coinGameState.coinsCollected--;
                document.getElementById('coinGameCount').textContent = coinGameState.coinsCollected;
                
                // エフェクト追加
                coinGameState.effects.push({
                    text: '-1',
                    x: coinGameState.player.x,
                    y: coinGameState.player.y,
                    size: 16,
                    color: '#FF0000',
                    life: 60
                });
            }
            
            // プレイヤーを少し押し戻す
            const dx = coinGameState.player.x - (obstacle.x + obstacle.width / 2);
            const dy = coinGameState.player.y - (obstacle.y + obstacle.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                coinGameState.player.x += (dx / dist) * 10;
                coinGameState.player.y += (dy / dist) * 10;
            }
        }
    });
    
    // プレイヤーと特殊アイテムの衝突
    coinGameState.specialItems.forEach((item, index) => {
        const dx = coinGameState.player.x - item.x;
        const dy = coinGameState.player.y - item.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < coinGameState.player.size + item.size) {
            // 特殊アイテム効果
            switch (item.type) {
                case 'magnet':
                    coinGameState.player.magnetActive = true;
                    coinGameState.player.magnetTimer = 300; // 5秒間
                    coinGameState.effects.push({
                        text: 'マグネット!',
                        x: item.x,
                        y: item.y,
                        size: 18,
                        color: '#00FFFF',
                        life: 90
                    });
                    break;
                    
                case 'time_bonus':
                    coinGameState.timeLeft += 5; // 5秒追加
                    document.getElementById('coinGameTimer').textContent = coinGameState.timeLeft;
                    coinGameState.effects.push({
                        text: '+5秒!',
                        x: item.x,
                        y: item.y,
                        size: 18,
                        color: '#00FF00',
                        life: 90
                    });
                    break;
                    
                case 'coin_bonus':
                    // 複数のコインを生成
                    for (let i = 0; i < 5; i++) {
                        coinGameState.coins.push({
                            x: item.x + (Math.random() * 100 - 50),
                            y: item.y + (Math.random() * 100 - 50),
                            size: 15,
                            type: Math.random() < 0.7 ? 'normal' : (Math.random() < 0.9 ? 'rare' : 'super_rare'),
                            value: Math.random() < 0.7 ? 1 : (Math.random() < 0.9 ? 3 : 5),
                            collected: false,
                            angle: Math.random() * Math.PI * 2,
                            speed: 1 + Math.random()
                        });
                    }
                    coinGameState.effects.push({
                        text: 'コインボーナス!',
                        x: item.x,
                        y: item.y,
                        size: 18,
                        color: '#FFA500',
                        life: 90
                    });
                    break;
            }
            
            // アイテム削除
            coinGameState.specialItems.splice(index, 1);
        }
    });
}

// コインゲームの描画
function drawCoinGame() {
    const ctx = coinGameState.ctx;
    
    // 背景クリア
    const gradient = ctx.createLinearGradient(0, 0, 0, coinGameState.canvas.height);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(1, '#FFA500');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, coinGameState.canvas.width, coinGameState.canvas.height);
    
    // 障害物の描画
    ctx.fillStyle = '#8B4513';
    coinGameState.obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // 障害物の枠線
        ctx.strokeStyle = '#663300';
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
    
    // コインの描画
    coinGameState.coins.forEach(coin => {
        // コインタイプに応じた色
        ctx.fillStyle = coin.type === 'normal' ? '#FFD700' : (coin.type === 'rare' ? '#C0C0C0' : '#FFA500');
        
        // コイン本体
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.size, 0, Math.PI * 2);
        ctx.fill();
        
        // コイン内部の模様
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(coin.x - coin.size * 0.3, coin.y - coin.size * 0.3, coin.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        // コインの枠線
        ctx.strokeStyle = coin.type === 'normal' ? '#DAA520' : (coin.type === 'rare' ? '#A9A9A9' : '#FF8C00');
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.size, 0, Math.PI * 2);
        ctx.stroke();
    });
    
    // 特殊アイテムの描画
    coinGameState.specialItems.forEach(item => {
        let color;
        switch (item.type) {
            case 'magnet':
                color = '#00FFFF';
                break;
            case 'time_bonus':
                color = '#00FF00';
                break;
            case 'coin_bonus':
                color = '#FFA500';
                break;
        }
        
        // アイテム本体
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 脈動エフェクト
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.5 - item.pulseSize * 0.5;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.size + item.pulseSize * 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        
        // アイテムタイプを示すアイコン
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let icon;
        switch (item.type) {
            case 'magnet':
                icon = 'M';
                break;
            case 'time_bonus':
                icon = 'T';
                break;
            case 'coin_bonus':
                icon = 'C';
                break;
        }
        ctx.fillText(icon, item.x, item.y);
    });
    
    // プレイヤーの描画
    ctx.fillStyle = '#FF1493';
    ctx.beginPath();
    ctx.arc(coinGameState.player.x, coinGameState.player.y, coinGameState.player.size, 0, Math.PI * 2);
    ctx.fill();
    
    // プレイヤーの内部パターン
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(coinGameState.player.x - coinGameState.player.size * 0.3, 
            coinGameState.player.y - coinGameState.player.size * 0.3, 
            coinGameState.player.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
    
    // プレイヤーの枠線
    ctx.strokeStyle = '#FF69B4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(coinGameState.player.x, coinGameState.player.y, coinGameState.player.size, 0, Math.PI * 2);
    ctx.stroke();
    
    // マグネット効果の表示
    if (coinGameState.player.magnetActive) {
        ctx.strokeStyle = '#00FFFF';
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(coinGameState.player.x, coinGameState.player.y, 150, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }
    
    // エフェクトの描画
    coinGameState.effects.forEach(effect => {
        ctx.fillStyle = effect.color;
        ctx.globalAlpha = effect.life / 60;
        ctx.font = `${effect.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(effect.text, effect.x, effect.y - (60 - effect.life) * 0.5);
        ctx.globalAlpha = 1.0;
    });
}

// コインゲームのコントロール設定
function setupCoinGameControls() {
    // マウス操作
    coinGameState.canvas.addEventListener('mousemove', (e) => {
        if (!coinGameState.active) return;
        
        const rect = coinGameState.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // キャンバスの論理サイズとスタイルサイズの比率を考慮
        const scaleX = coinGameState.canvas.width / rect.width;
        const scaleY = coinGameState.canvas.height / rect.height;
        
        coinGameState.player.x = mouseX * scaleX;
        coinGameState.player.y = mouseY * scaleY;
    });
    
    // タッチ操作
    coinGameState.canvas.addEventListener('touchmove', (e) => {
        if (!coinGameState.active) return;
        e.preventDefault();
        
        const rect = coinGameState.canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;
        
        // キャンバスの論理サイズとスタイルサイズの比率を考慮
        const scaleX = coinGameState.canvas.width / rect.width;
        const scaleY = coinGameState.canvas.height / rect.height;
        
        coinGameState.player.x = touchX * scaleX;
        coinGameState.player.y = touchY * scaleY;
    }, { passive: false });
    
    // タッチ開始
    coinGameState.canvas.addEventListener('touchstart', (e) => {
        if (!coinGameState.active) return;
        e.preventDefault();
        
        const rect = coinGameState.canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;
        
        // キャンバスの論理サイズとスタイルサイズの比率を考慮
        const scaleX = coinGameState.canvas.width / rect.width;
        const scaleY = coinGameState.canvas.height / rect.height;
        
        coinGameState.player.x = touchX * scaleX;
        coinGameState.player.y = touchY * scaleY;
    }, { passive: false });
}

// コインゲーム開始
function startCoinGame() {
    showScreen('coinGameScreen');
    
    // カウントダウン表示
    const countdown = document.getElementById('coinGameCountdown');
    countdown.style.display = 'block';
    countdown.textContent = '3';
    
    let count = 3;
    const countdownInterval = setInterval(() => {
        count--;
        countdown.textContent = count;
        
        if (count <= 0) {
            clearInterval(countdownInterval);
            countdown.style.display = 'none';
            initCoinGame();
        }
    }, 1000);
}

// コインゲーム終了
function endCoinGame() {
    coinGameState.active = false;
    clearInterval(coinGameState.gameInterval);
    
    // 結果画面に移動
    showCoinGameResult();
}

// コインゲーム結果表示
function showCoinGameResult() {
    // メインゲームのコイン数に加算
    coins += coinGameState.coinsCollected;
    
    // 結果画面の表示
    document.getElementById('coinGameResult').textContent = `集めたコイン: ${coinGameState.coinsCollected}`;
    document.getElementById('remainingCoins').textContent = coins;
    
    // アップグレードボタンの状態更新
    updateUpgradeButtons();
    
    // 画面切り替え
    showScreen('coinGameResultScreen');
}


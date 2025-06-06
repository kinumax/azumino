/**
 * モバイル対応強化のためのJavaScriptファイル
 * ドローン大冒険ゲーム用
 */

// モバイル対応の設定を行う関数
function setupMobileEnhancements() {
    // デバイス検出
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    // モバイルデバイスの場合のみ設定を適用
    if (isMobile) {
        console.log("モバイルデバイスを検出しました。モバイル最適化を適用します。");
        
        // モバイルコントロールの表示
        document.getElementById('mobileControls').style.display = 'flex';
        
        // レスポンシブレイアウトの設定
        setupResponsiveLayout();
        
        // タッチ操作の最適化
        optimizeTouchControls();
        
        // モバイル特有の問題への対応
        handleMobileSpecificIssues();
        
        // パフォーマンス最適化
        optimizePerformance();
    } else {
        // PCの場合はモバイルコントロールを非表示
        document.getElementById('mobileControls').style.display = 'none';
    }
}

// レスポンシブレイアウトの設定
function setupResponsiveLayout() {
    const gameCanvas = document.getElementById('gameCanvas');
    const coinGameCanvas = document.getElementById('coinGameCanvas');
    const ui = document.getElementById('ui');
    const mobileControls = document.getElementById('mobileControls');
    
    function adjustLayout() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isLandscape = width > height;
        
        // キャンバスサイズ調整
        const aspectRatio = 4/3;
        let canvasWidth, canvasHeight;
        
        if (isLandscape) {
            // 横向きの場合
            canvasHeight = height * 0.8;
            canvasWidth = canvasHeight * aspectRatio;
            if (canvasWidth > width * 0.8) {
                canvasWidth = width * 0.8;
                canvasHeight = canvasWidth / aspectRatio;
            }
            
            // モバイルコントロールの配置調整
            mobileControls.style.bottom = '10px';
            mobileControls.style.flexDirection = 'row';
            mobileControls.style.justifyContent = 'space-between';
            
            // UIの配置調整
            ui.style.top = '10px';
            ui.style.left = '10px';
            ui.style.flexDirection = 'column';
        } else {
            // 縦向きの場合
            canvasWidth = width * 0.95;
            canvasHeight = canvasWidth / aspectRatio;
            if (canvasHeight > height * 0.6) {
                canvasHeight = height * 0.6;
                canvasWidth = canvasHeight * aspectRatio;
            }
            
            // モバイルコントロールの配置調整
            mobileControls.style.bottom = '20px';
            mobileControls.style.flexDirection = 'row';
            mobileControls.style.justifyContent = 'space-between';
            
            // UIの配置調整
            ui.style.top = '10px';
            ui.style.left = '10px';
            ui.style.flexDirection = 'row';
            ui.style.flexWrap = 'wrap';
        }
        
        // メインゲームキャンバスのサイズ設定
        if (gameCanvas) {
            gameCanvas.style.width = `${canvasWidth}px`;
            gameCanvas.style.height = `${canvasHeight}px`;
        }
        
        // コインゲームキャンバスのサイズ設定（存在する場合）
        if (coinGameCanvas) {
            const coinGameWidth = Math.min(400, width * 0.9);
            const coinGameHeight = coinGameWidth * 0.75;
            coinGameCanvas.style.width = `${coinGameWidth}px`;
            coinGameCanvas.style.height = `${coinGameHeight}px`;
        }
        
        // UI要素のサイズ調整
        const uiFontSize = Math.max(12, Math.min(16, width / 30));
        ui.style.fontSize = `${uiFontSize}px`;
        
        // ボタンサイズの調整
        document.querySelectorAll('.screen-button').forEach(button => {
            const buttonSize = Math.max(14, Math.min(18, width / 25));
            button.style.fontSize = `${buttonSize}px`;
            button.style.padding = isLandscape ? '10px 20px' : '15px 30px';
        });
        
        // ジョイスティックサイズの調整
        const joystickSize = Math.min(100, Math.max(70, height / 8));
        document.querySelectorAll('.joystick-area').forEach(area => {
            area.style.width = `${joystickSize}px`;
            area.style.height = `${joystickSize}px`;
        });
        
        const joystickKnobSize = joystickSize * 0.4;
        document.querySelectorAll('.joystick').forEach(knob => {
            knob.style.width = `${joystickKnobSize}px`;
            knob.style.height = `${joystickKnobSize}px`;
        });
        
        // アクションボタンサイズの調整
        const actionButtonSize = Math.min(80, Math.max(60, height / 10));
        const attackButton = document.getElementById('attackButton');
        if (attackButton) {
            attackButton.style.width = `${actionButtonSize}px`;
            attackButton.style.height = `${actionButtonSize}px`;
        }
    }
    
    // 初期調整
    adjustLayout();
    
    // リサイズイベントでの再調整
    window.addEventListener('resize', adjustLayout);
    window.addEventListener('orientationchange', () => {
        // 向き変更時は少し遅延させて確実に新しいサイズを取得
        setTimeout(adjustLayout, 300);
    });
    
    return {
        adjustLayout
    };
}

// タッチ操作の最適化
function optimizeTouchControls() {
    const leftJoystickArea = document.getElementById('leftJoystickArea');
    const leftJoystick = document.getElementById('leftJoystick');
    const attackButton = document.getElementById('attackButton');
    
    if (!leftJoystickArea || !leftJoystick || !attackButton) {
        console.warn("モバイルコントロール要素が見つかりません");
        return;
    }
    
    // ジョイスティックの視覚的なフィードバック強化
    function enhanceJoystickVisuals() {
        // 外側の円を追加
        const outerRing = document.createElement('div');
        outerRing.className = 'joystick-outer-ring';
        outerRing.style.position = 'absolute';
        outerRing.style.width = '100%';
        outerRing.style.height = '100%';
        outerRing.style.borderRadius = '50%';
        outerRing.style.border = '2px dashed rgba(255, 255, 255, 0.5)';
        outerRing.style.boxSizing = 'border-box';
        leftJoystickArea.appendChild(outerRing);
        
        // ジョイスティックに影を追加
        leftJoystick.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        
        // アクティブ状態のスタイル
        function setActiveStyle() {
            leftJoystickArea.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            leftJoystick.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        }
        
        function setInactiveStyle() {
            leftJoystickArea.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            leftJoystick.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        }
        
        leftJoystickArea.addEventListener('touchstart', setActiveStyle);
        leftJoystickArea.addEventListener('touchend', setInactiveStyle);
        leftJoystickArea.addEventListener('touchcancel', setInactiveStyle);
    }
    
    // ジョイスティック操作の改良
    function improveJoystickControl() {
        // 感度設定（ローカルストレージから取得またはデフォルト値）
        const sensitivity = parseFloat(localStorage.getItem('joystickSensitivity') || '1.0');
        
        // 滑らかな動きのための変数
        let lastX = 0, lastY = 0;
        const smoothFactor = 0.3;
        
        // ジョイスティックの移動を滑らかにする関数
        function smoothJoystickMovement(moveX, moveY) {
            lastX = lastX + (moveX - lastX) * smoothFactor;
            lastY = lastY + (moveY - lastY) * smoothFactor;
            return { x: lastX, y: lastY };
        }
        
        // タッチ開始時の処理を改良
        leftJoystickArea.addEventListener('touchstart', function(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.getBoundingClientRect();
            
            touchJoystick.active = true;
            touchJoystick.identifier = touch.identifier;
            touchJoystick.startX = rect.width / 2;
            touchJoystick.startY = rect.height / 2;
            
            // 初期位置をジョイスティックの中心に設定
            lastX = 0;
            lastY = 0;
        }, { passive: false });
        
        // タッチ移動時の処理を改良
        leftJoystickArea.addEventListener('touchmove', function(e) {
            e.preventDefault();
            if (!touchJoystick.active) return;
            
            // 正しいタッチイベントを見つける
            let touch = null;
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === touchJoystick.identifier) {
                    touch = e.touches[i];
                    break;
                }
            }
            if (!touch) return;
            
            const rect = this.getBoundingClientRect();
            
            // ジョイスティックの中心からの相対位置
            let moveX = touch.clientX - (rect.left + rect.width / 2);
            let moveY = touch.clientY - (rect.top + rect.height / 2);
            
            // 移動範囲を制限
            const maxDistance = rect.width / 2 - leftJoystick.offsetWidth / 2;
            const distance = Math.sqrt(moveX * moveX + moveY * moveY);
            
            if (distance > maxDistance) {
                moveX = (moveX / distance) * maxDistance;
                moveY = (moveY / distance) * maxDistance;
            }
            
            // 滑らかな動きを適用
            const smoothedPosition = smoothJoystickMovement(moveX, moveY);
            
            // ジョイスティックの位置を更新
            leftJoystick.style.transform = `translate(${smoothedPosition.x}px, ${smoothedPosition.y}px)`;
            
            // 感度を適用してドローンの移動に反映
            touchJoystick.moveX = smoothedPosition.x * sensitivity;
            touchJoystick.moveY = smoothedPosition.y * sensitivity;
            
            // ゲーム中の場合、ドローンの移動に反映
            if (gameRunning) {
                drone.vx += touchJoystick.moveX * 0.01;
                drone.vy += touchJoystick.moveY * 0.01;
            }
            
            // コインゲーム中の場合、プレイヤーの移動に反映
            if (coinGameState && coinGameState.active) {
                coinGameState.player.x += touchJoystick.moveX * 0.05;
                coinGameState.player.y += touchJoystick.moveY * 0.05;
            }
        }, { passive: false });
        
        // タッチ終了時の処理を改良
        leftJoystickArea.addEventListener('touchend', function(e) {
            e.preventDefault();
            
            // 正しいタッチイベントが終了したか確認
            let touchFound = false;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchJoystick.identifier) {
                    touchFound = true;
                    break;
                }
            }
            
            if (touchFound) {
                touchJoystick.active = false;
                touchJoystick.identifier = null;
                touchJoystick.moveX = 0;
                touchJoystick.moveY = 0;
                leftJoystick.style.transform = 'translate(0px, 0px)';
                lastX = 0;
                lastY = 0;
            }
        }, { passive: false });
        
        // タッチキャンセル時も同様に処理
        leftJoystickArea.addEventListener('touchcancel', function(e) {
            e.preventDefault();
            touchJoystick.active = false;
            touchJoystick.identifier = null;
            touchJoystick.moveX = 0;
            touchJoystick.moveY = 0;
            leftJoystick.style.transform = 'translate(0px, 0px)';
            lastX = 0;
            lastY = 0;
        }, { passive: false });
    }
    
    // 攻撃ボタンの改良
    function improveAttackButton() {
        // 視覚的なフィードバック強化
        attackButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        
        // アクティブ状態のスタイル
        function setActiveStyle() {
            attackButton.style.transform = 'scale(0.9)';
            attackButton.style.backgroundColor = 'rgba(255, 20, 147, 0.8)';
        }
        
        function setInactiveStyle() {
            attackButton.style.transform = 'scale(1)';
            attackButton.style.backgroundColor = 'rgba(255, 20, 147, 0.6)';
        }
        
        // タッチイベントの改良
        attackButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            setActiveStyle();
            
            // 攻撃処理
            if (gameRunning) {
                bullets.push({
                    x: drone.x + drone.width/2 - 2,
                    y: drone.y,
                    width: 4,
                    height: 12,
                    speed: 12,
                    power: drone.attackPower
                });
            }
        }, { passive: false });
        
        attackButton.addEventListener('touchend', function(e) {
            e.preventDefault();
            setInactiveStyle();
        }, { passive: false });
        
        attackButton.addEventListener('touchcancel', function(e) {
            e.preventDefault();
            setInactiveStyle();
        }, { passive: false });
    }
    
    // 画面タップでの代替操作
    function setupAlternativeControls() {
        const gameCanvas = document.getElementById('gameCanvas');
        const coinGameCanvas = document.getElementById('coinGameCanvas');
        
        // メインゲームキャンバスのタップ操作
        if (gameCanvas) {
            gameCanvas.addEventListener('touchstart', function(e) {
                if (!gameRunning) return;
                
                // 既にジョイスティックが操作されている場合は無視
                if (touchJoystick.active) return;
                
                const rect = this.getBoundingClientRect();
                const touchX = e.touches[0].clientX - rect.left;
                const touchY = e.touches[0].clientY - rect.top;
                
                // キャンバス内の相対位置に変換
                const scaleX = this.width / rect.width;
                const scaleY = this.height / rect.height;
                const targetX = touchX * scaleX;
                const targetY = touchY * scaleY;
                
                // ドローンを移動
                const dx = targetX - drone.x - drone.width/2;
                const dy = targetY - drone.y - drone.height/2;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist > 0) {
                    drone.vx += dx * 0.05;
                    drone.vy += dy * 0.05;
                }
                
                // タップで攻撃も行う
                bullets.push({
                    x: drone.x + drone.width/2 - 2,
                    y: drone.y,
                    width: 4,
                    height: 12,
                    speed: 12,
                    power: drone.attackPower
                });
            }, { passive: true });
        }
        
        // コインゲームキャンバスのタップ操作
        if (coinGameCanvas) {
            coinGameCanvas.addEventListener('touchstart', function(e) {
                if (!coinGameState || !coinGameState.active) return;
                
                // 既にジョイスティックが操作されている場合は無視
                if (touchJoystick.active) return;
                
                const rect = this.getBoundingClientRect();
                const touchX = e.touches[0].clientX - rect.left;
                const touchY = e.touches[0].clientY - rect.top;
                
                // キャンバス内の相対位置に変換
                const scaleX = this.width / rect.width;
                const scaleY = this.height / rect.height;
                coinGameState.player.x = touchX * scaleX;
                coinGameState.player.y = touchY * scaleY;
            }, { passive: true });
            
            coinGameCanvas.addEventListener('touchmove', function(e) {
                if (!coinGameState || !coinGameState.active) return;
                
                // 既にジョイスティックが操作されている場合は無視
                if (touchJoystick.active) return;
                
                const rect = this.getBoundingClientRect();
                const touchX = e.touches[0].clientX - rect.left;
                const touchY = e.touches[0].clientY - rect.top;
                
                // キャンバス内の相対位置に変換
                const scaleX = this.width / rect.width;
                const scaleY = this.height / rect.height;
                coinGameState.player.x = touchX * scaleX;
                coinGameState.player.y = touchY * scaleY;
            }, { passive: true });
        }
    }
    
    // 各機能を実行
    enhanceJoystickVisuals();
    improveJoystickControl();
    improveAttackButton();
    setupAlternativeControls();
}

// モバイル特有の問題への対応
function handleMobileSpecificIssues() {
    // ピンチズーム防止
    document.addEventListener('touchmove', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // iOS Safariでの全画面表示時の問題対応
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.addEventListener('resize', function() {
            if (document.activeElement) {
                document.activeElement.blur();
            }
            // 100ms後に再レイアウト
            setTimeout(function() {
                window.scrollTo(0, 0);
            }, 100);
        });
        
        // iOS Safariでのオーディオコンテキスト問題の対応
        document.addEventListener('touchstart', function() {
            // オーディオコンテキストがある場合に再開
            if (window.audioContext && window.audioContext.state === 'suspended') {
                window.audioContext.resume();
            }
        }, { once: true });
    }
    
    // Android Chromeでのパフォーマンス最適化
    if (/Android/i.test(navigator.userAgent)) {
        // Androidでのタッチイベント最適化
        document.querySelectorAll('.joystick-area, .action-button').forEach(el => {
            el.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
            el.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
        });
        
        // Androidでのスクロール問題対応
        document.body.addEventListener('touchmove', function(e) {
            if (gameRunning || (coinGameState && coinGameState.active)) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    // 画面回転時の処理
    window.addEventListener('orientationchange', function() {
        // 向き変更時は少し遅延させて確実に新しいサイズを取得
        setTimeout(function() {
            // キャンバスのリサイズ
            if (typeof resizeCanvas === 'function') {
                resizeCanvas();
            }
            
            // コインゲームキャンバスのリサイズ（存在する場合）
            if (coinGameState && coinGameState.canvas) {
                const width = window.innerWidth;
                const coinGameWidth = Math.min(400, width * 0.9);
                const coinGameHeight = coinGameWidth * 0.75;
                
                coinGameState.canvas.style.width = `${coinGameWidth}px`;
                coinGameState.canvas.style.height = `${coinGameHeight}px`;
            }
            
            // UIの再配置
            const isLandscape = window.innerWidth > window.innerHeight;
            const ui = document.getElementById('ui');
            if (ui) {
                ui.style.flexDirection = isLandscape ? 'column' : 'row';
            }
            
            // モバイルコントロールの再配置
            const mobileControls = document.getElementById('mobileControls');
            if (mobileControls) {
                mobileControls.style.bottom = isLandscape ? '10px' : '20px';
            }
        }, 300);
    });
}

// パフォーマンス最適化
function optimizePerformance() {
    const gameCanvas = document.getElementById('gameCanvas');
    if (!gameCanvas) return;
    
    const ctx = gameCanvas.getContext('2d');
    
    // キャンバスサイズの最適化
    function optimizeCanvasSize() {
        const devicePixelRatio = window.devicePixelRatio || 1;
        const rect = gameCanvas.getBoundingClientRect();
        
        // 論理サイズを保存
        const logicalWidth = rect.width;
        const logicalHeight = rect.height;
        
        // 物理サイズを設定（モバイルデバイスでは低解像度に）
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const scaleFactor = isMobile ? Math.min(devicePixelRatio, 1.5) : devicePixelRatio;
        
        // キャンバスの物理サイズを設定
        gameCanvas.width = Math.floor(logicalWidth * scaleFactor);
        gameCanvas.height = Math.floor(logicalHeight * scaleFactor);
        
        // スタイルサイズを維持
        gameCanvas.style.width = `${logicalWidth}px`;
        gameCanvas.style.height = `${logicalHeight}px`;
        
        // コンテキストのスケーリング
        ctx.scale(scaleFactor, scaleFactor);
        
        // コインゲームキャンバスも最適化（存在する場合）
        const coinGameCanvas = document.getElementById('coinGameCanvas');
        if (coinGameCanvas) {
            const coinCtx = coinGameCanvas.getContext('2d');
            const coinRect = coinGameCanvas.getBoundingClientRect();
            
            coinGameCanvas.width = Math.floor(coinRect.width * scaleFactor);
            coinGameCanvas.height = Math.floor(coinRect.height * scaleFactor);
            
            coinGameCanvas.style.width = `${coinRect.width}px`;
            coinGameCanvas.style.height = `${coinRect.height}px`;
            
            coinCtx.scale(scaleFactor, scaleFactor);
        }
    }
    
    // フレームレート制御の最適化
    function optimizeFrameRate() {
        // モバイルデバイスの場合、フレームレートを調整
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const targetFPS = isMobile ? 30 : 60; // モバイルでは30FPS、PCでは60FPS
        
        // 元のgameLoopを保存
        if (typeof window.gameLoop === 'function') {
            const originalGameLoop = window.gameLoop;
            
            // 最適化されたgameLoopで置き換え
            window.gameLoop = function(timestamp) {
                if (!gameRunning) {
                    if (gameLoopRequestId) {
                        cancelAnimationFrame(gameLoopRequestId);
                        gameLoopRequestId = null;
                    }
                    return;
                }
                
                // フレームレート制御
                const now = timestamp || performance.now();
                const elapsed = now - lastFrameTime;
                const frameInterval = 1000 / targetFPS;
                
                if (elapsed > frameInterval) {
                    lastFrameTime = now - (elapsed % frameInterval);
                    
                    // ゲーム状態の更新
                    updateGameState();
                    
                    // 描画処理
                    draw();
                    updateUI();
                }
                
                // 次のフレームを要求
                gameLoopRequestId = requestAnimationFrame(gameLoop);
            };
        }
    }
    
    // 各最適化を実行
    optimizeCanvasSize();
    
    // リサイズ時にキャンバスサイズを再最適化
    window.addEventListener('resize', optimizeCanvasSize);
}

// モバイル対応の初期化
document.addEventListener('DOMContentLoaded', function() {
    setupMobileEnhancements();
});


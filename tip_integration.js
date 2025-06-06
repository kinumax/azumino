/**
 * 投げ銭機能と新しいゲーム要素の統合・最適化
 * ドローン大冒険ゲーム用
 */

// 投げ銭とコインゲームの連携
function setupTipGameIntegration() {
    // 投げ銭ボーナスの設定
    function setupTipBonus() {
        // 投げ銭金額に応じたボーナスコイン計算
        function calculateTipBonus(xrpAmount) {
            // 基本変換率: 0.1 XRP = 1コイン
            const baseCoins = Math.floor(xrpAmount * 10);
            
            // ボーナス計算（金額が大きいほどボーナス率アップ）
            let bonusRate = 1.0;
            if (xrpAmount >= 2.0) {
                bonusRate = 1.5; // 50%ボーナス
            } else if (xrpAmount >= 1.0) {
                bonusRate = 1.3; // 30%ボーナス
            } else if (xrpAmount >= 0.5) {
                bonusRate = 1.2; // 20%ボーナス
            }
            
            // 最終的なコイン数（切り上げ）
            return Math.ceil(baseCoins * bonusRate);
        }
        
        // 投げ銭金額選択UIの改良
        function enhanceTipAmountSelector() {
            const amountSelector = document.querySelector('.amount-selector');
            if (!amountSelector) return;
            
            // 金額ごとのボーナス表示を追加
            document.querySelectorAll('.amount-btn').forEach(btn => {
                const amount = parseFloat(btn.dataset.amount);
                const bonus = calculateTipBonus(amount);
                
                // ボーナス情報を追加
                if (!btn.querySelector('.bonus-info')) {
                    const bonusInfo = document.createElement('div');
                    bonusInfo.className = 'bonus-info';
                    bonusInfo.textContent = `+${bonus}コイン`;
                    bonusInfo.style.fontSize = '12px';
                    bonusInfo.style.color = '#FFD700';
                    bonusInfo.style.marginTop = '4px';
                    
                    btn.appendChild(bonusInfo);
                    
                    // スタイル調整
                    btn.style.display = 'flex';
                    btn.style.flexDirection = 'column';
                    btn.style.alignItems = 'center';
                    btn.style.justifyContent = 'center';
                    btn.style.padding = '8px 12px';
                    btn.style.height = 'auto';
                    btn.style.minHeight = '60px';
                }
            });
        }
        
        // 初期化時に実行
        enhanceTipAmountSelector();
        
        // QRコード生成時のボーナス設定
        const originalGenerateQR = window.generateQR;
        if (typeof originalGenerateQR === 'function') {
            window.generateQR = function() {
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
                    const bonusCoins = calculateTipBonus(selectedAmount);
                    
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
            };
        }
    }
    
    // コインゲームと投げ銭の連携強化
    function enhanceCoinGameTipIntegration() {
        // コインゲーム結果画面に投げ銭ボタンを追加
        function addTipButtonToCoinGameResult() {
            const coinGameResultScreen = document.getElementById('coinGameResultScreen');
            if (!coinGameResultScreen) return;
            
            const backButton = document.getElementById('backToMainGameButton');
            if (!backButton) return;
            
            // 投げ銭ボタンがまだなければ追加
            if (!document.getElementById('coinGameTipButton')) {
                const tipButton = document.createElement('button');
                tipButton.id = 'coinGameTipButton';
                tipButton.className = 'screen-button';
                tipButton.innerHTML = '💰 投げ銭して応援';
                tipButton.style.backgroundColor = '#FFD700';
                tipButton.style.color = '#333';
                
                // イベントリスナー追加
                tipButton.addEventListener('click', () => {
                    showTipScreen();
                });
                
                // バックボタンの前に挿入
                coinGameResultScreen.insertBefore(tipButton, backButton);
            }
        }
        
        // 投げ銭完了ボタンの設定
        function setupTipCompleteButton() {
            const tipCompleteButton = document.getElementById('tipCompleteButton');
            if (!tipCompleteButton) return;
            
            // イベントリスナーが既に設定されていない場合のみ追加
            if (!tipCompleteButton.hasEventListener) {
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
                
                tipCompleteButton.hasEventListener = true;
            }
        }
        
        // 初期化時に実行
        addTipButtonToCoinGameResult();
        setupTipCompleteButton();
    }
    
    // 投げ銭UIの改良
    function improveTipUI() {
        // 投げ銭画面のレイアウト改善
        function enhanceTipScreenLayout() {
            const tipScreen = document.getElementById('tipScreen');
            if (!tipScreen) return;
            
            // 投げ銭情報の視覚的強化
            const displayAddress = document.getElementById('displayAddress');
            if (displayAddress) {
                // アドレス表示の改良
                displayAddress.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                displayAddress.style.padding = '8px';
                displayAddress.style.borderRadius = '8px';
                displayAddress.style.fontSize = '14px';
                displayAddress.style.wordBreak = 'break-all';
                displayAddress.style.marginBottom = '15px';
                
                // コピーボタンの追加（まだ存在しない場合のみ）
                if (!document.getElementById('copyAddressButton')) {
                    const copyButton = document.createElement('button');
                    copyButton.id = 'copyAddressButton';
                    copyButton.textContent = 'アドレスをコピー';
                    copyButton.className = 'screen-button';
                    copyButton.style.fontSize = '14px';
                    copyButton.style.padding = '8px 15px';
                    copyButton.style.marginTop = '10px';
                    
                    copyButton.addEventListener('click', function() {
                        navigator.clipboard.writeText(displayAddress.textContent)
                            .then(() => {
                                this.textContent = 'コピーしました！';
                                setTimeout(() => {
                                    this.textContent = 'アドレスをコピー';
                                }, 2000);
                            })
                            .catch(err => {
                                console.error('アドレスのコピーに失敗しました:', err);
                            });
                    });
                    
                    displayAddress.parentNode.appendChild(copyButton);
                }
            }
            
            // QRコードエリアの改良
            const qrCodeArea = document.getElementById('qrCodeArea');
            if (qrCodeArea) {
                qrCodeArea.style.backgroundColor = 'white';
                qrCodeArea.style.padding = '15px';
                qrCodeArea.style.borderRadius = '15px';
                qrCodeArea.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                qrCodeArea.style.margin = '15px auto';
                qrCodeArea.style.maxWidth = '250px';
            }
        }
        
        // 初期化時に実行
        enhanceTipScreenLayout();
    }
    
    // 各機能を実行
    setupTipBonus();
    enhanceCoinGameTipIntegration();
    improveTipUI();
}

// ページ読み込み完了時に実行
document.addEventListener('DOMContentLoaded', function() {
    setupTipGameIntegration();
});


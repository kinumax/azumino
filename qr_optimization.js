/**
 * QRコード生成機能の最適化
 * ドローン大冒険ゲーム用
 */

// QRコード生成の最適化
function optimizeQRCodeGeneration() {
    // QRコードのキャッシュ機能
    const qrCache = {};
    
    // オフライン対応のためのQRコードライブラリ
    function loadQRCodeLibrary() {
        return new Promise((resolve, reject) => {
            // QRコードライブラリがすでに読み込まれているか確認
            if (window.QRCode) {
                resolve();
                return;
            }
            
            // QRコードライブラリを動的に読み込み
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('QRコードライブラリの読み込みに失敗しました'));
            document.head.appendChild(script);
        });
    }
    
    // クライアントサイドでQRコードを生成する関数
    async function generateQRCodeLocally(text, element) {
        try {
            await loadQRCodeLibrary();
            
            return new Promise((resolve, reject) => {
                QRCode.toDataURL(text, { 
                    errorCorrectionLevel: 'M',
                    margin: 1,
                    width: 180,
                    color: {
                        dark: '#000000',
                        light: '#ffffff'
                    }
                }, (err, url) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    if (element) {
                        element.src = url;
                    }
                    resolve(url);
                });
            });
        } catch (error) {
            console.error('QRコードの生成に失敗しました:', error);
            throw error;
        }
    }
    
    // QRコード生成関数の最適化
    async function generateQROptimized() {
        const qrCodeArea = document.getElementById('qrCodeArea');
        const qrImage = document.getElementById('qrImage');
        const messageEl = document.getElementById('tipMessage');
        const tipCompleteButton = document.getElementById('tipCompleteButton');
        
        const paymentUrl = `https://xrp.to/${streamerSettings.address}?amount=${selectedAmount}`;
        
        // ローディング表示
        messageEl.textContent = 'QRコードを生成中...';
        qrCodeArea.style.display = 'block';
        
        try {
            // キャッシュチェック
            if (qrCache[paymentUrl]) {
                qrImage.src = qrCache[paymentUrl];
            } else {
                // オンラインチェック
                if (navigator.onLine) {
                    // オンラインの場合はAPIを使用
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(paymentUrl)}`;
                    
                    // 画像プリロード
                    const img = new Image();
                    img.onload = function() {
                        qrImage.src = qrUrl;
                        qrCache[paymentUrl] = qrUrl;
                    };
                    img.onerror = async function() {
                        // APIが失敗した場合はローカル生成にフォールバック
                        try {
                            const dataUrl = await generateQRCodeLocally(paymentUrl);
                            qrImage.src = dataUrl;
                            qrCache[paymentUrl] = dataUrl;
                        } catch (err) {
                            messageEl.textContent = 'QRコードの生成に失敗しました。もう一度お試しください。';
                            messageEl.style.color = '#FF6347';
                            return;
                        }
                    };
                    img.src = qrUrl;
                } else {
                    // オフラインの場合はローカル生成
                    try {
                        const dataUrl = await generateQRCodeLocally(paymentUrl);
                        qrImage.src = dataUrl;
                        qrCache[paymentUrl] = dataUrl;
                    } catch (err) {
                        messageEl.textContent = 'QRコードの生成に失敗しました。もう一度お試しください。';
                        messageEl.style.color = '#FF6347';
                        return;
                    }
                }
            }
            
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
            
        } catch (error) {
            console.error('QRコード生成エラー:', error);
            messageEl.textContent = 'QRコードの生成に失敗しました。もう一度お試しください。';
            messageEl.style.color = '#FF6347';
        }
    }
    
    // QRコードのサイズ最適化
    function optimizeQRCodeSize() {
        const qrImage = document.getElementById('qrImage');
        if (!qrImage) return;
        
        // 画面サイズに応じたQRコードサイズ調整
        function adjustQRSize() {
            const screenWidth = window.innerWidth;
            let qrSize;
            
            if (screenWidth < 360) {
                qrSize = 150;
            } else if (screenWidth < 768) {
                qrSize = 180;
            } else {
                qrSize = 200;
            }
            
            qrImage.style.width = `${qrSize}px`;
            qrImage.style.height = `${qrSize}px`;
        }
        
        // 初期調整
        adjustQRSize();
        
        // リサイズ時に再調整
        window.addEventListener('resize', adjustQRSize);
    }
    
    // QRコードの視認性向上
    function enhanceQRCodeVisibility() {
        const qrCodeArea = document.getElementById('qrCodeArea');
        if (!qrCodeArea) return;
        
        // QRコードエリアのスタイル改善
        qrCodeArea.style.backgroundColor = 'white';
        qrCodeArea.style.padding = '15px';
        qrCodeArea.style.borderRadius = '15px';
        qrCodeArea.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        qrCodeArea.style.margin = '15px auto';
        qrCodeArea.style.maxWidth = '250px';
        
        // QRコードの説明テキスト改善
        const qrTitle = qrCodeArea.querySelector('p');
        if (qrTitle) {
            qrTitle.style.color = '#333';
            qrTitle.style.fontWeight = 'bold';
            qrTitle.style.marginBottom = '10px';
        }
        
        // QRコード画像の枠線追加
        const qrImage = document.getElementById('qrImage');
        if (qrImage) {
            qrImage.style.border = '1px solid #ddd';
            qrImage.style.padding = '5px';
            qrImage.style.backgroundColor = 'white';
        }
    }
    
    // 元のQRコード生成関数を置き換え
    window.generateQR = generateQROptimized;
    
    // 各最適化を実行
    optimizeQRCodeSize();
    enhanceQRCodeVisibility();
    
    return {
        generateQRCodeLocally
    };
}

// ページ読み込み完了時に実行
document.addEventListener('DOMContentLoaded', function() {
    optimizeQRCodeGeneration();
});


const board = document.getElementById('board');
const status = document.getElementById('status');
const resetButton = document.getElementById('reset-button');

// ゲーム状態の管理
// 0: 空, 1: 黒, -1: 白
let gameState = Array(8).fill().map(() => Array(8).fill(0));
let currentPlayer = 1; // 1: 黒, -1: 白
let canPlay = true;

// ゲームを初期状態にリセット
function resetGame() {
    if (!confirm('ゲームをリセットしますか？')) {
        return;
    }

    // ゲーム状態をリセット
    gameState = Array(8).fill().map(() => Array(8).fill(0));
    currentPlayer = 1;
    canPlay = true;

    // 盤面をクリア
    const cells = board.children;
    for (let i = 0; i < 64; i++) {
        cells[i].innerHTML = '';
        cells[i].classList.remove('valid-move');
    }

    // 初期配置を設定
    gameState[3][3] = -1;
    gameState[3][4] = 1;
    gameState[4][3] = 1;
    gameState[4][4] = -1;

    const initialPositions = [
        { row: 3, col: 3, isBlack: false },
        { row: 3, col: 4, isBlack: true },
        { row: 4, col: 3, isBlack: true },
        { row: 4, col: 4, isBlack: false }
    ];

    initialPositions.forEach(pos => {
        const index = pos.row * 8 + pos.col;
        if (pos.isBlack) {
            makeBlack(cells[index]);
        } else {
            makeWhite(cells[index]);
        }
    });

    // ステータス表示を更新
    status.textContent = '黒の番です';

    // 有効な手をハイライト
    highlightValidMoves();
}

// 初期配置
gameState[3][3] = -1;
gameState[3][4] = 1;
gameState[4][3] = 1;
gameState[4][4] = -1;

// 方向ベクトル（8方向）
const DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
];

// 石を置けるかチェック
function isValidMove(row, col, player) {
    if (gameState[row][col] !== 0) return false;
    
    for (const [dx, dy] of DIRECTIONS) {
        let x = row + dx;
        let y = col + dy;
        let flips = [];
        
        while (x >= 0 && x < 8 && y >= 0 && y < 8 && gameState[x][y] === -player) {
            flips.push([x, y]);
            x += dx;
            y += dy;
        }
        
        if (flips.length > 0 && x >= 0 && x < 8 && y >= 0 && y < 8 && gameState[x][y] === player) {
            return true;
        }
    }
    return false;
}

// 有効な手の位置をハイライト
function highlightValidMoves() {
    // 既存のハイライトをクリア
    const cells = board.children;
    for (let i = 0; i < 64; i++) {
        cells[i].classList.remove('valid-move');
    }

    // 新しい有効な手をハイライト
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (isValidMove(row, col, currentPlayer)) {
                const index = row * 8 + col;
                cells[index].classList.add('valid-move');
            }
        }
    }
}

// 石を裏返す
function flipStones(row, col, player) {
    gameState[row][col] = player;
    
    for (const [dx, dy] of DIRECTIONS) {
        let x = row + dx;
        let y = col + dy;
        let flips = [];
        
        while (x >= 0 && x < 8 && y >= 0 && y < 8 && gameState[x][y] === -player) {
            flips.push([x, y]);
            x += dx;
            y += dy;
        }
        
        if (flips.length > 0 && x >= 0 && x < 8 && y >= 0 && y < 8 && gameState[x][y] === player) {
            for (const [flipX, flipY] of flips) {
                gameState[flipX][flipY] = player;
                const index = flipX * 8 + flipY;
                const cell = board.children[index];
                if (player === 1) {
                    makeBlack(cell);
                } else {
                    makeWhite(cell);
                }
            }
        }
    }
}

// 有効な手があるかチェック
function hasValidMoves(player) {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (isValidMove(i, j, player)) {
                return true;
            }
        }
    }
    return false;
}

// ゲーム終了判定
function checkGameEnd() {
    if (!hasValidMoves(1) && !hasValidMoves(-1)) {
        const blackCount = gameState.flat().filter(cell => cell === 1).length;
        const whiteCount = gameState.flat().filter(cell => cell === -1).length;
        let message = `ゲーム終了!\n黒: ${blackCount} 白: ${whiteCount}\n`;
        message += blackCount > whiteCount ? '黒の勝ち!' : 
                  blackCount < whiteCount ? '白の勝ち!' : '引き分け!';
        setTimeout(() => alert(message), 100);
        canPlay = false;
    }
}

// 石を作成する関数
function makeBlack(masu) {
    masu.innerHTML = '<div class="stone black"></div>';
}

function makeWhite(masu) {
    masu.innerHTML = '<div class="stone white"></div>';
}

// ボードの作成
for (let i = 0; i < 64; i++) {
    const masu = document.createElement('div');
    const row = Math.floor(i / 8);
    const col = i % 8;
    
    // 初期配置
    if ((row === 3 && col === 3) || (row === 4 && col === 4)) {
        makeWhite(masu);
    } else if ((row === 3 && col === 4) || (row === 4 && col === 3)) {
        makeBlack(masu);
    }
    
    masu.addEventListener('click', () => {
        if (!canPlay) return;
        
        if (isValidMove(row, col, currentPlayer)) {
            if (currentPlayer === 1) {
                makeBlack(masu);
            } else {
                makeWhite(masu);
            }
            
            flipStones(row, col, currentPlayer);
            currentPlayer = -currentPlayer;
            
            // 次のプレイヤーが打てる手があるかチェック
            if (!hasValidMoves(currentPlayer)) {
                currentPlayer = -currentPlayer;
                if (!hasValidMoves(currentPlayer)) {
                    checkGameEnd();
                } else {
                    alert('パスします');
                }
            }
            
            status.textContent = `${currentPlayer === 1 ? '黒' : '白'}の番です`;
            highlightValidMoves(); // 有効な手を更新
        }
    });

    board.append(masu);
}

// リセットボタンのイベントリスナーを追加
resetButton.addEventListener('click', resetGame);

// 初期状態で有効な手をハイライト
highlightValidMoves();
// 型定義
type Player = 1 | -1 | 0;  // 1: 黒, -1: 白, 0: 空
type GameState = Player[][];
type Direction = [number, number];

interface Position {
    row: number;
    col: number;
    isBlack: boolean;
}

// DOM要素の取得
const board = document.getElementById('board') as HTMLDivElement;
const statusElement = document.getElementById('status') as HTMLDivElement;
const resetButton = document.getElementById('reset-button') as HTMLButtonElement;

// ゲーム状態の管理
let gameState: GameState = Array(8).fill(null).map(() => Array(8).fill(0));
let currentPlayer: Player = 1; // 1: 黒, -1: 白
let canPlay: boolean = true;

// 方向ベクトル（8方向）
const DIRECTIONS: Direction[] = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
];

// 石を置けるかチェック
function isValidMove(row: number, col: number, player: Player): boolean {
    if (gameState[row][col] !== 0) return false;
    
    for (const [dx, dy] of DIRECTIONS) {
        let x: number = row + dx;
        let y: number = col + dy;
        const flips: [number, number][] = [];
        
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
function highlightValidMoves(): void {
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
function flipStones(row: number, col: number, player: Player): void {
    gameState[row][col] = player;
    
    for (const [dx, dy] of DIRECTIONS) {
        let x: number = row + dx;
        let y: number = col + dy;
        const flips: [number, number][] = [];
        
        while (x >= 0 && x < 8 && y >= 0 && y < 8 && gameState[x][y] === -player) {
            flips.push([x, y]);
            x += dx;
            y += dy;
        }
        
        if (flips.length > 0 && x >= 0 && x < 8 && y >= 0 && y < 8 && gameState[x][y] === player) {
            for (const [flipX, flipY] of flips) {
                gameState[flipX][flipY] = player;
                const index = flipX * 8 + flipY;
                const cell = board.children[index] as HTMLDivElement;
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
function hasValidMoves(player: Player): boolean {
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
function checkGameEnd(): void {
    if (!hasValidMoves(1) && !hasValidMoves(-1)) {
        const blackCount = gameState.flat().filter((cell: Player) => cell === 1).length;
        const whiteCount = gameState.flat().filter((cell: Player) => cell === -1).length;
        let message = `ゲーム終了!\n黒: ${blackCount} 白: ${whiteCount}\n`;
        message += blackCount > whiteCount ? '黒の勝ち!' : 
                  blackCount < whiteCount ? '白の勝ち!' : '引き分け!';
        setTimeout(() => alert(message), 100);
        canPlay = false;
    }
}

// 石を作成する関数
function makeBlack(masu: HTMLDivElement): void {
    masu.innerHTML = '<div class="stone black"></div>';
}

function makeWhite(masu: HTMLDivElement): void {
    masu.innerHTML = '<div class="stone white"></div>';
}

// ゲームを初期状態にリセット
function resetGame(): void {
    if (!confirm('ゲームをリセットしますか？')) {
        return;
    }

    // ゲーム状態をリセット
    gameState = Array(8).fill(null).map(() => Array(8).fill(0));
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

    const initialPositions: Position[] = [
        { row: 3, col: 3, isBlack: false },
        { row: 3, col: 4, isBlack: true },
        { row: 4, col: 3, isBlack: true },
        { row: 4, col: 4, isBlack: false }
    ];

    initialPositions.forEach(pos => {
        const index = pos.row * 8 + pos.col;
        const cell = board.children[index] as HTMLDivElement;
        if (pos.isBlack) {
            makeBlack(cell);
        } else {
            makeWhite(cell);
        }
    });

    // ステータス表示を更新
    statusElement.textContent = '黒の番です';

    // 有効な手をハイライト
    highlightValidMoves();
}

// 初期配置
gameState[3][3] = -1;
gameState[3][4] = 1;
gameState[4][3] = 1;
gameState[4][4] = -1;

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
            currentPlayer = currentPlayer === 1 ? -1 : 1;
            
            if (!hasValidMoves(currentPlayer)) {
                currentPlayer = currentPlayer === 1 ? -1 : 1;
                if (!hasValidMoves(currentPlayer)) {
                    checkGameEnd();
                } else {
                    alert('パスします');
                }
            }
            
            statusElement.textContent = `${currentPlayer === 1 ? '黒' : '白'}の番です`;
            highlightValidMoves(); // 有効な手を更新
        }
    });

    board.append(masu);
}

// リセットボタンのイベントリスナーを追加
resetButton.addEventListener('click', resetGame);

// 初期状態で有効な手をハイライト
highlightValidMoves(); 
const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

// Get references to new UI elements
const gameInfo = document.getElementById("game-info");
const playerWhiteInfo = document.getElementById("player-white");
const playerBlackInfo = document.getElementById("player-black");
const gameStatus = document.getElementById("game-status");
const userRoleDisplay = document.getElementById("user-role");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add(
                "square",
                (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
            );

            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add(
                    "piece",
                    square.color === "w" ? "white" : "black"
                );
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: squareIndex };
                        e.dataTransfer.setData("text/plain", "");
                        pieceElement.classList.add("dragging");
                    }
                });

                pieceElement.addEventListener("dragend", () => {
                    draggedPiece = null;
                    sourceSquare = null;
                    pieceElement.classList.remove("dragging");
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", function (e) {
                e.preventDefault();
            });

            squareElement.addEventListener("drop", function (e) {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };
                    handleMove(sourceSquare, targetSquare);
                }
            });
            boardElement.appendChild(squareElement);
        });
    });

    if (playerRole === 'b') {
        boardElement.classList.add("flipped");
    } else {
        boardElement.classList.remove("flipped");
    }
};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q', // Always promote to queen for simplicity
    };
    socket.emit("move", move);
};

const getPieceUnicode = (piece) => {
    const unicodePieces = { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚', P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔' };
    return unicodePieces[piece.type] || "";
};

// --- NEW AND MODIFIED SOCKET LISTENERS ---

socket.on("playerRole", function (role) {
    playerRole = role;
    userRoleDisplay.innerText = `You are ${role === 'w' ? 'White' : 'Black'}`;
    renderBoard();
});

socket.on("spectatorRole", function () {
    playerRole = null;
    userRoleDisplay.innerText = "You are a Spectator";
    renderBoard();
});

socket.on("updateState", function (gameState) {
    chess.load(gameState.fen);
    renderBoard();
    updateUI(gameState);
});

socket.on("invalidMove", function (move) {
    // Provide feedback for an invalid move
    gameStatus.innerText = "Invalid Move!";
    gameStatus.style.color = "#e74c3c"; // Red color for error
    setTimeout(() => {
        updateUI({ turn: chess.turn() }); // Reset status text after a moment
    }, 2000);
});

socket.on("gameOver", function (result) {
    gameStatus.innerText = `Game Over: ${result}`;
    gameStatus.style.color = "#2ecc71"; // Green for success/end
    // Maybe show a modal or a more prominent message
});

// Helper function to update all UI elements
const updateUI = (gameState) => {
    // Update player connection status
    playerWhiteInfo.querySelector('.status').innerText = gameState.players?.white ? "Connected" : "Disconnected";
    playerBlackInfo.querySelector('.status').innerText = gameState.players?.black ? "Connected" : "Disconnected";

    // Update turn indicator
    const turnColor = gameState.turn === 'w' ? "White's" : "Black's";
    gameStatus.innerText = `${turnColor} Turn`;
    gameStatus.style.color = "#ffcc00"; // Reset to default color

    // Add a check indicator
    if (chess.inCheck()) {
        gameStatus.innerText += " - Check!";
        gameStatus.style.color = "#f39c12"; // Orange for warning
    }
};

renderBoard();
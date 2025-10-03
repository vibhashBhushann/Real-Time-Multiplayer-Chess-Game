const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socket(server);

let chess = new Chess();
let players = {};
let currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", { title: "Chess Game" });
});

// Helper function to broadcast game state
const updateGameState = () => {
    const gameState = {
        players: {
            white: !!players.white, // Send boolean true/false if player exists
            black: !!players.black,
        },
        fen: chess.fen(),
        turn: chess.turn(),
        isGameOver: chess.isGameOver(),
    };
    io.emit("updateState", gameState);
};

io.on("connection", function (uniquesocket) {
    console.log("connected", uniquesocket.id);

    // Assign roles
    if (!players.white) {
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole", "w");
    } else if (!players.black) {
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b");
    } else {
        uniquesocket.emit("spectatorRole");
    }

    // Send initial and updated game state to everyone
    updateGameState();

    uniquesocket.on("disconnect", function () {
        console.log("disconnected", uniquesocket.id);

        if (uniquesocket.id === players.white) {
            delete players.white;
        } else if (uniquesocket.id === players.black) {
            delete players.black;
        }
        
        // If both player slots are now empty, reset the game.
        if (!players.white && !players.black) {
            console.log("Both players disconnected. Resetting game.");
            chess = new Chess();
        }

        // Notify remaining clients about the updated state.
        updateGameState(); 
    });

    uniquesocket.on("move", (move) => {
        try {
            if (chess.turn() === "w" && uniquesocket.id !== players.white) return;
            if (chess.turn() === "b" && uniquesocket.id !== players.black) return;

            const result = chess.move(move);
            if (result) {
                currentPlayer = chess.turn();
                updateGameState(); // Send the updated state to all clients

                if (chess.isGameOver()) {
                    let gameResult = "Draw";
                    if (chess.isCheckmate()) {
                        gameResult = chess.turn() === "w" ? "Black Wins by Checkmate!" : "White Wins by Checkmate!";
                    }
                    io.emit("gameOver", gameResult);
                    // Reset game for a new match after a delay
                    setTimeout(() => {
                        chess = new Chess();
                        updateGameState();
                    }, 5000); // 5-second delay before reset
                }
            } else {
                console.log("Invalid move:", move);
                uniquesocket.emit("invalidMove", move);
            }
        } catch (err) {
            console.log(err);
            uniquesocket.emit("invalidMove", move);
        }
    });

    // Add a manual reset for players
    uniquesocket.on("resetGame", () => {
        if (uniquesocket.id === players.white || uniquesocket.id === players.black) {
            chess = new Chess();
            updateGameState();
        }
    });
});

server.listen(3000, function () {
    console.log("listening on port 3000");
});
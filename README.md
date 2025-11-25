# Real-Time Multiplayer Chess Game

A classic multiplayer chess game built with Node.js, Express, and Socket.IO. This application allows two players to play chess in real-time, while any number of additional users can join to watch the match as spectators.

<img width="353" height="628" alt="image" src="https://github.com/user-attachments/assets/2aa31421-6c95-4dbb-afcb-4d6bf5778e6b" />


## Features

- **Real-Time Gameplay**: Moves are reflected instantly for all connected users using WebSockets
- **Player vs. Player**: The first two users to connect are assigned as White and Black
- **Spectator Mode**: Any subsequent users can join and watch the live game
- **Interactive UI**: A clean, intuitive interface with drag-and-drop piece movement
- **Server-Authoritative Logic**: All game rules and move validations are handled by the server to prevent cheating
- **Graceful Disconnects**: The game persists if one player disconnects and automatically resets only when both players have left

## Technology Stack

- **Backend**: Node.js, Express.js
- **Real-Time Communication**: Socket.IO
- **Chess Engine**: chess.js (for move validation and game state management)
- **Frontend**: Vanilla JavaScript, EJS, HTML5, CSS3

## Installation and Setup

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (which includes npm)
- Git

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   ```

2. **Navigate to the project directory**
   ```bash
   cd your-repo-name
   ```

3. **Install NPM packages**
   ```bash
   npm install
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`. Open two browser tabs to start a game, and a third to join as a spectator!

## How It Works

The application uses a **server-authoritative architecture**. The Node.js server maintains the "single source of truth" for the game state using the `chess.js` library.

1. Clients connect to the server via a persistent WebSocket connection managed by Socket.IO
2. When a player makes a move, the move data is sent to the server
3. The server validates the move against the rules of chess
4. If the move is valid, the server updates its master game state and then broadcasts the new board position to all connected clients (players and spectators)
5. Clients receive the new state and re-render their UI accordingly

This ensures that all users are perfectly synchronized and that no illegal moves can be made.

## Project Structure

```
your-repo-name/
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── views/
│   └── index.ejs
├── app.js
├── package.json
└── README.md
```

## Future Improvements

- [ ] **Multiple Game Rooms**: Implement a lobby and room system to allow for multiple concurrent games
- [ ] **Database Integration**: Add user accounts, match history, and ELO ratings using a database like MongoDB or PostgreSQL
- [ ] **Game Timers**: Introduce chess clocks for timed matches
- [ ] **Frontend Framework**: Refactor the frontend using a modern framework like React or Vue for better state management
- [ ] **Move History**: Display a list of all moves made during the game
- [ ] **Chat Feature**: Add real-time chat between players and spectators

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgments

- [chess.js](https://github.com/jhlywa/chess.js) - Chess move validation and game state management
- [Socket.IO](https://socket.io/) - Real-time bidirectional event-based communication
- [Express.js](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Game rooms storage
const rooms = new Map();

// Generate unique room code
function generateRoomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Create a new room
    socket.on('create_room', ({ playerName }) => {
        const roomCode = generateRoomCode();

        const room = {
            code: roomCode,
            players: [{
                id: socket.id,
                name: playerName,
                isHost: true
            }],
            gameState: null,
            isGameStarted: false
        };

        rooms.set(roomCode, room);
        socket.join(roomCode);

        socket.emit('room_created', { roomCode, room });
        console.log(`Room created: ${roomCode} by ${playerName}`);
    });

    // Join an existing room
    socket.on('join_room', ({ roomCode, playerName }) => {
        const room = rooms.get(roomCode);

        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        if (room.players.length >= 2) {
            socket.emit('error', { message: 'Room is full' });
            return;
        }

        room.players.push({
            id: socket.id,
            name: playerName,
            isHost: false
        });

        socket.join(roomCode);

        // Notify both players
        io.to(roomCode).emit('player_joined', { room });
        console.log(`${playerName} joined room: ${roomCode}`);
    });

    // Start game
    socket.on('start_game', ({ roomCode, initialGameState }) => {
        const room = rooms.get(roomCode);

        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        const player = room.players.find(p => p.id === socket.id);
        if (!player || !player.isHost) {
            socket.emit('error', { message: 'Only host can start the game' });
            return;
        }

        room.isGameStarted = true;
        room.gameState = initialGameState;

        io.to(roomCode).emit('game_started', { gameState: initialGameState });
        console.log(`Game started in room: ${roomCode}`);
    });

    // Word selected
    socket.on('word_selected', ({ roomCode, word }) => {
        const room = rooms.get(roomCode);
        if (!room) return;

        if (room.gameState) {
            room.gameState.currentTurn.selectedWord = word;
            room.gameState.phase = 'QUESTIONING';
        }

        // Send word to picker, but not to guesser
        const picker = room.players.find(p => p.id === socket.id);
        if (picker) {
            socket.emit('word_confirmed', { word });
            // Notify other player that word was selected (without revealing it)
            socket.to(roomCode).emit('word_selected_notification');
        }
    });

    // Question asked
    socket.on('ask_question', ({ roomCode, question }) => {
        const room = rooms.get(roomCode);
        if (!room) return;

        console.log(`Question asked in room ${roomCode}:`, question);
        // Broadcast to all players in the room
        io.to(roomCode).emit('question_asked', { question });
        console.log(`Broadcasted question to room ${roomCode}`);
    });

    // Answer provided
    socket.on('provide_answer', ({ roomCode, question, answer }) => {
        const room = rooms.get(roomCode);
        if (!room) return;

        if (room.gameState) {
            room.gameState.currentTurn.questions.push({ question, answer });

            const guesserIndex = room.gameState.currentTurn.guesserIndex;
            room.gameState.players[guesserIndex].totalQuestionsAsked += 1;
        }

        io.to(roomCode).emit('answer_provided', { question, answer, gameState: room.gameState });
    });

    // Guess made
    socket.on('make_guess', ({ roomCode, guess }) => {
        const room = rooms.get(roomCode);
        if (!room) return;

        if (room.gameState) {
            const isCorrect = guess.toLowerCase().trim() === room.gameState.currentTurn.selectedWord.toLowerCase().trim();
            const updatedGuesses = [...room.gameState.currentTurn.guesses, guess];

            const guesserIndex = room.gameState.currentTurn.guesserIndex;
            room.gameState.players[guesserIndex].totalGuesses += 1;
            room.gameState.currentTurn.guesses = updatedGuesses;

            if (isCorrect) {
                room.gameState.players[guesserIndex].totalWins += 1;
                room.gameState.phase = 'REVEALING_RESULT';
                room.gameState.currentTurn.isSolved = true;
            } else if (updatedGuesses.length >= 2) {
                room.gameState.phase = 'REVEALING_RESULT';
                room.gameState.currentTurn.isSolved = false;
            }
        }

        io.to(roomCode).emit('guess_made', { guess, gameState: room.gameState });
    });

    // Next turn
    socket.on('next_turn', ({ roomCode }) => {
        const room = rooms.get(roomCode);
        if (!room || !room.gameState) return;

        const nextGuesser = room.gameState.currentTurn.pickerIndex;
        const nextPicker = room.gameState.currentTurn.guesserIndex;

        const isEndOfRound = room.gameState.currentTurn.pickerIndex === 1;
        const nextRound = isEndOfRound ? room.gameState.currentRound + 1 : room.gameState.currentRound;

        if (nextRound > room.gameState.maxRounds) {
            room.gameState.phase = 'GAME_OVER';
        } else {
            room.gameState.currentRound = nextRound;
            room.gameState.phase = 'PICKING_WORD';
            room.gameState.currentTurn = {
                pickerIndex: nextPicker,
                guesserIndex: nextGuesser,
                selectedWord: '',
                questions: [],
                guesses: [],
                isSolved: false
            };
        }

        io.to(roomCode).emit('turn_changed', { gameState: room.gameState });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Find and clean up rooms
        rooms.forEach((room, roomCode) => {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);

            if (playerIndex !== -1) {
                const disconnectedPlayer = room.players[playerIndex];
                room.players.splice(playerIndex, 1);

                if (room.players.length === 0) {
                    // Delete empty room
                    rooms.delete(roomCode);
                    console.log(`Room ${roomCode} deleted (empty)`);
                } else {
                    // Notify remaining players
                    io.to(roomCode).emit('player_disconnected', {
                        playerName: disconnectedPlayer.name,
                        room
                    });
                }
            }
        });
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

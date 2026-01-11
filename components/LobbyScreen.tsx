import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { RoomData, ConnectionStatus } from '../types';

interface LobbyScreenProps {
    onGameStart: (roomCode: string, playerIndex: number, playerNames: string[]) => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ onGameStart }) => {
    const { socket, connectionStatus } = useSocket();
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [currentRoom, setCurrentRoom] = useState<RoomData | null>(null);
    const [error, setError] = useState('');
    const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');

    useEffect(() => {
        if (!socket) return;

        socket.on('room_created', ({ roomCode, room }: { roomCode: string; room: RoomData }) => {
            setCurrentRoom(room);
            setRoomCode(roomCode);
            setMode('create');
        });

        socket.on('player_joined', ({ room }: { room: RoomData }) => {
            setCurrentRoom(room);
        });

        socket.on('game_started', ({ gameState }) => {
            if (currentRoom) {
                const playerIndex = currentRoom.players.findIndex(p => p.id === socket.id);
                const playerNames = currentRoom.players.map(p => p.name);
                onGameStart(currentRoom.code, playerIndex, playerNames);
            }
        });

        socket.on('error', ({ message }: { message: string }) => {
            setError(message);
        });

        socket.on('player_disconnected', ({ playerName }: { playerName: string }) => {
            setError(`${playerName} disconnected from the game`);
            setCurrentRoom(null);
            setMode('select');
        });

        return () => {
            socket.off('room_created');
            socket.off('player_joined');
            socket.off('game_started');
            socket.off('error');
            socket.off('player_disconnected');
        };
    }, [socket, currentRoom, onGameStart]);

    const createRoom = () => {
        if (!playerName.trim()) {
            setError('Please enter your name');
            return;
        }
        setError('');
        socket?.emit('create_room', { playerName: playerName.trim() });
    };

    const joinRoom = () => {
        if (!playerName.trim()) {
            setError('Please enter your name');
            return;
        }
        if (!roomCode.trim()) {
            setError('Please enter a room code');
            return;
        }
        setError('');
        socket?.emit('join_room', { roomCode: roomCode.trim().toUpperCase(), playerName: playerName.trim() });
    };

    const startGame = () => {
        if (!currentRoom || currentRoom.players.length < 2) {
            setError('Waiting for another player to join');
            return;
        }

        const initialGameState = {
            players: currentRoom.players.map(p => ({
                name: p.name,
                totalWins: 0,
                totalQuestionsAsked: 0,
                totalGuesses: 0
            })),
            currentRound: 1,
            maxRounds: 3,
            phase: 'PICKING_WORD',
            currentTurn: {
                pickerIndex: 0,
                guesserIndex: 1,
                selectedWord: '',
                questions: [],
                guesses: [],
                isSolved: false
            },
            roomCode: currentRoom.code
        };

        socket?.emit('start_game', { roomCode: currentRoom.code, initialGameState });
    };

    if (connectionStatus !== ConnectionStatus.CONNECTED) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="animate-pulse">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {connectionStatus === ConnectionStatus.CONNECTING ? 'Connecting...' : 'Connection Error'}
                        </h2>
                        <p className="text-gray-600">
                            {connectionStatus === ConnectionStatus.CONNECTING
                                ? 'Please wait while we connect to the server'
                                : 'Unable to connect to the server. Please check if the server is running.'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (currentRoom) {
        const isHost = currentRoom.players.find(p => p.id === socket?.id)?.isHost;
        const isFull = currentRoom.players.length === 2;

        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                    <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Game Lobby
                    </h1>

                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Room Code</p>
                        <p className="text-3xl font-bold text-center tracking-widest text-purple-600">
                            {currentRoom.code}
                        </p>
                        <p className="text-xs text-gray-500 text-center mt-2">
                            Share this code with your friend
                        </p>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3 text-gray-700">Players</h2>
                        {currentRoom.players.map((player, index) => (
                            <div
                                key={player.id}
                                className="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded-lg"
                            >
                                <span className="font-medium text-gray-800">{player.name}</span>
                                <span className="text-sm text-gray-500">
                                    {player.isHost && '👑 Host'}
                                    {player.id === socket?.id && ' (You)'}
                                </span>
                            </div>
                        ))}
                        {!isFull && (
                            <div className="p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <span className="text-gray-400">Waiting for player 2...</span>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {isHost && (
                        <button
                            onClick={startGame}
                            disabled={!isFull}
                            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${isFull
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                                    : 'bg-gray-300 cursor-not-allowed'
                                }`}
                        >
                            {isFull ? 'Start Game' : 'Waiting for Players...'}
                        </button>
                    )}

                    {!isHost && (
                        <div className="text-center text-gray-600">
                            <p className="text-sm">Waiting for host to start the game...</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Mind Reader Duo
                </h1>
                <p className="text-center text-gray-600 mb-8">Multiplayer Mode</p>

                {mode === 'select' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Name
                            </label>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    if (playerName.trim()) {
                                        setMode('create');
                                        createRoom();
                                    } else {
                                        setError('Please enter your name');
                                    }
                                }}
                                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                Create New Room
                            </button>

                            <button
                                onClick={() => setMode('join')}
                                className="w-full py-3 px-6 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all"
                            >
                                Join Existing Room
                            </button>
                        </div>
                    </div>
                )}

                {mode === 'join' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Name
                            </label>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Room Code
                            </label>
                            <input
                                type="text"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                placeholder="Enter 6-character code"
                                maxLength={6}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-center text-2xl tracking-widest font-bold"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={joinRoom}
                                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                Join Room
                            </button>

                            <button
                                onClick={() => {
                                    setMode('select');
                                    setRoomCode('');
                                    setError('');
                                }}
                                className="w-full py-3 px-6 bg-white text-gray-600 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LobbyScreen;

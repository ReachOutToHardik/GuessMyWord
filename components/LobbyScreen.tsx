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
                history: [],
                isSolved: false
            },
            roomCode: currentRoom.code
        };

        socket?.emit('start_game', { roomCode: currentRoom.code, initialGameState });
    };

    if (connectionStatus !== ConnectionStatus.CONNECTED) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-game-bg text-white">
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl p-8 rounded-2xl max-w-md w-full text-center animate-float">
                    <div className="w-20 h-20 bg-gradient-to-br from-game-primary to-game-secondary rounded-full mx-auto mb-6 shadow-2xl shadow-game-primary/30 flex items-center justify-center">
                        <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Connecting...</h2>
                    <p className="text-slate-400">Establishing secure link to game server</p>
                </div>
            </div>
        );
    }

    if (currentRoom) {
        const isHost = currentRoom.players.find(p => p.id === socket?.id)?.isHost;
        const isFull = currentRoom.players.length === 2;

        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-game-bg relative overflow-hidden">
                {/* Background blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-game-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-game-secondary/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
                    {/* Left Panel: Room Info */}
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-6">
                        <div>
                            <p className="text-slate-400 text-sm uppercase font-bold tracking-wider mb-2">Room Code</p>
                            <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-game-primary to-game-secondary tracking-widest">{currentRoom.code}</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl text-sm text-slate-300 max-w-xs">
                            <p>Share this code with your friend to start playing!</p>
                        </div>
                    </div>

                    {/* Right Panel: Players */}
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl p-8 rounded-3xl flex flex-col">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-game-primary/20 text-game-primary flex items-center justify-center mr-3">👥</span>
                            Players ({currentRoom.players.length}/2)
                        </h2>

                        <div className="space-y-4 flex-1">
                            {currentRoom.players.map((player) => (
                                <div key={player.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-game-primary to-game-secondary flex items-center justify-center text-white font-bold">
                                            {player.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{player.name}</p>
                                            <p className="text-xs text-slate-400">{player.isHost ? 'Host' : 'Player'}</p>
                                        </div>
                                    </div>
                                    {player.id === socket?.id && <span className="text-xs bg-game-primary/20 text-game-primary px-2 py-1 rounded">YOU</span>}
                                </div>
                            ))}

                            {!isFull && (
                                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 animate-pulse-slow">
                                    <p>Waiting for Player 2...</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            {isHost ? (
                                <button
                                    onClick={startGame}
                                    disabled={!isFull}
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${isFull ? 'bg-gradient-to-r from-game-primary to-game-secondary text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-game-primary/25 hover:scale-[1.02] active:scale-95 transition-all duration-300' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    {isFull ? 'Start Game' : 'Waiting for Player...'}
                                </button>
                            ) : (
                                <div className="text-center p-4 bg-slate-800/50 rounded-xl">
                                    <p className="text-slate-400 animate-pulse">Waiting for host to start...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-game-bg relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-game-primary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-game-secondary/20 rounded-full blur-[100px] animate-pulse-slow"></div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl p-8 md:p-12 rounded-3xl max-w-5xl w-full z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Intro Side */}
                <div className="text-center md:text-left space-y-6">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-game-primary/20 text-game-primary text-sm font-bold border border-game-primary/20">
                        Multiplayer Beta
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                        Guess<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-game-primary to-game-secondary">My</span><br />
                        Word
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md mx-auto md:mx-0">
                        Challenge your friends in this real-time word guessing game. Connect securely and play instantly!
                    </p>
                </div>

                {/* Action Side */}
                <div className="bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-white/5 shadow-inner">
                    <h2 className="text-xl font-bold text-white mb-6">Get Started</h2>

                    <div className="space-y-4 mb-8">
                        <label className="block text-sm font-medium text-slate-400">Your Nickname</label>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="e.g. WordMaster"
                            className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-game-primary/50 text-white placeholder-slate-500 transition-all w-full"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {mode === 'select' && (
                            <>
                                <button
                                    onClick={() => {
                                        if (playerName.trim()) {
                                            setMode('create');
                                            createRoom();
                                        } else {
                                            setError('Enter a name first!');
                                        }
                                    }}
                                    className="bg-gradient-to-r from-game-primary to-game-secondary text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-game-primary/25 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                                >
                                    Create New Room
                                </button>
                                <button
                                    onClick={() => setMode('join')}
                                    className="bg-slate-800 text-slate-200 font-bold py-3 px-6 rounded-xl border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all duration-300"
                                >
                                    Join Existing Room
                                </button>
                            </>
                        )}

                        {mode === 'join' && (
                            <div className="space-y-4 animate-slide-up">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Room Code</label>
                                    <input
                                        type="text"
                                        value={roomCode}
                                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                        placeholder="XYZ123"
                                        maxLength={6}
                                        className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-game-primary/50 text-white placeholder-slate-500 transition-all w-full text-center text-2xl tracking-widest uppercase font-mono"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setMode('select')} className="bg-slate-800 text-slate-200 font-bold py-3 px-6 rounded-xl border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all duration-300">Back</button>
                                    <button onClick={joinRoom} className="bg-gradient-to-r from-game-primary to-game-secondary text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-game-primary/25 hover:scale-[1.02] active:scale-95 transition-all duration-300">Join</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center animate-shake">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LobbyScreen;

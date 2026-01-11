
import React, { useState, useEffect } from 'react';
import { GamePhase, GameState, TurnData, ConnectionStatus } from './types';
import { getRandomWords } from './services/geminiService';
import { SocketProvider, useSocket } from './context/SocketContext';
import LobbyScreen from './components/LobbyScreen';
import PickingWordScreen from './components/PickingWordScreen';
import GameBoard from './components/GameBoard';
import ResultScreen from './components/ResultScreen';
import GameOverScreen from './components/GameOverScreen';

const MAX_ROUNDS = 3;

const GameContent: React.FC = () => {
  const { socket, connectionStatus } = useSocket();
  const [gameState, setGameState] = useState<GameState>({
    players: [
      { name: 'Player 1', totalWins: 0, totalQuestionsAsked: 0, totalGuesses: 0 },
      { name: 'Player 2', totalWins: 0, totalQuestionsAsked: 0, totalGuesses: 0 }
    ],
    currentRound: 1,
    maxRounds: MAX_ROUNDS,
    phase: GamePhase.LOBBY,
    currentTurn: {
      pickerIndex: 0,
      guesserIndex: 1,
      selectedWord: '',
      questions: [],
      guesses: [],
      isSolved: false
    }
  });
  const [myPlayerIndex, setMyPlayerIndex] = useState<number>(0);
  const [currentRoomCode, setCurrentRoomCode] = useState<string>('');
  const [pendingQuestion, setPendingQuestion] = useState<string>('');

  useEffect(() => {
    if (!socket) return;

    // Listen for game state updates from server
    socket.on('word_confirmed', ({ word }) => {
      console.log('Word confirmed:', word);
      setGameState(prev => ({
        ...prev,
        currentTurn: { ...prev.currentTurn, selectedWord: word },
        phase: GamePhase.QUESTIONING
      }));
    });

    socket.on('word_selected_notification', () => {
      console.log('Word selected notification received');
      setGameState(prev => ({
        ...prev,
        phase: GamePhase.QUESTIONING
      }));
    });

    socket.on('question_asked', ({ question }) => {
      console.log('Question received from server:', question);
      setPendingQuestion(question);
    });

    socket.on('answer_provided', ({ question, answer, gameState: serverGameState }) => {
      console.log('Answer provided:', answer, 'for question:', question);
      setPendingQuestion(''); // Clear pending question after answer
      if (serverGameState) {
        setGameState(prev => ({
          ...prev,
          players: serverGameState.players,
          currentTurn: {
            ...prev.currentTurn,
            questions: serverGameState.currentTurn.questions
          }
        }));
      }
    });

    socket.on('guess_made', ({ guess, gameState: serverGameState }) => {
      if (serverGameState) {
        setGameState(serverGameState);
      }
    });

    socket.on('turn_changed', ({ gameState: serverGameState }) => {
      if (serverGameState) {
        setGameState(serverGameState);
      }
    });

    return () => {
      socket.off('word_confirmed');
      socket.off('word_selected_notification');
      socket.off('question_asked');
      socket.off('answer_provided');
      socket.off('guess_made');
      socket.off('turn_changed');
    };
  }, [socket]);

  const handleGameStart = (roomCode: string, playerIndex: number, playerNames: string[]) => {
    setCurrentRoomCode(roomCode);
    setMyPlayerIndex(playerIndex);
    setGameState(prev => ({
      ...prev,
      players: playerNames.map(name => ({
        name,
        totalWins: 0,
        totalQuestionsAsked: 0,
        totalGuesses: 0
      })),
      phase: GamePhase.PICKING_WORD,
      roomCode
    }));
  };

  const selectWord = (word: string) => {
    socket?.emit('word_selected', { roomCode: currentRoomCode, word });
  };

  const askQuestion = (question: string) => {
    console.log('Asking question:', question, 'Room:', currentRoomCode);
    socket?.emit('ask_question', { roomCode: currentRoomCode, question });
  };

  const provideAnswer = (answer: 'yes' | 'no', question: string) => {
    socket?.emit('provide_answer', { roomCode: currentRoomCode, question, answer });
  };

  const makeGuess = (guess: string) => {
    socket?.emit('make_guess', { roomCode: currentRoomCode, guess });
  };

  const nextTurn = () => {
    socket?.emit('next_turn', { roomCode: currentRoomCode });
  };

  const isPicker = myPlayerIndex === gameState.currentTurn.pickerIndex;
  const isGuesser = myPlayerIndex === gameState.currentTurn.guesserIndex;

  const connected = connectionStatus === ConnectionStatus.CONNECTED;

  return (
    <div className="min-h-screen bg-game-bg font-sans text-white relative">
      {/* Connection Status Indicator */}
      {currentRoomCode && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/10 flex items-center space-x-3 transition-all hover:bg-slate-800">
          <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-game-success shadow-[0_0_10px_theme(colors.game.success)]' : 'bg-game-error'}`}></div>
          <span className="text-xs font-bold tracking-wider text-slate-300">ROOM: <span className="text-white">{currentRoomCode}</span></span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="min-h-screen">
        {gameState.phase === GamePhase.LOBBY && (
          <LobbyScreen onGameStart={handleGameStart} />
        )}

        {gameState.phase !== GamePhase.LOBBY && (
          <div className="container mx-auto px-4 py-8 md:py-12 min-h-screen flex flex-col justify-center">

            {gameState.phase === GamePhase.PICKING_WORD && (
              <div className="flex justify-center w-full">
                {isPicker ? (
                  <PickingWordScreen
                    pickerName={gameState.players[gameState.currentTurn.pickerIndex].name}
                    onSelect={selectWord}
                  />
                ) : (
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl p-12 rounded-3xl max-w-lg w-full text-center animate-pulse-slow">
                    <div className="w-24 h-24 bg-gradient-to-br from-game-primary/20 to-game-secondary/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <span className="text-4xl">🤔</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {gameState.players[gameState.currentTurn.pickerIndex].name} is choosing...
                    </h2>
                    <p className="text-slate-400">
                      They are selecting a secret word for the round. Get ready to guess!
                    </p>
                  </div>
                )}
              </div>
            )}

            {gameState.phase === GamePhase.QUESTIONING && (
              <GameBoard
                gameState={gameState}
                onAskQuestion={askQuestion}
                onProvideAnswer={provideAnswer}
                onMakeGuess={makeGuess}
                myPlayerIndex={myPlayerIndex}
                pendingQuestion={pendingQuestion}
              />
            )}

            {gameState.phase === GamePhase.REVEALING_RESULT && (
              <ResultScreen
                turnData={gameState.currentTurn}
                guesserName={gameState.players[gameState.currentTurn.guesserIndex].name}
                onContinue={nextTurn}
              />
            )}

            {gameState.phase === GamePhase.GAME_OVER && (
              <GameOverScreen
                players={gameState.players}
                onRestart={() => window.location.reload()}
              />
            )}
          </div>
        )}
      </div>

      {/* Player role indicator */}
      {gameState.phase !== GamePhase.LOBBY && gameState.phase !== GamePhase.GAME_OVER && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <span className={`px-6 py-3 rounded-full text-sm font-bold shadow-xl border border-white/10 backdrop-blur-md ${isPicker
            ? 'bg-slate-900/90 text-game-accent shadow-game-accent/20'
            : 'bg-slate-900/90 text-game-primary shadow-game-primary/20'
            }`}>
            You are: {isPicker ? 'THE PICKER' : 'THE GUESSER'}
          </span>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SocketProvider>
      <GameContent />
    </SocketProvider>
  );
};

export default App;

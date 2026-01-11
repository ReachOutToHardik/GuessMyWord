
import React, { useState, useEffect } from 'react';
import { GamePhase, GameState, TurnData } from './types';
import { getRandomWords } from './services/geminiService';
import { SocketProvider, useSocket } from './context/SocketContext';
import LobbyScreen from './components/LobbyScreen';
import PickingWordScreen from './components/PickingWordScreen';
import GameBoard from './components/GameBoard';
import ResultScreen from './components/ResultScreen';
import GameOverScreen from './components/GameOverScreen';

const MAX_ROUNDS = 3;

const GameContent: React.FC = () => {
  const { socket } = useSocket();
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
      {/* Connection Status Indicator */}
      {currentRoomCode && (
        <div className="fixed top-4 right-4 bg-slate-800/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">Room: {currentRoomCode}</span>
          </div>
        </div>
      )}

      {gameState.phase === GamePhase.LOBBY && (
        <LobbyScreen onGameStart={handleGameStart} />
      )}

      {gameState.phase === GamePhase.PICKING_WORD && (
        <>
          {isPicker ? (
            <PickingWordScreen
              pickerName={gameState.players[gameState.currentTurn.pickerIndex].name}
              onSelect={selectWord}
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Waiting for {gameState.players[gameState.currentTurn.pickerIndex].name}
                </h2>
                <p className="text-gray-600">
                  They are selecting a word for you to guess...
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {gameState.phase === GamePhase.QUESTIONING && (
        <div className="w-full">
          <GameBoard
            gameState={gameState}
            onAskQuestion={askQuestion}
            onProvideAnswer={provideAnswer}
            onMakeGuess={makeGuess}
            myPlayerIndex={myPlayerIndex}
            pendingQuestion={pendingQuestion}
          />

          {/* Player role indicator */}
          <div className="mt-4 text-center">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${isPicker ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
              }`}>
              You are: {isPicker ? 'Picker' : 'Guesser'}
            </span>
          </div>
        </div>
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

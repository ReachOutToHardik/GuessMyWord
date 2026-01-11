
import React, { useState, useRef, useEffect } from 'react';
import { GameState } from '../types';

interface GameBoardProps {
  gameState: GameState;
  onAskQuestion: (q: string) => void;
  onProvideAnswer: (a: 'yes' | 'no', q: string) => void;
  onMakeGuess: (g: string) => void;
  myPlayerIndex?: number;
  pendingQuestion?: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onProvideAnswer, onMakeGuess, onAskQuestion, myPlayerIndex, pendingQuestion = '' }) => {
  const [currentQuestionInput, setCurrentQuestionInput] = useState('');
  const [currentGuessInput, setCurrentGuessInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const picker = gameState.players[gameState.currentTurn.pickerIndex];
  const guesser = gameState.players[gameState.currentTurn.guesserIndex];

  const isPicker = myPlayerIndex === gameState.currentTurn.pickerIndex;
  const isGuesser = myPlayerIndex === gameState.currentTurn.guesserIndex;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameState.currentTurn.questions]);

  const handleAsk = () => {
    if (currentQuestionInput.trim()) {
      onAskQuestion(currentQuestionInput);
      setCurrentQuestionInput('');
    }
  };

  const handleAnswer = (answer: 'yes' | 'no') => {
    if (pendingQuestion) {
      onProvideAnswer(answer, pendingQuestion);
    }
  };

  const handleGuess = () => {
    if (currentGuessInput.trim()) {
      onMakeGuess(currentGuessInput);
      setCurrentGuessInput('');
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="flex justify-between items-center mb-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-bold">Round {gameState.currentRound}/{gameState.maxRounds}</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Turn</p>
          <p className="text-slate-200 font-semibold">{guesser.name} guessing from {picker.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: History */}
        <div className="lg:col-span-2 flex flex-col h-[500px] card-glass rounded-3xl overflow-hidden">
          <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-slate-300">Conversation History</h3>
            <span className="text-xs text-slate-500 font-mono">{gameState.currentTurn.questions.length} Questions Asked</span>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
            {gameState.currentTurn.questions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>No questions yet. Start asking!</p>
              </div>
            ) : (
              gameState.currentTurn.questions.map((q, idx) => (
                <div key={idx} className="space-y-2 animate-in fade-in slide-in-from-left duration-300">
                  <div className="flex justify-end">
                    <div className="bg-blue-600/20 text-blue-100 px-4 py-2 rounded-2xl rounded-tr-none max-w-[80%] border border-blue-500/30">
                      <p className="text-xs font-bold text-blue-400 mb-1">{guesser.name}</p>
                      <p>{q.question}</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-slate-700/50 text-slate-100 px-4 py-2 rounded-2xl rounded-tl-none max-w-[80%] border border-slate-600">
                      <p className="text-xs font-bold text-slate-400 mb-1">{picker.name}</p>
                      <p className={`font-bold uppercase ${q.answer === 'yes' ? 'text-green-400' : 'text-red-400'}`}>
                        {q.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Question Input - Only show for guesser */}
          <div className="p-4 bg-slate-800/50 border-t border-slate-700">
            {isGuesser && !pendingQuestion && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder={`Ask ${picker.name} something...`}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentQuestionInput}
                  onChange={(e) => setCurrentQuestionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                />
                <button
                  onClick={handleAsk}
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl font-bold transition-all shadow-md active:scale-95"
                >
                  Ask
                </button>
              </div>
            )}

            {isGuesser && pendingQuestion && (
              <div className="animate-pulse flex flex-col items-center space-y-3 py-2">
                <p className="text-sm font-bold text-blue-400">Waiting for {picker.name}'s answer...</p>
              </div>
            )}

            {isPicker && pendingQuestion && (
              <div className="flex flex-col items-center space-y-3 py-2">
                <p className="text-sm font-bold text-green-400">{guesser.name} asked: "{pendingQuestion}"</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleAnswer('yes')}
                    className="bg-green-600 hover:bg-green-500 px-8 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleAnswer('no')}
                    className="bg-red-600 hover:bg-red-500 px-8 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95"
                  >
                    No
                  </button>
                </div>
              </div>
            )}

            {isPicker && !pendingQuestion && (
              <div className="text-center text-slate-400 text-sm py-2">
                Waiting for {guesser.name} to ask a question...
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Guessing & Info */}
        <div className="space-y-6">
          {/* Guess Input - Only show for guesser */}
          {isGuesser && (
            <div className="card-glass p-6 rounded-3xl shadow-xl">
              <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center">
                <span className="mr-2">💡</span> Guess the Word
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Careful! You only get 2 tries per round.
                <span className="block mt-1 font-bold text-blue-400">Tries left: {2 - gameState.currentTurn.guesses.length}</span>
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Type your guess..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={currentGuessInput}
                  onChange={(e) => setCurrentGuessInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                />
                <button
                  onClick={handleGuess}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
                >
                  Submit Guess
                </button>
              </div>
              {gameState.currentTurn.guesses.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Previous Guesses</p>
                  <div className="flex flex-wrap gap-2">
                    {gameState.currentTurn.guesses.map((g, i) => (
                      <span key={i} className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-sm line-through">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Secret word - Only show for picker */}
          {isPicker && (
            <div className="card-glass p-6 rounded-3xl border-blue-500/20">
              <h4 className="font-bold text-blue-400 mb-2">Your Secret Word</h4>
              <p className="text-xs text-slate-500 mb-3 italic">Don't let {guesser.name} see this!</p>
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border-2 border-blue-500/30">
                <span className="text-2xl font-bold text-blue-400">{gameState.currentTurn.selectedWord}</span>
              </div>
            </div>
          )}

          {/* Info for guesser */}
          {isGuesser && (
            <div className="card-glass p-6 rounded-3xl border-purple-500/20">
              <h4 className="font-bold text-purple-400 mb-2">How to Play</h4>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>• Ask yes/no questions</li>
                <li>• Use clues to narrow down</li>
                <li>• Guess when you're ready</li>
                <li>• You have 2 attempts!</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;


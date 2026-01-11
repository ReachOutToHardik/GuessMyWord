
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
    <div className="w-full max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 animate-slide-up">

      {/* Left Panel: Game Info & Status (Desktop) / Top Bar (Mobile) */}
      <div className="md:w-1/3 flex flex-col gap-4">
        {/* Round Info Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl p-6 rounded-2xl flex justify-between items-center bg-game-surface">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Round</p>
            <p className="text-2xl font-bold text-white">{gameState.currentRound} <span className="text-slate-500 text-lg">/ {gameState.maxRounds}</span></p>
          </div>
          <div className="text-right">
            <div className="inline-block px-3 py-1 bg-game-primary/20 rounded-lg text-game-primary text-xs font-bold mb-1">
              {isPicker ? 'YOU ARE PICKER' : 'YOU ARE GUESSER'}
            </div>
            <p className="text-slate-300 text-sm">
              vs <span className="font-bold text-white">{isPicker ? guesser.name : picker.name}</span>
            </p>
          </div>
        </div>

        {/* Secret Word Card (Picker Only) */}
        {isPicker && (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl p-6 rounded-2xl border-l-4 border-game-accent animate-pulse-slow">
            <p className="text-game-accent text-xs font-bold uppercase tracking-wider mb-2">SECRET WORD</p>
            <p className="text-3xl font-bold text-white tracking-wide">{gameState.currentTurn.selectedWord}</p>
            <p className="text-slate-400 text-xs mt-2">Shh! Don't tell {guesser.name}.</p>
          </div>
        )}

        {/* Guessing Card (Guesser Only) - Desktop */}
        {isGuesser && (
          <div className="hidden md:block bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl p-6 rounded-2xl">
            <h3 className="font-bold text-white mb-4 flex items-center">
              <span className="mr-2">💡</span> Make a Guess
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={currentGuessInput}
                  onChange={(e) => setCurrentGuessInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                  placeholder="Is the word..."
                  className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-game-primary/50 text-white placeholder-slate-500 transition-all w-full"
                />
              </div>
              <button onClick={handleGuess} className="bg-gradient-to-r from-game-primary to-game-secondary text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-game-primary/25 hover:scale-[1.02] active:scale-95 transition-all duration-300 w-full">Submit Guess</button>
              <div className="flex justify-between text-sm text-slate-400 pt-2">
                <span>Attempts remaining:</span>
                <span className="font-bold text-white">{2 - gameState.currentTurn.guesses.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel: Chat/History */}
      <div className="md:w-2/3 bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-4 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-200">Investigation Log</h3>
          <div className="text-xs text-slate-500">{gameState.currentTurn.questions.length} questions asked</div>
        </div>

        {/* Messages Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
          {(() => {
            const history = (gameState.currentTurn.history && gameState.currentTurn.history.length > 0)
              ? gameState.currentTurn.history
              : gameState.currentTurn.questions.map(q => ({
                type: 'question' as const,
                content: q.question,
                outcome: q.answer,
                timestamp: 0
              }));

            if (history.length === 0) {
              return (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl">💬</div>
                  <p>No questions yet. Start the investigation!</p>
                </div>
              );
            }

            return history.map((item, idx) => {
              if (item.type === 'question') {
                return (
                  <div key={idx} className="space-y-2 animate-slide-up">
                    {/* Question */}
                    <div className="flex justify-end">
                      <div className="bg-game-primary/20 border border-game-primary/20 text-slate-200 px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%]">
                        <p className="text-[10px] font-bold text-game-primary uppercase mb-1">{guesser.name}</p>
                        <p>{item.content}</p>
                      </div>
                    </div>
                    {/* Answer */}
                    <div className="flex justify-start">
                      <div className={`px-5 py-3 rounded-2xl rounded-tl-sm max-w-[85%] border ${item.outcome === 'yes' ? 'bg-game-success/20 border-game-success/20 text-white' : 'bg-game-error/20 border-game-error/20 text-white'}`}>
                        <p className={`text-[10px] font-bold uppercase mb-1 ${item.outcome === 'yes' ? 'text-game-success' : 'text-game-error'}`}>{picker.name}</p>
                        <p className="font-bold uppercase tracking-wide">{item.outcome}</p>
                      </div>
                    </div>
                  </div>
                );
              } else {
                const isCorrect = item.outcome === 'correct';
                return (
                  <div key={idx} className="flex justify-center animate-slide-up py-4">
                    <div className={`w-full max-w-[90%] p-4 rounded-xl border-l-4 ${isCorrect ? 'bg-game-success/10 border-game-success shadow-lg shadow-game-success/10' : 'bg-game-error/10 border-game-error'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isCorrect ? 'text-game-success' : 'text-game-error'}`}>
                          {isGuesser ? 'YOU GUESSED' : `${guesser.name} GUESSED`}
                        </span>
                        {item.timestamp > 0 && (
                          <span className="text-[10px] text-slate-500 opacity-60">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-xl font-bold text-white text-center py-1">"{item.content}"</p>
                      {isCorrect ? (
                        <p className="text-center text-sm font-bold text-game-success mt-2">🎉 CORRECT WORD!</p>
                      ) : (
                        <p className="text-center text-xs text-game-error mt-2">❌ Incorrect Guess</p>
                      )}
                    </div>
                  </div>
                );
              }
            });
          })()}

          {/* Pending Question Indicator */}
          {pendingQuestion && !isPicker && (
            <div className="flex justify-end opacity-50">
              <div className="bg-game-primary/10 border border-game-primary/10 text-slate-400 px-5 py-3 rounded-2xl rounded-tr-sm">
                <p className="text-xs italic">Sending question...</p>
              </div>
            </div>
          )}

          <div className="h-4"></div> {/* Spacer */}
        </div>

        {/* Input Area (Sticky Bottom) */}
        <div className="p-4 bg-slate-900/80 backdrop-blur-md border-t border-white/5">
          {isGuesser && !pendingQuestion && (
            <div className="flex gap-2">
              <input
                type="text"
                value={currentQuestionInput}
                onChange={(e) => setCurrentQuestionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="Ask a Yes/No question..."
                className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-game-primary/50 text-white placeholder-slate-500 transition-all w-full shadow-lg"
                autoFocus
              />
              <button onClick={handleAsk} className="bg-gradient-to-r from-game-primary to-game-secondary text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-game-primary/25 hover:scale-[1.02] active:scale-95 transition-all duration-300 aspect-square flex items-center justify-center p-0 w-12 rounded-xl">
                ➤
              </button>
            </div>
          )}

          {isGuesser && pendingQuestion && (
            <div className="text-center py-3 text-slate-400 animate-pulse">
              Waiting for answer...
            </div>
          )}

          {isPicker && pendingQuestion && (
            <div className="space-y-3">
              <div className="bg-slate-800 p-4 rounded-xl border border-white/10 mb-3">
                <span className="text-xs text-game-primary font-bold uppercase block mb-1">Incoming Question</span>
                <p className="text-lg font-medium text-white">"{pendingQuestion}"</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleAnswer('yes')} className="bg-game-success hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 active:scale-95 transition-all">
                  YES
                </button>
                <button onClick={() => handleAnswer('no')} className="bg-game-error hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                  NO
                </button>
              </div>
            </div>
          )}

          {isPicker && !pendingQuestion && (
            <div className="text-center py-3 text-slate-500 italic">
              Waiting for question...
            </div>
          )}
        </div>
      </div>

      {/* Mobile-only Guess Input (Bottom Sheet style) */}
      {isGuesser && (
        <div className="md:hidden mt-4">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl p-4 rounded-2xl">
            <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase">Have a guess?</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentGuessInput}
                onChange={(e) => setCurrentGuessInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                placeholder="Type secret word..."
                className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-game-primary/50 text-white placeholder-slate-500 transition-all w-full text-sm"
              />
              <button onClick={handleGuess} className="bg-slate-800 text-slate-200 font-bold py-3 px-6 rounded-xl border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all duration-300 whitespace-nowrap px-4 bg-white/10 border-white/20">Guess</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;

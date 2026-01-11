
import React from 'react';
import { TurnData } from '../types';

interface ResultScreenProps {
  turnData: TurnData;
  guesserName: string;
  onContinue: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ turnData, guesserName, onContinue }) => {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl p-10 md:p-14 rounded-3xl w-full max-w-xl text-center shadow-2xl space-y-10 animate-slide-up">
      <div className="space-y-6">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${turnData.isSolved ? 'bg-game-success/20 animate-bounce' : 'bg-game-error/20 animate-pulse'}`}>
          <span className="text-6xl">{turnData.isSolved ? '🎉' : '❌'}</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-white">
            {turnData.isSolved ? 'Round Won!' : 'Round Lost'}
          </h2>
          <p className="text-slate-400 text-lg">
            {turnData.isSolved
              ? `${guesserName} cracked the code!`
              : `${guesserName} ran out of attempts.`}
          </p>
        </div>
      </div>

      <div className="bg-slate-900/50 p-8 rounded-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-game-primary to-game-secondary"></div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">The Secret Word Was</p>
        <p className="text-5xl font-black text-white tracking-tight">{turnData.selectedWord}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl p-4 rounded-xl flex flex-col justify-center">
          <p className="text-3xl font-bold text-game-primary">{turnData.questions.length}</p>
          <p className="text-xs text-slate-400 font-bold uppercase">Questions</p>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl p-4 rounded-xl flex flex-col justify-center">
          <p className="text-3xl font-bold text-game-secondary">{turnData.guesses.length}</p>
          <p className="text-xs text-slate-400 font-bold uppercase">Guesses</p>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="bg-gradient-to-r from-game-primary to-game-secondary text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-game-primary/25 hover:scale-[1.02] active:scale-95 transition-all duration-300 w-full text-lg py-4"
      >
        Start Next Round
      </button>
    </div>
  );
};

export default ResultScreen;

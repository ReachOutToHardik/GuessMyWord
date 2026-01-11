
import React from 'react';
import { TurnData } from '../types';

interface ResultScreenProps {
  turnData: TurnData;
  guesserName: string;
  onContinue: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ turnData, guesserName, onContinue }) => {
  return (
    <div className="card-glass p-12 rounded-3xl w-full max-w-xl text-center shadow-2xl space-y-8 animate-in zoom-in duration-500">
      <div className="space-y-4">
        <div className={`text-6xl ${turnData.isSolved ? 'text-green-500' : 'text-red-500'} animate-bounce`}>
          {turnData.isSolved ? '🎉 SUCCESS!' : '❌ OUT OF TRIES'}
        </div>
        <h2 className="text-3xl font-bold">
          {turnData.isSolved 
            ? `${guesserName} got it!` 
            : `${guesserName} couldn't figure it out.`}
        </h2>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 space-y-4">
        <div>
          <p className="text-slate-400 text-sm uppercase font-bold tracking-widest">The Secret Word was</p>
          <p className="text-4xl font-extrabold text-white">{turnData.selectedWord}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
          <div>
            <p className="text-2xl font-bold text-blue-400">{turnData.questions.length}</p>
            <p className="text-xs text-slate-500">Questions Asked</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">{turnData.guesses.length}</p>
            <p className="text-xs text-slate-500">Guesses Made</p>
          </div>
        </div>
      </div>

      <button 
        onClick={onContinue}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold py-5 rounded-2xl transition-all shadow-xl active:scale-95"
      >
        Continue to Next Round
      </button>
    </div>
  );
};

export default ResultScreen;

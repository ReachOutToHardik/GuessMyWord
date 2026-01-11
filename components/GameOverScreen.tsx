
import React from 'react';
import { PlayerStats } from '../types';

interface GameOverScreenProps {
  players: PlayerStats[];
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ players, onRestart }) => {
  const winner = players[0].totalWins > players[1].totalWins 
    ? players[0] 
    : players[1].totalWins > players[0].totalWins 
      ? players[1] 
      : null;

  return (
    <div className="card-glass p-8 md:p-12 rounded-3xl w-full max-w-2xl text-center shadow-2xl space-y-10 animate-in fade-in duration-1000">
      <div className="space-y-4">
        <h1 className="text-5xl font-black text-blue-400 tracking-tighter">GAME OVER</h1>
        {winner ? (
          <div className="space-y-2">
            <p className="text-2xl text-slate-300">The Mind Reader Champion is</p>
            <p className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              {winner.name}
            </p>
          </div>
        ) : (
          <p className="text-4xl font-bold text-slate-300">It's a Tie! 🤝</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {players.map((p, idx) => (
          <div key={idx} className={`p-6 rounded-2xl border-2 ${winner === p ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800/30'}`}>
            <h3 className="text-2xl font-bold mb-4">{p.name}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Rounds Won</span>
                <span className="font-bold text-green-400">{p.totalWins}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Questions</span>
                <span className="font-bold text-blue-400">{p.totalQuestionsAsked}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Average Questions/Round</span>
                <span className="font-bold text-slate-200">
                  {p.totalQuestionsAsked > 0 ? (p.totalQuestionsAsked / 3).toFixed(1) : 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <button 
          onClick={onRestart}
          className="w-full bg-white text-slate-900 text-xl font-black py-5 rounded-2xl transition-all shadow-xl hover:bg-blue-50 active:scale-95"
        >
          PLAY AGAIN
        </button>
        <p className="text-slate-500 text-sm italic">Thanks for playing Mind Reader Duo!</p>
      </div>
    </div>
  );
};

export default GameOverScreen;

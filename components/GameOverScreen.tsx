
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
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl p-8 md:p-12 rounded-3xl w-full max-w-4xl text-center shadow-2xl space-y-12 animate-slide-up">
      <div className="space-y-4 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-game-primary/30 rounded-full blur-3xl"></div>
        <h1 className="relative text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter">GAME OVER</h1>

        {winner ? (
          <div className="animate-bounce-slow">
            <span className="text-4xl">👑</span>
            <p className="text-xl text-game-primary font-bold uppercase tracking-widest mt-2">{winner.name} Wins!</p>
          </div>
        ) : (
          <p className="text-2xl font-bold text-slate-300">It's a Tie!</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {players.map((p, idx) => {
          const isWinner = winner === p;
          return (
            <div key={idx} className={`relative p-8 rounded-3xl border transition-all duration-300 ${isWinner
              ? 'bg-gradient-to-br from-game-primary/20 to-game-secondary/10 border-game-primary/50 shadow-2xl shadow-game-primary/10 scale-105 z-10'
              : 'bg-slate-800/40 border-white/5 grayscale-[0.5]'
              }`}>
              {isWinner && <div className="absolute -top-4 -right-4 bg-game-primary text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">WINNER</div>}

              <h3 className="text-3xl font-black text-white mb-6">{p.name}</h3>

              <div className="space-y-4">
                <div className="bg-slate-900/50 p-4 rounded-xl flex justify-between items-center">
                  <span className="text-slate-400 text-sm font-bold uppercase">Rounds Won</span>
                  <span className={`text-2xl font-black ${isWinner ? 'text-game-success' : 'text-slate-200'}`}>{p.totalWins}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-3 rounded-xl">
                    <span className="block text-slate-500 text-[10px] font-bold uppercase">Details</span>
                    <span className="block text-lg font-bold text-white">{p.totalQuestionsAsked} <span className="text-xs text-slate-600">Qs</span></span>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-xl">
                    <span className="block text-slate-500 text-[10px] font-bold uppercase">Guesses</span>
                    <span className="block text-lg font-bold text-white">{p.totalGuesses}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-8 border-t border-white/5 space-y-4 max-w-md mx-auto">
        <button
          onClick={onRestart}
          className="bg-gradient-to-r from-game-primary to-game-secondary text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-game-primary/25 hover:scale-[1.02] active:scale-95 transition-all duration-300 w-full text-xl py-5 shadow-game-primary/30"
        >
          PLAY AGAIN
        </button>
        <p className="text-slate-500 text-sm">Thanks for matching minds!</p>
      </div>
    </div>
  );
};

export default GameOverScreen;

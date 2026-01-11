
import React, { useState } from 'react';

interface StartScreenProps {
  onStart: (p1: string, p2: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');

  return (
    <div className="card-glass p-8 rounded-3xl w-full max-w-md text-center shadow-2xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-blue-400">Mind Reader Duo</h1>
        <p className="text-slate-400">Can you guess what they're thinking?</p>
      </div>

      <div className="space-y-4">
        <div className="text-left space-y-2">
          <label className="text-sm font-semibold text-slate-300">Player 1 Name</label>
          <input 
            type="text" 
            placeholder="e.g. Alice"
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={p1}
            onChange={(e) => setP1(e.target.value)}
          />
        </div>
        <div className="text-left space-y-2">
          <label className="text-sm font-semibold text-slate-300">Player 2 Name</label>
          <input 
            type="text" 
            placeholder="e.g. Bob"
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={p2}
            onChange={(e) => setP2(e.target.value)}
          />
        </div>
      </div>

      <button 
        onClick={() => onStart(p1, p2)}
        disabled={!p1.trim() || !p2.trim()}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95"
      >
        Start Game
      </button>

      <div className="bg-slate-800/30 p-4 rounded-xl text-left">
        <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Rules</h3>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• 3 Rounds total</li>
          <li>• One picks a word, the other asks questions</li>
          <li>• Only Yes/No answers allowed</li>
          <li>• Guesser gets 2 tries to identify the word</li>
        </ul>
      </div>
    </div>
  );
};

export default StartScreen;

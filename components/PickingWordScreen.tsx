
import React, { useState, useEffect } from 'react';
import { getRandomWords } from '../services/geminiService';

interface PickingWordScreenProps {
  pickerName: string;
  onSelect: (word: string) => void;
}

const PickingWordScreen: React.FC<PickingWordScreenProps> = ({ pickerName, onSelect }) => {
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true);
      const fetched = await getRandomWords();
      setWords(fetched);
      setLoading(false);
    };
    fetchWords();
  }, []);

  if (!ready) {
    return (
      <div className="card-glass p-12 rounded-3xl text-center space-y-6">
        <h2 className="text-3xl font-bold text-blue-400">Pass to {pickerName}</h2>
        <p className="text-slate-400">Other player, please look away!</p>
        <button 
          onClick={() => setReady(true)}
          className="bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-xl text-xl font-bold transition-all"
        >
          I am {pickerName}
        </button>
      </div>
    );
  }

  return (
    <div className="card-glass p-8 rounded-3xl w-full max-w-2xl text-center shadow-2xl space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-blue-400">{pickerName}'s Turn to Pick</h2>
        <p className="text-slate-400">Choose one of these secret words:</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-slate-500">Asking Gemini for creative options...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {words.map((word, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(word)}
              className="group p-6 bg-slate-800/50 border border-slate-700 hover:border-blue-500 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl text-xl font-semibold text-slate-200"
            >
              {word}
            </button>
          ))}
        </div>
      )}
      
      <p className="text-xs text-slate-500 italic">Psst... don't let the other player see your choice!</p>
    </div>
  );
};

export default PickingWordScreen;

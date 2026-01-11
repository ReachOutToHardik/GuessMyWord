
import React, { useState, useEffect } from 'react';

const EASY_WORDS = [
  "Apple", "Ball", "Cat", "Dog", "Egg", "Fish", "Guitar", "Hat", "Ice Cream", "Jelly",
  "Kite", "Lion", "Moon", "Nest", "Orange", "Pizza", "Queen", "Robot", "Sun", "Tree",
  "Umbrella", "Van", "Watch", "Xylophone", "Yoyo", "Zebra", "Book", "Chair", "Desk", "Lamp",
  "Pencil", "Phone", "Shoe", "Table", "Window", "Bird", "Car", "Door", "House", "Key",
  "Pen", "Ring", "Sock", "Star", "Wall", "Bed", "Boat", "Cake", "Duck", "Frog",
  "Goat", "Horse", "Leaf", "Mouse", "Pig", "Rose", "Ship", "Train", "Wolf", "Ant",
  "Bat", "Bee", "Bus", "Cap", "Cow", "Cup", "Drum", "Fan", "Fox", "Gem",
  "Hen", "Ink", "Jar", "Jug", "Leg", "Map", "Net", "Owl", "Pan", "Rat",
  "Rod", "Rug", "Sky", "Toy", "Tub", "Web", "Yak", "Zip", "Bag", "Box",
  "Can", "Dot", "Ear", "Eye", "Fly", "Gum", "Ham", "Hut", "Jet", "Kit",
  "Lip", "Log", "Man", "Mug", "Nut", "Oil", "Pea", "Pet", "Pie"
];

interface PickingWordScreenProps {
  pickerName: string;
  onSelect: (word: string) => void;
}

const PickingWordScreen: React.FC<PickingWordScreenProps> = ({ pickerName, onSelect }) => {
  const [suggestedWords, setSuggestedWords] = useState<string[]>([]);
  const [customWord, setCustomWord] = useState('');

  useEffect(() => {
    // Pick 3 unique random words
    const shuffled = [...EASY_WORDS].sort(() => 0.5 - Math.random());
    setSuggestedWords(shuffled.slice(0, 3));
  }, []);

  const handleCustomSubmit = () => {
    if (customWord.trim()) {
      onSelect(customWord.trim());
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl p-8 md:p-12 rounded-3xl w-full max-w-4xl text-center shadow-2xl space-y-8 animate-slide-up">
      <div className="space-y-3">
        <div className="inline-block px-4 py-1 rounded-full bg-game-primary/20 text-game-primary text-sm font-bold animate-pulse">
          YOUR TURN
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white">Select a Secret Word</h2>
        <p className="text-slate-400 text-lg">Choose an easy word for the other player to guess.</p>
      </div>

      {/* Suggested Words */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {suggestedWords.map((word, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(word)}
            className="group relative overflow-hidden p-8 bg-slate-800/40 border border-white/10 rounded-2xl transition-all duration-300 hover:scale-105 hover:bg-slate-800/80 hover:border-game-primary/50 hover:shadow-xl hover:shadow-game-primary/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-game-primary/0 to-game-secondary/0 group-hover:from-game-primary/10 group-hover:to-game-secondary/10 transition-all duration-500"></div>
            <span className="relative z-10 text-xl font-bold text-white group-hover:text-game-primary transition-colors">
              {word}
            </span>
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center my-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
        <div className="relative bg-game-surface px-4 text-sm text-slate-500 font-bold uppercase tracking-wider">OR CHOOSE YOUR OWN</div>
      </div>

      {/* Custom Input */}
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={customWord}
            onChange={(e) => setCustomWord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
            placeholder="Type any word..."
            className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-game-primary/50 text-white placeholder-slate-500 transition-all w-full text-center font-bold"
          />
          <button
            onClick={handleCustomSubmit}
            disabled={!customWord.trim()}
            className={`px-6 rounded-xl font-bold transition-all ${customWord.trim() ? 'bg-gradient-to-r from-game-primary to-game-secondary text-white hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
          >
            Confirm
          </button>
        </div>
      </div>

    </div>
  );
};

export default PickingWordScreen;

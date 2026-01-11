
export enum GamePhase {
  START = 'START',
  LOBBY = 'LOBBY',
  PICKING_WORD = 'PICKING_WORD',
  QUESTIONING = 'QUESTIONING',
  REVEALING_RESULT = 'REVEALING_RESULT',
  GAME_OVER = 'GAME_OVER'
}

export interface PlayerStats {
  name: string;
  totalWins: number;
  totalQuestionsAsked: number;
  totalGuesses: number;
}

export interface TurnData {
  pickerIndex: number;
  guesserIndex: number;
  selectedWord: string;
  questions: { question: string; answer: 'yes' | 'no' }[];
  guesses: string[];
  isSolved: boolean;
}

export interface GameState {
  players: PlayerStats[];
  currentRound: number;
  maxRounds: number;
  currentTurn: TurnData;
  phase: GamePhase;
  roomCode?: string;
}

export interface RoomPlayer {
  id: string;
  name: string;
  isHost: boolean;
}

export interface RoomData {
  code: string;
  players: RoomPlayer[];
  gameState: GameState | null;
  isGameStarted: boolean;
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

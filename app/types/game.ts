export interface GameState {
  players: string[]
  currentPlayerIndex: number
  timerDuration: number // in minutes
  timeRemaining: number // in seconds
  isPlaying: boolean
  isPaused: boolean
  gameStarted: boolean
}

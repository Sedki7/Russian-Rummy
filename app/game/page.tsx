"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, SkipForward, RotateCcw, Settings } from "lucide-react"
import Link from "next/link"
import { OfflineIndicator } from "@/components/offline-indicator"

interface GameState {
  players: string[]
  currentPlayerIndex: number
  timerDuration: number
  timeRemaining: number
  isRunning: boolean
  isPaused: boolean
}

export default function GamePage() {
  const router = useRouter()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [mounted, setMounted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const saveGameState = useCallback((state: GameState) => {
    localStorage.setItem("russianRummyGame", JSON.stringify(state))
  }, [])

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Fallback to vibration if audio fails
        if ("vibrate" in navigator) {
          navigator.vibrate([200, 100, 200])
        }
      })
    } else if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200])
    }
  }, [])

  const nextPlayer = useCallback(() => {
    if (!gameState) return

    const nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length
    const newState: GameState = {
      ...gameState,
      currentPlayerIndex: nextIndex,
      timeRemaining: gameState.timerDuration,
      isRunning: true,
      isPaused: false,
    }

    setGameState(newState)
    saveGameState(newState)
    playNotificationSound()
  }, [gameState, saveGameState, playNotificationSound])

  const resetTimer = useCallback(() => {
    if (!gameState) return

    const newState: GameState = {
      ...gameState,
      timeRemaining: gameState.timerDuration,
      isRunning: false,
      isPaused: false,
    }

    setGameState(newState)
    saveGameState(newState)
  }, [gameState, saveGameState])

  const toggleTimer = useCallback(() => {
    if (!gameState) return

    const newState: GameState = {
      ...gameState,
      isRunning: !gameState.isRunning,
      isPaused: gameState.isRunning,
    }

    setGameState(newState)
    saveGameState(newState)
  }, [gameState, saveGameState])

  const endGame = useCallback(() => {
    localStorage.removeItem("russianRummyGame")
    router.push("/setup")
  }, [router])

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
      )
    }
  }, [])

  useEffect(() => {
    setMounted(true)

    // Load game state
    const savedGame = localStorage.getItem("russianRummyGame")
    if (savedGame) {
      const state: GameState = JSON.parse(savedGame)
      setGameState(state)
    } else {
      router.push("/setup")
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [router])

  useEffect(() => {
    if (!gameState || !gameState.isRunning) return

    intervalRef.current = setInterval(() => {
      setGameState((prevState) => {
        if (!prevState || prevState.timeRemaining <= 0) return prevState

        const newTimeRemaining = prevState.timeRemaining - 1

        if (newTimeRemaining <= 0) {
          // Timer finished, move to next player
          const nextIndex = (prevState.currentPlayerIndex + 1) % prevState.players.length
          const newState: GameState = {
            ...prevState,
            currentPlayerIndex: nextIndex,
            timeRemaining: prevState.timerDuration,
            isRunning: true,
            isPaused: false,
          }

          saveGameState(newState)
          playNotificationSound()
          return newState
        }

        const newState: GameState = {
          ...prevState,
          timeRemaining: newTimeRemaining,
        }

        saveGameState(newState)
        return newState
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [gameState, saveGameState, playNotificationSound])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getProgressPercentage = () => {
    if (!gameState) return 0
    return ((gameState.timerDuration - gameState.timeRemaining) / gameState.timerDuration) * 100
  }

  if (!mounted || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading game...</p>
        </div>
      </div>
    )
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  const isLowTime = gameState.timeRemaining <= 30

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/setup">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Setup
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Russian Rummy</h1>
          <div className="w-20"></div>
        </div>

        <Card className="mb-6">
          <CardHeader className="text-center pb-4">
            <CardTitle
              className={`text-2xl transition-all duration-300 ${
                isLowTime ? "text-red-600 animate-pulse" : "text-gray-800"
              }`}
            >
              {currentPlayer}'s Turn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timer Display */}
            <div className="text-center">
              <div
                className={`text-6xl font-mono font-bold transition-all duration-300 ${
                  isLowTime ? "text-red-600 animate-pulse" : "text-indigo-600"
                }`}
              >
                {formatTime(gameState.timeRemaining)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress
                value={getProgressPercentage()}
                className={`h-3 transition-all duration-300 ${
                  isLowTime ? "[&>div]:bg-red-500" : "[&>div]:bg-indigo-500"
                }`}
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>0:00</span>
                <span>{formatTime(gameState.timerDuration)}</span>
              </div>
            </div>

            {/* MAIN NEXT PLAYER BUTTON - CENTERED AND PROMINENT */}
            <div className="flex justify-center py-4">
              <Button
                onClick={nextPlayer}
                size="lg"
                className="w-48 h-16 text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <SkipForward className="w-6 h-6 mr-3" />
                Next Player
              </Button>
            </div>

            {/* Secondary Control Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={toggleTimer}
                variant={gameState.isRunning ? "destructive" : "default"}
                size="sm"
                className="flex flex-col items-center justify-center h-16 text-xs"
              >
                {gameState.isRunning ? (
                  <>
                    <Pause className="w-4 h-4 mb-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mb-1" />
                    {gameState.isPaused ? "Resume" : "Start"}
                  </>
                )}
              </Button>

              <Button
                onClick={resetTimer}
                variant="outline"
                size="sm"
                className="flex flex-col items-center justify-center h-16 text-xs bg-transparent"
              >
                <RotateCcw className="w-4 h-4 mb-1" />
                Reset
              </Button>

              <Button
                onClick={endGame}
                variant="destructive"
                size="sm"
                className="flex flex-col items-center justify-center h-16 text-xs"
              >
                <Square className="w-4 h-4 mb-1" />
                End Game
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Player List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gameState.players.map((player, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    index === gameState.currentPlayerIndex
                      ? "bg-indigo-100 border-2 border-indigo-500 shadow-md"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-medium ${
                        index === gameState.currentPlayerIndex ? "text-indigo-700" : "text-gray-700"
                      }`}
                    >
                      {player}
                    </span>
                    {index === gameState.currentPlayerIndex && (
                      <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <OfflineIndicator />
      </div>
    </div>
  )
}

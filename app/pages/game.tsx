"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, Settings, SkipForward } from "lucide-react"
import type { GameState } from "../types/game"
import { playNotificationSound, vibrate } from "../utils/sound"

export default function Game() {
  const navigate = useNavigate()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Load game state from localStorage
    const savedState = localStorage.getItem("russianRummyState")
    if (savedState) {
      const state: GameState = JSON.parse(savedState)
      setGameState(state)
    } else {
      navigate("/setup")
    }
  }, [navigate])

  useEffect(() => {
    if (!gameState) return

    // Save state to localStorage whenever it changes
    localStorage.setItem("russianRummyState", JSON.stringify(gameState))

    // Handle timer logic
    if (gameState.isPlaying && !gameState.isPaused) {
      intervalRef.current = setInterval(() => {
        setGameState((prevState) => {
          if (!prevState) return prevState

          const newTimeRemaining = prevState.timeRemaining - 1

          if (newTimeRemaining <= 0) {
            // Timer ended - switch to next player
            playNotificationSound()
            vibrate()

            const nextPlayerIndex = (prevState.currentPlayerIndex + 1) % prevState.players.length

            return {
              ...prevState,
              currentPlayerIndex: nextPlayerIndex,
              timeRemaining: prevState.timerDuration * 60,
              isPlaying: true,
              isPaused: false,
            }
          }

          return {
            ...prevState,
            timeRemaining: newTimeRemaining,
          }
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [gameState]) // Updated to include gameState as a dependency

  const toggleTimer = () => {
    if (!gameState) return

    setGameState((prevState) => {
      if (!prevState) return prevState

      return {
        ...prevState,
        isPlaying: !prevState.paused ? !prevState.isPlaying : true,
        isPaused: prevState.isPlaying ? !prevState.paused : false,
      }
    })
  }

  const nextPlayer = () => {
    if (!gameState) return

    playNotificationSound()
    vibrate()

    setGameState((prevState) => {
      if (!prevState) return prevState

      const nextPlayerIndex = (prevState.currentPlayerIndex + 1) % prevState.players.length

      return {
        ...prevState,
        currentPlayerIndex: nextPlayerIndex,
        timeRemaining: prevState.timerDuration * 60,
        isPlaying: false,
        isPaused: false,
      }
    })
  }

  const endGame = () => {
    localStorage.removeItem("russianRummyState")
    navigate("/setup")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading game...</p>
        </div>
      </div>
    )
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  const progressPercentage =
    ((gameState.timerDuration * 60 - gameState.timeRemaining) / (gameState.timerDuration * 60)) * 100

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Russian Rummy</h1>
          <Button variant="ghost" size="icon" onClick={() => navigate("/setup")}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-sm text-gray-600 uppercase tracking-wide">Current Player</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div
              className={`text-4xl font-bold transition-all duration-500 ${
                gameState.isPlaying && !gameState.isPaused ? "text-blue-600 animate-pulse" : "text-gray-700"
              }`}
            >
              {currentPlayer}
            </div>

            <div className="space-y-2">
              <div className="text-6xl font-mono font-bold text-gray-800">{formatTime(gameState.timeRemaining)}</div>

              <Progress value={progressPercentage} className="h-3 bg-gray-200" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={toggleTimer}
            className={`h-16 text-sm font-semibold ${
              gameState.isPlaying && !gameState.isPaused
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {gameState.isPlaying && !gameState.isPaused ? (
              <>
                <Pause className="mr-1 h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-1 h-5 w-5" />
                {gameState.isPaused ? "Resume" : "Start"}
              </>
            )}
          </Button>

          <Button onClick={nextPlayer} className="h-16 text-sm font-semibold bg-blue-600 hover:bg-blue-700">
            <SkipForward className="mr-1 h-5 w-5" />
            Next Player
          </Button>

          <Button onClick={endGame} variant="destructive" className="h-16 text-sm font-semibold">
            <Square className="mr-1 h-5 w-5" />
            End Game
          </Button>
        </div>

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
                      ? "bg-blue-100 border-2 border-blue-300 font-semibold"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{player}</span>
                    {index === gameState.currentPlayerIndex && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>Timer Duration: {gameState.timerDuration} minutes</p>
        </div>
      </div>
    </div>
  )
}

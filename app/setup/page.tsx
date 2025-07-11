"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Plus, Minus, Play, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { OfflineIndicator } from "@/components/offline-indicator"

interface GameSetup {
  players: string[]
  timerDuration: number
}

export default function SetupPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<string[]>(["", ""])
  const [timerDuration, setTimerDuration] = useState<number>(3)

  useEffect(() => {
    // Load saved setup from localStorage
    const savedSetup = localStorage.getItem("russianRummySetup")
    if (savedSetup) {
      const setup: GameSetup = JSON.parse(savedSetup)
      setPlayers(setup.players.length > 0 ? setup.players : ["", ""])
      setTimerDuration(setup.timerDuration)
    }
  }, [])

  const addPlayer = () => {
    if (players.length < 8) {
      setPlayers([...players, ""])
    }
  }

  const removePlayer = (index: number) => {
    if (players.length > 2) {
      setPlayers(players.filter((_, i) => i !== index))
    }
  }

  const updatePlayer = (index: number, name: string) => {
    const newPlayers = [...players]
    newPlayers[index] = name
    setPlayers(newPlayers)
  }

  const startGame = () => {
    const validPlayers = players.filter((name) => name.trim() !== "")

    if (validPlayers.length < 2) {
      alert("Please add at least 2 players with names")
      return
    }

    const gameSetup: GameSetup = {
      players: validPlayers,
      timerDuration,
    }

    // Save setup to localStorage
    localStorage.setItem("russianRummySetup", JSON.stringify(gameSetup))

    // Initialize game state
    const gameState = {
      players: validPlayers,
      currentPlayerIndex: 0,
      timerDuration: timerDuration * 60, // Convert to seconds
      timeRemaining: timerDuration * 60,
      isRunning: false,
      isPaused: false,
    }

    localStorage.setItem("russianRummyGame", JSON.stringify(gameState))
    router.push("/game")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Game Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Players Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Players</h3>
              <div className="space-y-2">
                {players.map((player, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Player ${index + 1} name`}
                      value={player}
                      onChange={(e) => updatePlayer(index, e.target.value)}
                      className="flex-1"
                    />
                    {players.length > 2 && (
                      <Button variant="outline" size="sm" onClick={() => removePlayer(index)}>
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {players.length < 8 && (
                <Button variant="outline" onClick={addPlayer} className="w-full mt-3 bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Player
                </Button>
              )}
            </div>

            {/* Timer Duration Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Timer Duration</h3>
              <div className="space-y-4">
                <div className="px-3">
                  <Slider
                    value={[timerDuration]}
                    onValueChange={(value) => setTimerDuration(value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-indigo-600">
                    {timerDuration} minute{timerDuration !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <Button
              onClick={startGame}
              size="lg"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </Button>
          </CardContent>
        </Card>
        <OfflineIndicator />
      </div>
    </div>
  )
}

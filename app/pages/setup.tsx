"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Minus, Users, Clock, ArrowLeft, Play } from "lucide-react"
import type { GameState } from "../types/game"

export default function Setup() {
  const navigate = useNavigate()
  const [players, setPlayers] = useState<string[]>([""])
  const [timerDuration, setTimerDuration] = useState<number>(3) // minutes

  useEffect(() => {
    // Load saved game state if exists
    const savedState = localStorage.getItem("russianRummyState")
    if (savedState) {
      const gameState: GameState = JSON.parse(savedState)
      setPlayers(gameState.players.length > 0 ? gameState.players : [""])
      setTimerDuration(gameState.timerDuration)
    }
  }, [])

  const addPlayer = () => {
    setPlayers([...players, ""])
  }

  const removePlayer = (index: number) => {
    if (players.length > 1) {
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
      alert("Please add at least 2 players")
      return
    }

    const gameState: GameState = {
      players: validPlayers,
      currentPlayerIndex: 0,
      timerDuration,
      timeRemaining: timerDuration * 60,
      isPlaying: false,
      isPaused: false,
      gameStarted: true,
    }

    localStorage.setItem("russianRummyState", JSON.stringify(gameState))
    navigate("/game")
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/")} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Game Setup</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Players</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {players.map((player, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder={`Player ${index + 1} name`}
                  value={player}
                  onChange={(e) => updatePlayer(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removePlayer(index)}
                  disabled={players.length === 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              onClick={addPlayer}
              variant="outline"
              className="w-full bg-transparent"
              disabled={players.length >= 8}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Player
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Timer Duration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>1 minute</span>
                <span className="font-semibold">{timerDuration} minutes</span>
                <span>10 minutes</span>
              </div>
              <Slider
                value={[timerDuration]}
                onValueChange={(value) => setTimerDuration(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={startGame}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          <Play className="mr-2 h-6 w-6" />
          Start Playing
        </Button>
      </div>
    </div>
  )
}

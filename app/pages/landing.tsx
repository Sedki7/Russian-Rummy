"use client"

import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md w-full">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-800 mb-2">Russian Rummy</h1>
          <p className="text-xl text-gray-600">Game Timer & Player Manager</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="space-y-6">
            <div className="text-gray-700">
              <p className="mb-4">Ready to start your game?</p>
              <ul className="text-sm space-y-2 text-left">
                <li>• Add players</li>
                <li>• Set timer duration</li>
                <li>• Track turns automatically</li>
              </ul>
            </div>

            <Button
              onClick={() => navigate("/setup")}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Play className="mr-2 h-6 w-6" />
              Start Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

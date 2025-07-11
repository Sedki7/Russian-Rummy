"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
    Play,
    Pause,
    SkipForward,
    Plus,
    Minus,
    Settings,
    Users,
    Clock,
    RotateCcw,
    Download,
} from "lucide-react";

interface GameState {
    players: string[];
    currentPlayerIndex: number;
    timerDuration: number; // in minutes
    timeRemaining: number; // in seconds
    isPlaying: boolean;
    isPaused: boolean;
    gameStarted: boolean;
}

const playNotificationSound = () => {
    try {
        const audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.5
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log("Audio not supported");
    }
};

const vibrate = () => {
    if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
    }
};

export default function RussianRummyTimer() {
    const [gameState, setGameState] = useState<GameState>({
        players: [""],
        currentPlayerIndex: 0,
        timerDuration: 3,
        timeRemaining: 180,
        isPlaying: false,
        isPaused: false,
        gameStarted: false,
    });

    const [showSettings, setShowSettings] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // PWA Install prompt handling
    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallPrompt(true);
        };

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt
        );

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setShowInstallPrompt(false);
            }
            setDeferredPrompt(null);
        }
    };

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("russianRummyState");
        if (saved) {
            try {
                const parsedState = JSON.parse(saved);
                setGameState(parsedState);
                setShowSettings(!parsedState.gameStarted);
            } catch (error) {
                console.log("Error loading saved state");
            }
        } else {
            setShowSettings(true);
        }
    }, []);

    // Save to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem("russianRummyState", JSON.stringify(gameState));
    }, [gameState]);

    // Timer logic
    useEffect(() => {
        if (
            gameState.isPlaying &&
            !gameState.isPaused &&
            gameState.gameStarted
        ) {
            intervalRef.current = setInterval(() => {
                setGameState((prev) => {
                    const newTimeRemaining = prev.timeRemaining - 1;

                    if (newTimeRemaining <= 0) {
                        playNotificationSound();
                        vibrate();

                        const nextPlayerIndex =
                            (prev.currentPlayerIndex + 1) % prev.players.length;

                        return {
                            ...prev,
                            currentPlayerIndex: nextPlayerIndex,
                            timeRemaining: prev.timerDuration * 60,
                            isPlaying: true,
                            isPaused: false,
                        };
                    }

                    return {
                        ...prev,
                        timeRemaining: newTimeRemaining,
                    };
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [gameState.isPlaying, gameState.isPaused, gameState.gameStarted]);

    const addPlayer = () => {
        setGameState((prev) => ({
            ...prev,
            players: [...prev.players, ""],
        }));
    };

    const removePlayer = (index: number) => {
        if (gameState.players.length > 1) {
            setGameState((prev) => ({
                ...prev,
                players: prev.players.filter((_, i) => i !== index),
                currentPlayerIndex:
                    prev.currentPlayerIndex >= index
                        ? Math.max(0, prev.currentPlayerIndex - 1)
                        : prev.currentPlayerIndex,
            }));
        }
    };

    const updatePlayer = (index: number, name: string) => {
        setGameState((prev) => ({
            ...prev,
            players: prev.players.map((player, i) =>
                i === index ? name : player
            ),
        }));
    };

    const setTimerDuration = (duration: number) => {
        setGameState((prev) => ({
            ...prev,
            timerDuration: duration,
            timeRemaining: duration * 60,
        }));
    };

    const startGame = () => {
        const validPlayers = gameState.players.filter(
            (name) => name.trim() !== ""
        );

        if (validPlayers.length < 2) {
            alert("Please add at least 2 players");
            return;
        }

        setGameState((prev) => ({
            ...prev,
            players: validPlayers,
            gameStarted: true,
            currentPlayerIndex: 0,
            timeRemaining: prev.timerDuration * 60,
            isPlaying: false,
            isPaused: false,
        }));

        setShowSettings(false);
    };

    const toggleTimer = () => {
        setGameState((prev) => ({
            ...prev,
            isPlaying: !prev.isPlaying,
            isPaused: false,
        }));
    };

    const nextPlayer = () => {
        playNotificationSound();
        vibrate();

        setGameState((prev) => ({
            ...prev,
            currentPlayerIndex:
                (prev.currentPlayerIndex + 1) % prev.players.length,
            timeRemaining: prev.timerDuration * 60,
            isPlaying: true,
            isPaused: false,
        }));
    };

    const resetGame = () => {
        setGameState((prev) => ({
            ...prev,
            gameStarted: false,
            isPlaying: false,
            isPaused: false,
            currentPlayerIndex: 0,
            timeRemaining: prev.timerDuration * 60,
        }));
        setShowSettings(true);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const progressPercentage =
        ((gameState.timerDuration * 60 - gameState.timeRemaining) /
            (gameState.timerDuration * 60)) *
        100;

    if (showSettings || !gameState.gameStarted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
                <div className="max-w-2xl mx-auto space-y-8 pt-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Russian Rummy Wiiou
                        </h1>
                        <p className="text-xl text-gray-600">
                            Game Timer Setup
                        </p>

                        {showInstallPrompt && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Download className="h-5 w-5 text-blue-600" />
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-blue-900">
                                                Install App
                                            </p>
                                            <p className="text-xs text-blue-700">
                                                Add to home screen for offline
                                                use
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleInstallClick}
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Install
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-xl">
                                <Users className="h-6 w-6 text-indigo-600" />
                                <span>Players</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {gameState.players.map((player, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600">
                                        {index + 1}
                                    </div>
                                    <Input
                                        placeholder={`Player ${index + 1} name`}
                                        value={player}
                                        onChange={(e) =>
                                            updatePlayer(index, e.target.value)
                                        }
                                        className="flex-1 h-12 text-lg border-2 focus:border-indigo-400"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => removePlayer(index)}
                                        disabled={
                                            gameState.players.length === 1
                                        }
                                        className="h-12 w-12 border-2"
                                    >
                                        <Minus className="h-5 w-5" />
                                    </Button>
                                </div>
                            ))}

                            <Button
                                onClick={addPlayer}
                                variant="outline"
                                className="w-full h-12 text-lg border-2 border-dashed border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50 bg-transparent"
                                disabled={gameState.players.length >= 8}
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Add Player
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-xl">
                                <Clock className="h-6 w-6 text-indigo-600" />
                                <span>Timer Duration</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-indigo-600 mb-2">
                                    {gameState.timerDuration} minute
                                    {gameState.timerDuration !== 1 ? "s" : ""}
                                </div>
                                <div className="text-gray-500">
                                    per player turn
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Slider
                                    value={[gameState.timerDuration]}
                                    onValueChange={(value) =>
                                        setTimerDuration(value[0])
                                    }
                                    min={1}
                                    max={10}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>1 min</span>
                                    <span>10 min</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        onClick={startGame}
                        className="w-full h-16 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl"
                    >
                        <Play className="mr-3 h-7 w-7" />
                        Start Game
                    </Button>
                </div>
            </div>
        );
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
            <div className="max-w-md mx-auto space-y-6 pt-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Russian Rummy
                    </h1>
                    <div className="flex space-x-2">
                        {showInstallPrompt && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleInstallClick}
                                className="h-10 w-10"
                                title="Install App"
                            >
                                <Download className="h-5 w-5" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowSettings(true)}
                            className="h-10 w-10"
                        >
                            <Settings className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-indigo-50/50 backdrop-blur">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-sm text-gray-500 uppercase tracking-wider font-medium">
                            Current Player
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-6 pb-8">
                        <div
                            className={`text-4xl font-bold transition-all duration-500 ${
                                gameState.isPlaying
                                    ? "text-indigo-600 animate-pulse"
                                    : "text-gray-700"
                            }`}
                        >
                            {currentPlayer}
                        </div>

                        <div className="space-y-4">
                            <div className="text-7xl font-mono font-bold text-gray-800 tracking-tight">
                                {formatTime(gameState.timeRemaining)}
                            </div>

                            <div className="px-4">
                                <Progress
                                    value={progressPercentage}
                                    className="h-4 bg-gray-200 shadow-inner"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-3 gap-3">
                    <Button
                        onClick={toggleTimer}
                        className={`h-16 text-sm font-bold shadow-lg ${
                            gameState.isPlaying
                                ? "bg-orange-500 hover:bg-orange-600 text-white"
                                : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                    >
                        {gameState.isPlaying ? (
                            <>
                                <Pause className="mb-1 h-5 w-5" />
                                <div>Pause</div>
                            </>
                        ) : (
                            <>
                                <Play className="mb-1 h-5 w-5" />
                                <div>Start</div>
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={nextPlayer}
                        className="h-16 text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                    >
                        <SkipForward className="mb-1 h-5 w-5" />
                        <div>Next</div>
                    </Button>

                    <Button
                        onClick={resetGame}
                        className="h-16 text-sm font-bold bg-gray-500 hover:bg-gray-600 text-white shadow-lg"
                    >
                        <RotateCcw className="mb-1 h-5 w-5" />
                        <div>Reset</div>
                    </Button>
                </div>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span>Players ({gameState.players.length})</span>
                            <span className="text-sm font-normal text-gray-500">
                                {gameState.timerDuration}min each
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {gameState.players.map((player, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-xl transition-all duration-300 ${
                                        index === gameState.currentPlayerIndex
                                            ? "bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-300 shadow-md"
                                            : "bg-gray-50 border border-gray-200"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                    index ===
                                                    gameState.currentPlayerIndex
                                                        ? "bg-indigo-500 text-white"
                                                        : "bg-gray-300 text-gray-600"
                                                }`}
                                            >
                                                {index + 1}
                                            </div>
                                            <span
                                                className={`font-medium ${
                                                    index ===
                                                    gameState.currentPlayerIndex
                                                        ? "text-indigo-800"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {player}
                                            </span>
                                        </div>
                                        {index ===
                                            gameState.currentPlayerIndex && (
                                            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

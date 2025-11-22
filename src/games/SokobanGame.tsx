/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/preserve-manual-memoization */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { SokobanEngine, type GameState } from './sokoban/SokobanEngine';
import { levels } from './sokoban/levels';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, SkipForward, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import RetroBGM from '../components/RetroBGM';

const SokobanGame: React.FC = () => {
    const { user } = useAuth();
    const [levelIndex, setLevelIndex] = useState(0);
    const [engine, setEngine] = useState<SokobanEngine | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [coinCount, setCoinCount] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timer, setTimer] = useState(0);
    const [playerDirection, setPlayerDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('DOWN');
    const [maxClearedLevel, setMaxClearedLevel] = useState(0);

    // Load progress
    useEffect(() => {
        const loadProgress = async () => {
            if (user) {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        const savedLevel = data.sokobanLastLevel || 0;
                        setMaxClearedLevel(savedLevel);
                        if (savedLevel < levels.length) {
                            setLevelIndex(savedLevel);
                        }
                    }
                } catch (e) {
                    console.error("Error loading progress:", e);
                }
            }
        };
        loadProgress();
    }, [user]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isPlayingRef = useRef(isPlaying);

    // Timer Logic
    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 1000);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    useEffect(() => {
        return () => stopTimer();
    }, [stopTimer]);

    // Keep ref synced with state
    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    // Initialize Engine
    useEffect(() => {
        const newEngine = new SokobanEngine(levels[levelIndex]);
        setEngine(newEngine);
        setGameState(newEngine.getState());
        setTimer(0);

        if (timerRef.current) clearInterval(timerRef.current);

        // If already playing (moving to next level), restart timer automatically
        if (isPlayingRef.current) {
            startTimer();
        }
    }, [levelIndex, startTimer]);



    const handleLevelComplete = useCallback(async () => {
        // Save Score
        if (user) {
            console.log("Attempting to save score...", {
                userId: user.uid,
                userName: user.displayName,
                level: levelIndex + 1,
                score: timer,
                moves: gameState?.moves
            });
            try {
                // Save score to leaderboard
                const docRef = await addDoc(collection(db, 'scores'), {
                    userId: user.uid,
                    userName: user.displayName || 'Anonymous',
                    userPhoto: user.photoURL || '',
                    gameId: 'sokoban',
                    level: levelIndex + 1,
                    score: timer, // Lower is better
                    moves: gameState?.moves,
                    createdAt: new Date().toISOString(),
                    meta: {
                        type: 'time_attack',
                        completed: true // Mark as completed
                    }
                });
                console.log("✅ Score saved successfully! Document ID:", docRef.id);

                // Save Progress (Last Cleared Level)
                const nextLevel = levelIndex + 1;
                if (nextLevel > maxClearedLevel) {
                    setMaxClearedLevel(nextLevel);
                    const userRef = doc(db, 'users', user.uid);
                    await setDoc(userRef, { sokobanLastLevel: nextLevel }, { merge: true });
                    console.log("✅ Progress saved! Unlocked level:", nextLevel + 1);
                }

                alert("Score saved to leaderboard!");
            } catch (e: any) {
                console.error("❌ Error saving score:", e);
                console.error("Error code:", e.code);
                console.error("Error message:", e.message);
                alert(`Failed to save score: ${e.message}\n\nPlease check Firebase security rules.`);
            }
        } else {
            console.warn("⚠️ No user logged in, score not saved");
            alert("Please log in to save your score!");
        }

        // Auto next level after delay
        setTimeout(() => {
            if (levelIndex < levels.length - 1) {
                setLevelIndex(prev => prev + 1);
            } else {
                alert("ALL LEVELS CLEARED! YOU ARE THE SOKOBAN MASTER!");
                setIsPlaying(false);
            }
        }, 2000);
    }, [user, levelIndex, timer, gameState?.moves, maxClearedLevel]);

    // Sound Effects
    const sfxContextRef = useRef<AudioContext | null>(null);

    const initAudioContext = useCallback(() => {
        if (!sfxContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                sfxContextRef.current = new AudioContextClass();
            }
        }

        if (sfxContextRef.current && sfxContextRef.current.state === 'suspended') {
            sfxContextRef.current.resume().catch(() => {
                console.warn('Failed to resume AudioContext');
            });
        }

        return sfxContextRef.current;
    }, []);

    const playMoveSound = useCallback(() => {
        try {
            const ctx = initAudioContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            // Sliding sound
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.warn('Sound playback failed:', e);
        }
    }, [initAudioContext]);

    const playSuccessSound = useCallback(() => {
        try {
            const ctx = initAudioContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            // Success chime
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523, ctx.currentTime); // C5
            osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
            osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5

            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.4);
        } catch (e) {
            console.warn('Sound playback failed:', e);
        }
    }, [initAudioContext]);

    // Controls
    const handleMove = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
        if (!engine || !isPlaying || gameState?.levelComplete) return;

        setPlayerDirection(direction); // Update player direction
        const moved = engine.move(direction);
        if (moved) {
            playMoveSound();
            setGameState({ ...engine.getState() });
            if (engine.getState().levelComplete) {
                playSuccessSound();
                stopTimer();
                handleLevelComplete();
            }
        }
    }, [engine, isPlaying, gameState, stopTimer, handleLevelComplete, playMoveSound, playSuccessSound]);

    const handleReset = useCallback(() => {
        if (engine && isPlaying) {
            engine.reset();
            setGameState({ ...engine.getState() });
            setTimer(0);
            startTimer();
        }
    }, [engine, isPlaying, startTimer]);

    // Keyboard Input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent default scroll behavior for arrow keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }

            switch (e.key) {
                case 'ArrowUp': handleMove('UP'); break;
                case 'ArrowDown': handleMove('DOWN'); break;
                case 'ArrowLeft': handleMove('LEFT'); break;
                case 'ArrowRight': handleMove('RIGHT'); break;
                case 'r':
                case 'R': handleReset(); break;
                case 'i':
                case 'I': handleInsertCoin(); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleMove, handleReset]);

    const handleInsertCoin = () => {
        setCoinCount(prev => prev + 1);
    };

    const handleStartGame = () => {
        if (coinCount > 0) {
            // Only consume coin on first start, not between levels
            if (!isPlaying) {
                setCoinCount(prev => prev - 1);
            }
            setIsPlaying(true);
            startTimer();
        }
    };

    const handleQuitGame = async () => {
        if (!isPlaying) return;

        // Stop game
        stopTimer();
        setIsPlaying(false);
    };



    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Rendering Helpers
    const getTileColor = (tile: string, x: number, y: number) => {
        // Checkerboard pattern for floor
        const isEven = (x + y) % 2 === 0;
        if (tile === 'Wall') return 'bg-slate-700 border-slate-600';
        if (tile === 'Goal') return 'bg-green-900/50 border-green-800';
        if (tile === 'Floor') return isEven ? 'bg-slate-800' : 'bg-slate-800/80';
        return 'bg-transparent';
    };

    if (!gameState) return <div>Loading...</div>;

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
            {/* HUD */}
            <div className="w-full flex justify-between items-center bg-slate-900 p-4 rounded-t-xl border-b-2 border-slate-700">
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-xs text-slate-400 uppercase">Level</p>
                        <p className="text-2xl font-mono text-yellow-400">{levelIndex + 1}<span className="text-sm text-slate-500">/{levels.length}</span></p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-400 uppercase">Time</p>
                        <p className="text-2xl font-mono text-white">{formatTime(timer)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-400 uppercase">Moves</p>
                        <p className="text-2xl font-mono text-white">{gameState.moves}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase">Credits</p>
                        <p className="text-2xl font-mono text-red-500 animate-pulse">{coinCount}</p>
                    </div>
                    {!isPlaying && (
                        <button
                            onClick={handleInsertCoin}
                            className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded font-bold border-b-4 border-yellow-800 active:border-b-0 active:translate-y-1 transition-all"
                        >
                            INSERT COIN
                        </button>
                    )}
                </div>
            </div>

            {/* Game Board */}
            <div className="relative bg-black p-4 border-x-4 border-slate-800 shadow-inner w-full flex justify-center min-h-[400px]">
                {!isPlaying ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 backdrop-blur-sm">
                        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">SOKOBAN</h2>
                        {coinCount > 0 ? (
                            <button
                                onClick={handleStartGame}
                                className="text-2xl text-green-400 font-mono animate-pulse hover:scale-110 transition-transform"
                            >
                                PRESS START
                            </button>
                        ) : (
                            <p className="text-xl text-red-500 font-mono animate-pulse">INSERT COIN (Press the key "I")</p>
                        )}
                        <div className="mt-8 text-slate-500 text-sm">
                            <p>I to Insert Coin</p>
                            <p>ARROW KEYS to Move</p>
                            <p>R to Reset Level</p>
                        </div>
                    </div>
                ) : null}

                {gameState.levelComplete && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-900/90 z-20 backdrop-blur-md">
                        <h2 className="text-5xl font-black text-white mb-2 drop-shadow-lg">LEVEL CLEARED!</h2>
                        <p className="text-2xl text-green-200 font-mono mb-4">Time: {formatTime(timer)}</p>
                        <p className="text-white animate-bounce">Loading next level...</p>
                    </div>
                )}

                <div
                    className="grid gap-0.5 bg-slate-900 p-2 rounded border border-slate-700"
                    style={{
                        gridTemplateColumns: `repeat(${gameState.grid[0].length}, minmax(20px, 1fr))`,
                    }}
                >
                    {gameState.grid.map((row, y) => (
                        row.map((tile, x) => {
                            const entity = gameState.entities[y][x];
                            const isPlayer = gameState.playerPos.x === x && gameState.playerPos.y === y;

                            return (
                                <div
                                    key={`${x}-${y}`}
                                    className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center relative ${getTileColor(tile, x, y)}`}
                                >
                                    {tile === 'Goal' && <div className="w-2 h-2 bg-green-500 rounded-full opacity-50"></div>}

                                    {entity.type === 'Box' && (
                                        <div className={`absolute inset-1 bg-amber-700 border-2 border-amber-600 shadow-sm flex items-center justify-center ${tile === 'Goal' ? 'bg-green-600 border-green-400 brightness-125' : ''}`}>
                                            <div className="w-full h-full border border-amber-900/30 flex items-center justify-center">
                                                <span className="text-amber-900/50 font-bold text-xs">BOX</span>
                                            </div>
                                        </div>
                                    )}

                                    {isPlayer && (
                                        <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10">
                                            <div className="bg-indigo-600 rounded-full p-1 shadow-lg border-2 border-indigo-300">
                                                {playerDirection === 'UP' && <ArrowUp size={20} className="text-white" strokeWidth={3} />}
                                                {playerDirection === 'DOWN' && <ArrowDown size={20} className="text-white" strokeWidth={3} />}
                                                {playerDirection === 'LEFT' && <ArrowLeft size={20} className="text-white" strokeWidth={3} />}
                                                {playerDirection === 'RIGHT' && <ArrowRight size={20} className="text-white" strokeWidth={3} />}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ))}
                </div>
            </div>

            {/* Controls Bar */}
            <div className="w-full bg-slate-800 p-4 rounded-b-xl border-t-4 border-slate-950 flex justify-center gap-8">
                <button
                    onClick={handleQuitGame}
                    className="flex flex-col items-center gap-1 text-slate-400 hover:text-red-400 transition-colors active:scale-95"
                    disabled={!isPlaying}
                >
                    <div className="bg-slate-700 p-3 rounded-full border-b-4 border-slate-900">
                        <X size={24} />
                    </div>
                    <span className="text-xs font-bold">QUIT</span>
                </button>

                <button
                    onClick={handleReset}
                    className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors active:scale-95"
                    disabled={!isPlaying}
                >
                    <div className="bg-slate-700 p-3 rounded-full border-b-4 border-slate-900">
                        <RotateCcw size={24} />
                    </div>
                    <span className="text-xs font-bold">RESET</span>
                </button>

                <div className="grid grid-cols-3 gap-2">
                    <div></div>
                    <button onClick={() => handleMove('UP')} className="bg-slate-700 p-3 rounded-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 hover:bg-slate-600 text-white">
                        <ArrowUp size={24} />
                    </button>
                    <div></div>
                    <button onClick={() => handleMove('LEFT')} className="bg-slate-700 p-3 rounded-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 hover:bg-slate-600 text-white">
                        <ArrowLeft size={24} />
                    </button>
                    <button onClick={() => handleMove('DOWN')} className="bg-slate-700 p-3 rounded-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 hover:bg-slate-600 text-white">
                        <ArrowDown size={24} />
                    </button>
                    <button onClick={() => handleMove('RIGHT')} className="bg-slate-700 p-3 rounded-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 hover:bg-slate-600 text-white">
                        <ArrowRight size={24} />
                    </button>
                </div>

                <button
                    className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors active:scale-95"
                    onClick={() => setLevelIndex(prev => Math.min(prev + 1, levels.length - 1))}
                >
                    <div className="bg-slate-700 p-3 rounded-full border-b-4 border-slate-900">
                        <SkipForward size={24} />
                    </div>
                    <span className="text-xs font-bold">SKIP</span>
                </button>
            </div>

            {/* Coin Count Display at Bottom */}
            <div className="w-full bg-slate-900 p-3 rounded-b-xl border-t-2 border-slate-700 text-center">
                <p className="text-lg font-mono text-yellow-400">
                    💰 Coins: <span className="font-bold text-2xl">{coinCount}</span>
                </p>
            </div>

            {/* Retro Background Music */}
            <RetroBGM />
        </div>
    );
};

export default SokobanGame;

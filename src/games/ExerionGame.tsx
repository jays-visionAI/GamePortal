import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Zap, Bomb } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../contexts/AuthContext';

// Game Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SPEED = 0.5;
const FRICTION = 0.92;
const MAX_SPEED = 8;
const TOTAL_ROUNDS = 30;

// Enemy Types
const ENEMY_TYPES = {
    BASIC: 1, // Curve
    ZIGZAG: 2, // Zigzag
    TANK: 3, // Slow, High HP
    SHOOTER: 4, // Horizontal, Shoots
    BOSS: 5 // Boss
};

interface GameState {
    score: number;
    level: number;
    lives: number;
    isPlaying: boolean;
    isGameOver: boolean;
    isStageClear: boolean; // New state for transition
    bombCount: number;
    boosterTimer: number;
    bulletLevel: number; // 1, 2, 3
}

interface Enemy {
    x: number;
    y: number;
    vx: number;
    vy: number;
    type: number;
    hp: number;
    maxHp: number;
    width: number;
    height: number;
    timer: number;
}

interface Bullet {
    x: number;
    y: number;
    vx: number;
    vy: number;
    isPlayer: boolean;
    damage: number;
}

interface Item {
    x: number;
    y: number;
    vy: number;
    type: 'booster' | 'bomb' | 'health' | 'weapon';
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

const ExerionGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<GameState>({
        score: 0,
        level: 1,
        lives: 3,
        isPlaying: false,
        isGameOver: false,
        isStageClear: false,
        bombCount: 1,
        boosterTimer: 0,
        bulletLevel: 1
    });
    const { user } = useAuth();
    const navigate = useNavigate();

    // Refs for Game Logic
    const userRef = useRef(user);
    useEffect(() => { userRef.current = user; }, [user]);

    const requestRef = useRef<number>(0);
    const playerRef = useRef({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 100, vx: 0, vy: 0, width: 30, height: 30 });
    const keysPressed = useRef<{ [key: string]: boolean }>({});

    const bulletsRef = useRef<Bullet[]>([]);
    const enemiesRef = useRef<Enemy[]>([]);
    const itemsRef = useRef<Item[]>([]);
    const particlesRef = useRef<Particle[]>([]);

    const levelRef = useRef(1);
    const waveRef = useRef({
        enemiesToSpawn: 0,
        spawnTimer: 0,
        bossSpawned: false,
        levelFrame: 0,
        bombSpawnFrame: 0,
        healthSpawnFrame: 0,
        weaponSpawnFrame: 0
    });

    // Audio Context Ref (Lazy Init)
    const audioCtxRef = useRef<AudioContext | null>(null);

    // Sound Effects
    const playSound = useCallback((type: 'shoot' | 'explosion' | 'hit' | 'powerup' | 'bomb') => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        if (!audioCtxRef.current) {
            audioCtxRef.current = new AudioContext();
        }
        const ctx = audioCtxRef.current;

        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => { });
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'shoot') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'explosion') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'hit') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.05);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'powerup') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.linearRampToValueAtTime(880, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'bomb') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(50, now);
            osc.frequency.exponentialRampToValueAtTime(10, now + 1.0);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
            osc.start(now);
            osc.stop(now + 1.0);
        }
    }, []);

    // Save Score Helper
    const saveScore = async (score: number, level: number, completed: boolean) => {
        const currentUser = userRef.current;
        if (!currentUser) {
            console.warn("User not logged in, score not saved.");
            return;
        }
        if (score <= 0) return;

        try {
            await addDoc(collection(db, 'scores'), {
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Anonymous',
                userPhoto: currentUser.photoURL || '',
                gameId: 'exerion',
                level: level,
                score: score,
                moves: 0,
                createdAt: new Date().toISOString(),
                meta: {
                    type: 'shooter',
                    completed: completed
                }
            });
            console.log("Score saved successfully!", score);
        } catch (e) {
            console.error("Error saving score:", e);
        }
    };

    // Initialize Level
    const initLevel = useCallback((level: number) => {
        levelRef.current = level;
        const baseEnemies = 10 + level * 2;

        // Random spawn times for items
        const bombFrame = Math.floor(Math.random() * 900) + 300;
        const healthFrame = Math.floor(Math.random() * 900) + 300;
        const weaponFrame = Math.floor(Math.random() * 900) + 300;

        waveRef.current = {
            enemiesToSpawn: baseEnemies,
            spawnTimer: 0,
            bossSpawned: false,
            levelFrame: 0,
            bombSpawnFrame: bombFrame,
            healthSpawnFrame: healthFrame,
            weaponSpawnFrame: weaponFrame
        };
        enemiesRef.current = [];
        bulletsRef.current = [];
        itemsRef.current = [];

        setGameState(prev => ({ ...prev, level, isStageClear: false }));
    }, []);

    // Start Game
    const startGame = () => {
        setGameState(prev => ({
            ...prev,
            isPlaying: true,
            isGameOver: false,
            isStageClear: false,
            score: 0,
            level: 1,
            lives: 3,
            bombCount: 1,
            boosterTimer: 0,
            bulletLevel: 1
        }));
        playerRef.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 100, vx: 0, vy: 0, width: 30, height: 30 };
        particlesRef.current = [];
        initLevel(1);

        // Init Audio
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) audioCtxRef.current = new AudioContext();
        }
        if (audioCtxRef.current?.state === 'suspended') {
            audioCtxRef.current.resume().catch(() => { });
        }
    };

    // Spawn Enemy Logic
    const spawnEnemy = (type: number, level: number) => {
        let x = Math.random() * (CANVAS_WIDTH - 60) + 30;
        let y = -50;
        let vx = 0;
        let vy = 0;
        let hp = 1;
        let width = 30;
        let height = 30;

        const speedMult = 1 + (level - 1) * 0.03;
        const baseSpeed = 0.5;

        switch (type) {
            case ENEMY_TYPES.BASIC: // Curve
                hp = 1;
                vy = 2 * baseSpeed * speedMult;
                break;
            case ENEMY_TYPES.ZIGZAG: // Zigzag
                hp = 2;
                vy = 1.4 * baseSpeed * speedMult;
                vx = (Math.random() < 0.5 ? -1 : 1) * 2 * baseSpeed * speedMult;
                break;
            case ENEMY_TYPES.TANK: // Slow
                hp = 5;
                vy = 1 * baseSpeed * speedMult;
                width = 40;
                height = 40;
                break;
            case ENEMY_TYPES.SHOOTER: // Horizontal
                hp = 2;
                y = Math.random() * 200 + 50;
                x = Math.random() < 0.5 ? -30 : CANVAS_WIDTH + 30;
                vx = (x < 0 ? 1 : -1) * 3 * baseSpeed * speedMult;
                vy = 0;
                break;
            case ENEMY_TYPES.BOSS:
                hp = 10 * (1 + (level - 1) * 0.1);
                width = 120;
                height = 120;
                y = -150;
                vy = 1 * baseSpeed;
                break;
        }

        enemiesRef.current.push({
            x, y, vx, vy, type, hp, maxHp: hp, width, height, timer: 0
        });
    };

    // Game Logic Loop
    const update = useCallback(() => {
        if (!gameState.isPlaying || gameState.isGameOver || gameState.isStageClear) return;

        const player = playerRef.current;
        const level = levelRef.current;

        waveRef.current.levelFrame++;

        // --- Player Movement ---
        if (keysPressed.current['ArrowLeft']) player.vx -= PLAYER_SPEED;
        if (keysPressed.current['ArrowRight']) player.vx += PLAYER_SPEED;
        if (keysPressed.current['ArrowUp']) player.vy -= PLAYER_SPEED;
        if (keysPressed.current['ArrowDown']) player.vy += PLAYER_SPEED;

        player.vx *= FRICTION;
        player.vy *= FRICTION;
        player.vx = Math.max(Math.min(player.vx, MAX_SPEED), -MAX_SPEED);
        player.vy = Math.max(Math.min(player.vy, MAX_SPEED), -MAX_SPEED);
        player.x += player.vx;
        player.y += player.vy;

        // Boundaries
        if (player.x < 20) { player.x = 20; player.vx = 0; }
        if (player.x > CANVAS_WIDTH - 20) { player.x = CANVAS_WIDTH - 20; player.vx = 0; }
        if (player.y < 20) { player.y = 20; player.vy = 0; }
        if (player.y > CANVAS_HEIGHT - 20) { player.y = CANVAS_HEIGHT - 20; player.vy = 0; }

        // --- Booster Timer ---
        if (gameState.boosterTimer > 0) {
            setGameState(prev => ({ ...prev, boosterTimer: prev.boosterTimer - 1 }));
        }

        // --- Shooting ---
        if (keysPressed.current[' ']) {
            if (!keysPressed.current['lastShot'] || Date.now() - (keysPressed.current['lastShot'] as any) > 150) {
                const damage = gameState.boosterTimer > 0 ? 2 : 1;
                const bLevel = gameState.bulletLevel;

                // Bullet Patterns
                if (bLevel === 1) {
                    bulletsRef.current.push({ x: player.x, y: player.y - 20, vx: 0, vy: -12, isPlayer: true, damage });
                } else if (bLevel === 2) {
                    bulletsRef.current.push({ x: player.x - 10, y: player.y - 20, vx: -2, vy: -12, isPlayer: true, damage });
                    bulletsRef.current.push({ x: player.x + 10, y: player.y - 20, vx: 2, vy: -12, isPlayer: true, damage });
                } else if (bLevel >= 3) {
                    bulletsRef.current.push({ x: player.x, y: player.y - 20, vx: 0, vy: -12, isPlayer: true, damage });
                    bulletsRef.current.push({ x: player.x - 15, y: player.y - 20, vx: -3, vy: -11, isPlayer: true, damage });
                    bulletsRef.current.push({ x: player.x + 15, y: player.y - 20, vx: 3, vy: -11, isPlayer: true, damage });
                }

                playSound('shoot');
                keysPressed.current['lastShot'] = Date.now() as any;
            }
        }

        // --- Bomb Usage (Command/Ctrl) ---
        const isCommandPressed = keysPressed.current['Meta'] || keysPressed.current['Control'];
        if (isCommandPressed && gameState.bombCount > 0) {
            if (!keysPressed.current['bombUsed']) {
                setGameState(prev => ({ ...prev, bombCount: prev.bombCount - 1 }));
                playSound('bomb');

                enemiesRef.current.forEach(e => {
                    e.hp -= 5;
                });

                bulletsRef.current = bulletsRef.current.filter(b => b.isPlayer);

                for (let i = 0; i < 50; i++) {
                    particlesRef.current.push({
                        x: Math.random() * CANVAS_WIDTH,
                        y: Math.random() * CANVAS_HEIGHT,
                        vx: (Math.random() - 0.5) * 20,
                        vy: (Math.random() - 0.5) * 20,
                        life: 2.0,
                        color: '#ffffff'
                    });
                }
                keysPressed.current['bombUsed'] = true;
            }
        } else {
            keysPressed.current['bombUsed'] = false;
        }

        // --- Spawning Enemies ---
        if (waveRef.current.enemiesToSpawn > 0) {
            waveRef.current.spawnTimer++;
            if (waveRef.current.spawnTimer > 60) {
                const rand = Math.random();
                let type = ENEMY_TYPES.BASIC;
                if (rand < 0.3) type = ENEMY_TYPES.ZIGZAG;
                else if (rand < 0.5) type = ENEMY_TYPES.TANK;
                else if (rand < 0.7) type = ENEMY_TYPES.SHOOTER;

                spawnEnemy(type, level);
                waveRef.current.enemiesToSpawn--;
                waveRef.current.spawnTimer = 0;
            }
        } else if (enemiesRef.current.length === 0 && !waveRef.current.bossSpawned) {
            spawnEnemy(ENEMY_TYPES.BOSS, level);
            waveRef.current.bossSpawned = true;
        }

        // --- Spawning Items ---
        if (waveRef.current.levelFrame === waveRef.current.bombSpawnFrame) {
            itemsRef.current.push({ x: Math.random() * (CANVAS_WIDTH - 60) + 30, y: -30, vy: 1.5, type: 'bomb' });
        }
        if (waveRef.current.levelFrame === waveRef.current.healthSpawnFrame) {
            itemsRef.current.push({ x: Math.random() * (CANVAS_WIDTH - 60) + 30, y: -30, vy: 1.5, type: 'health' });
        }
        if (waveRef.current.levelFrame === waveRef.current.weaponSpawnFrame) {
            itemsRef.current.push({ x: Math.random() * (CANVAS_WIDTH - 60) + 30, y: -30, vy: 1.5, type: 'weapon' });
        }

        // --- Update Bullets ---
        bulletsRef.current.forEach(b => {
            b.x += b.vx;
            b.y += b.vy;
        });
        bulletsRef.current = bulletsRef.current.filter(b => b.y > -50 && b.y < CANVAS_HEIGHT + 50 && b.x > -50 && b.x < CANVAS_WIDTH + 50);

        // --- Update Enemies ---
        enemiesRef.current.forEach(e => {
            e.timer++;

            if (e.type === ENEMY_TYPES.BASIC) {
                e.x += Math.sin(e.timer * 0.05) * 2;
                e.y += e.vy;
            } else if (e.type === ENEMY_TYPES.ZIGZAG) {
                e.x += e.vx;
                e.y += e.vy;
                if (e.x < 30 || e.x > CANVAS_WIDTH - 30) e.vx *= -1;
            } else if (e.type === ENEMY_TYPES.TANK) {
                e.y += e.vy;
            } else if (e.type === ENEMY_TYPES.SHOOTER) {
                e.x += e.vx;
                if (e.x < -50 || e.x > CANVAS_WIDTH + 50) {
                    e.vx *= -1;
                }
                if (e.timer % 120 === 0) {
                    bulletsRef.current.push({
                        x: e.x, y: e.y + 20, vx: 0, vy: 2, isPlayer: false, damage: 1
                    });
                }
            } else if (e.type === ENEMY_TYPES.BOSS) {
                if (e.y < 100) e.y += e.vy;
                else {
                    e.x += Math.sin(e.timer * 0.02) * 2;
                }

                if (e.timer % 100 === 0) {
                    for (let i = -2; i <= 2; i++) {
                        bulletsRef.current.push({
                            x: e.x, y: e.y + 60,
                            vx: i * 1, vy: 2.5,
                            isPlayer: false, damage: 1
                        });
                    }
                }
            }

            if (e.type !== ENEMY_TYPES.SHOOTER && e.type !== ENEMY_TYPES.BOSS) {
                if (e.y > CANVAS_HEIGHT + 50) {
                    e.y = -50;
                    e.x = Math.random() * (CANVAS_WIDTH - 60) + 30;
                }
            }
        });

        // --- Update Items ---
        itemsRef.current.forEach(i => {
            i.y += i.vy;
        });
        itemsRef.current = itemsRef.current.filter(i => i.y < CANVAS_HEIGHT + 50);

        // --- Collision Detection ---

        bulletsRef.current.filter(b => b.isPlayer).forEach(b => {
            enemiesRef.current.forEach((e) => {
                if (Math.abs(b.x - e.x) < e.width / 2 + 5 && Math.abs(b.y - e.y) < e.height / 2 + 5) {
                    b.y = -1000;
                    e.hp -= b.damage;
                    playSound('hit');

                    if (e.hp <= 0) {
                        const points = e.maxHp * 10;
                        setGameState(prev => ({ ...prev, score: prev.score + points }));

                        if (Math.random() < 0.1) {
                            itemsRef.current.push({
                                x: e.x, y: e.y, vy: 2,
                                type: 'booster'
                            });
                        }

                        for (let i = 0; i < 10; i++) {
                            particlesRef.current.push({
                                x: e.x, y: e.y,
                                vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
                                life: 1.0, color: '#ffaa00'
                            });
                        }
                        playSound('explosion');
                    }
                }
            });
        });

        enemiesRef.current = enemiesRef.current.filter(e => e.hp > 0);

        const checkPlayerCollision = (x: number, y: number, radius: number) => {
            return Math.abs(x - player.x) < radius + player.width / 2 && Math.abs(y - player.y) < radius + player.height / 2;
        };

        bulletsRef.current.filter(b => !b.isPlayer).forEach(b => {
            if (checkPlayerCollision(b.x, b.y, 5)) {
                b.y = CANVAS_HEIGHT + 1000;
                handlePlayerHit();
            }
        });

        enemiesRef.current.forEach(e => {
            if (checkPlayerCollision(e.x, e.y, e.width / 2)) {
                e.hp = 0;
                handlePlayerHit();
            }
        });

        // Items vs Player
        itemsRef.current.forEach((item, idx) => {
            if (checkPlayerCollision(item.x, item.y, 15)) {
                if (item.type === 'booster') {
                    setGameState(prev => ({ ...prev, boosterTimer: 600 }));
                } else if (item.type === 'bomb') {
                    setGameState(prev => ({ ...prev, bombCount: prev.bombCount + 1 }));
                } else if (item.type === 'health') {
                    setGameState(prev => ({ ...prev, lives: prev.lives + 1 }));
                } else if (item.type === 'weapon') {
                    setGameState(prev => ({ ...prev, bulletLevel: Math.min(prev.bulletLevel + 1, 3) }));
                }
                playSound('powerup');
                itemsRef.current.splice(idx, 1);
            }
        });

        // --- Level Complete ---
        if (enemiesRef.current.length === 0 && waveRef.current.enemiesToSpawn === 0 && waveRef.current.bossSpawned) {
            if (levelRef.current < TOTAL_ROUNDS) {
                // Stage Clear Transition
                setGameState(prev => ({ ...prev, isStageClear: true }));
            } else {
                setGameState(prev => {
                    if (!prev.isGameOver) {
                        saveScore(prev.score, TOTAL_ROUNDS, true);
                    }
                    return { ...prev, isGameOver: true };
                });
                alert("CONGRATULATIONS! ALL MISSIONS CLEARED!");
            }
        }

        // --- Update Particles ---
        particlesRef.current.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
        });
        particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    }, [gameState.isPlaying, gameState.isGameOver, gameState.isStageClear, initLevel, playSound]);

    const handlePlayerHit = () => {
        setGameState(prev => {
            const newLives = prev.lives - 1;
            if (newLives <= 0) {
                if (!prev.isGameOver) {
                    saveScore(prev.score, levelRef.current, false);
                }
                return { ...prev, lives: 0, isGameOver: true, isPlaying: false };
            }
            // Reset bullet level on death
            return { ...prev, lives: newLives, bulletLevel: 1 };
        });
        playerRef.current.x = CANVAS_WIDTH / 2;
        playerRef.current.y = CANVAS_HEIGHT - 100;
        playerRef.current.vx = 0;
        playerRef.current.vy = 0;
        playSound('explosion');

        bulletsRef.current = [];
        enemiesRef.current = enemiesRef.current.filter(en => Math.abs(en.y - playerRef.current.y) > 200);
    };

    // Rendering
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear Canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw Background (Pseudo-3D Grid)
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        const time = Date.now() / 1000;

        ctx.beginPath();
        for (let i = 0; i < 20; i++) {
            const y = (i * 50 + time * 100) % CANVAS_HEIGHT;
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
        }
        for (let i = 0; i < 10; i++) {
            const x = i * (CANVAS_WIDTH / 8);
            ctx.moveTo(CANVAS_WIDTH / 2 + (x - CANVAS_WIDTH / 2) * 0.2, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
        }
        ctx.stroke();

        // Draw Particles
        particlesRef.current.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });

        // Draw Items
        itemsRef.current.forEach(i => {
            if (i.type === 'booster') ctx.fillStyle = '#00ff00';
            else if (i.type === 'bomb') ctx.fillStyle = '#ff0000';
            else if (i.type === 'health') ctx.fillStyle = '#ff69b4';
            else if (i.type === 'weapon') ctx.fillStyle = '#00ffff'; // Cyan for Weapon

            ctx.beginPath();
            ctx.arc(i.x, i.y, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            let label = 'P';
            if (i.type === 'bomb') label = '💣';
            if (i.type === 'health') label = '♥';
            if (i.type === 'weapon') label = '🚀';
            ctx.fillText(label, i.x, i.y + 4);
        });

        // Draw Bullets
        bulletsRef.current.forEach(b => {
            ctx.fillStyle = b.isPlayer ? (b.damage > 1 ? '#00ff00' : '#ffff00') : '#ff0000';
            ctx.fillRect(b.x - 2, b.y - 5, 4, 10);
        });

        // Draw Enemies
        enemiesRef.current.forEach(e => {
            ctx.save();
            ctx.translate(e.x, e.y);

            if (e.type === ENEMY_TYPES.BASIC) ctx.fillStyle = '#ff0000';
            else if (e.type === ENEMY_TYPES.ZIGZAG) ctx.fillStyle = '#ff00ff';
            else if (e.type === ENEMY_TYPES.TANK) ctx.fillStyle = '#0000ff';
            else if (e.type === ENEMY_TYPES.SHOOTER) ctx.fillStyle = '#ffff00';
            else if (e.type === ENEMY_TYPES.BOSS) ctx.fillStyle = '#ffffff';

            if (e.type === ENEMY_TYPES.BOSS) {
                ctx.fillRect(-e.width / 2, -e.height / 2, e.width, e.height);
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(-e.width / 2, -e.height / 2 - 10, e.width, 5);
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(-e.width / 2, -e.height / 2 - 10, e.width * (e.hp / e.maxHp), 5);
            } else {
                ctx.beginPath();
                ctx.moveTo(0, e.height / 2);
                ctx.lineTo(e.width / 2, -e.height / 2);
                ctx.lineTo(-e.width / 2, -e.height / 2);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        });

        // Draw Player
        const player = playerRef.current;
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.vx * 0.05);

        if (gameState.boosterTimer > 0) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ff00';
        }

        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(15, 15);
        ctx.lineTo(0, 10);
        ctx.lineTo(-15, 15);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;

        if (Math.random() > 0.5) {
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.moveTo(-5, 15);
            ctx.lineTo(0, 25 + Math.random() * 10);
            ctx.lineTo(5, 15);
            ctx.fill();
        }
        ctx.restore();

        if (gameState.isGameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = '#ffffff';
            ctx.font = '48px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            ctx.font = '24px monospace';
            ctx.fillText(`Final Score: ${gameState.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
            ctx.fillText('Press SPACE to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100);
        }

        // Stage Clear Screen
        if (gameState.isStageClear) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = '#00ff00';
            ctx.font = '48px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`STAGE ${gameState.level} CLEARED!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px monospace';
            ctx.fillText(`Current Score: ${gameState.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
            ctx.fillStyle = '#ffff00';
            ctx.fillText('Press SPACE to proceed', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
        }

    }, [gameState]);

    // Main Loop
    const loop = useCallback(() => {
        update();
        draw();
        requestRef.current = requestAnimationFrame(loop);
    }, [update, draw]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(loop);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [loop]);

    // Keyboard Events
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent default scrolling for game control keys
            if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }

            keysPressed.current[e.key] = true;

            if (gameState.isGameOver && e.key === ' ') {
                startGame();
            }
            if (gameState.isStageClear && e.key === ' ') {
                // Proceed to next level
                initLevel(levelRef.current + 1);
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            // Prevent default scrolling for game control keys
            if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }

            keysPressed.current[e.key] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameState.isGameOver, gameState.isStageClear, initLevel]);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl mb-4 flex justify-between items-center text-white">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
                    <ArrowLeft /> Back to Home
                </button>
                <div className="flex gap-8 font-mono text-xl">
                    <div>SCORE: <span className="text-yellow-400">{gameState.score}</span></div>
                    <div>LEVEL: <span className="text-green-400">{gameState.level}/{TOTAL_ROUNDS}</span></div>
                    <div>LIVES: <span className="text-red-400">{'♥'.repeat(gameState.lives)}</span></div>
                </div>
            </div>

            <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="bg-black block"
                />

                {/* UI Overlay for Items */}
                <div className="absolute top-4 left-4 flex gap-4">
                    <div className={`flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full border ${gameState.boosterTimer > 0 ? 'border-green-500 text-green-400' : 'border-slate-600 text-slate-500'}`}>
                        <Zap size={16} fill={gameState.boosterTimer > 0 ? "currentColor" : "none"} />
                        <span className="font-mono font-bold">BOOSTER {gameState.boosterTimer > 0 ? Math.ceil(gameState.boosterTimer / 60) : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full border border-red-500/50 text-red-400">
                        <Bomb size={16} />
                        <span className="font-mono font-bold">BOMB x{gameState.bombCount} [CMD]</span>
                    </div>
                </div>

                {!gameState.isPlaying && !gameState.isGameOver && !gameState.isStageClear && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-blue-600 mb-4 italic tracking-tighter">
                            EXERION
                        </h1>
                        <p className="mb-8 text-slate-300 text-center max-w-md">
                            Use Arrow Keys to Move<br />
                            Space to Shoot<br />
                            'CMD/CTRL' to use Bomb
                        </p>
                        <button
                            onClick={startGame}
                            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-full font-bold text-xl transition-all hover:scale-105 active:scale-95"
                        >
                            <Play fill="currentColor" /> START GAME
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerionGame;

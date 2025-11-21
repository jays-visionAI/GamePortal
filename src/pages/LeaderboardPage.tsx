import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Trophy, Medal, Award } from 'lucide-react';
import { levels } from '../games/sokoban/levels';

interface ScoreEntry {
    id: string;
    userId: string;
    userName: string;
    userPhoto: string;
    gameId: string;
    level: number;
    score: number;
    moves: number;
    createdAt: string;
}

const GAMES = [
    { id: 'sokoban', name: 'Sokoban', scoreLabel: 'Time' }
    // Add more games here as they are implemented
];

const LeaderboardPage: React.FC = () => {
    const [selectedGame, setSelectedGame] = useState('sokoban');
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [scores, setScores] = useState<ScoreEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            setLoading(true);
            try {
                const scoresRef = collection(db, 'scores');
                // Remove orderBy to avoid needing a composite index immediately
                let q = query(
                    scoresRef,
                    where('gameId', '==', selectedGame)
                );

                // Add level filter for Sokoban
                if (selectedGame === 'sokoban') {
                    q = query(
                        scoresRef,
                        where('gameId', '==', selectedGame),
                        where('level', '==', selectedLevel)
                    );
                }

                const querySnapshot = await getDocs(q);
                const fetchedScores: ScoreEntry[] = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    fetchedScores.push({
                        id: doc.id,
                        userId: data.userId || 'unknown',
                        userName: data.userName || 'Anonymous',
                        userPhoto: data.userPhoto || '',
                        gameId: data.gameId || selectedGame,
                        level: data.level || 0,
                        score: typeof data.score === 'number' ? data.score : 999999,
                        moves: data.moves || 0,
                        createdAt: data.createdAt || new Date().toISOString()
                    } as ScoreEntry);
                });

                // Client-side sort and limit
                fetchedScores.sort((a, b) => a.score - b.score);
                setScores(fetchedScores.slice(0, 20));
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, [selectedGame, selectedLevel]);

    const formatTime = (seconds: number) => {
        if (typeof seconds !== 'number') return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return '-';
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return '-';
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (e) {
            return '-';
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="text-yellow-400" size={24} />;
            case 2:
                return <Medal className="text-slate-300" size={24} />;
            case 3:
                return <Award className="text-amber-600" size={24} />;
            default:
                return <span className="text-slate-500 font-bold text-lg">{rank}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 mb-2 tracking-tight">
                        🏆 LEADERBOARD
                    </h1>
                    <p className="text-slate-400 text-lg">Top 20 Players</p>
                </div>

                {/* Game Selector */}
                <div className="flex justify-center gap-4 mb-4">
                    {GAMES.map((game) => (
                        <button
                            key={game.id}
                            onClick={() => setSelectedGame(game.id)}
                            className={`px-6 py-3 rounded-lg font-bold transition-all border-b-4 ${selectedGame === game.id
                                ? 'bg-indigo-600 text-white border-indigo-800 scale-105'
                                : 'bg-slate-700 text-slate-300 border-slate-900 hover:bg-slate-600'
                                }`}
                        >
                            {game.name}
                        </button>
                    ))}
                </div>

                {/* Level Selector (Only for Sokoban) */}
                {selectedGame === 'sokoban' && (
                    <div className="flex justify-center gap-2 mb-8 flex-wrap max-w-3xl mx-auto">
                        {levels.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedLevel(index + 1)}
                                className={`w-10 h-10 rounded-lg font-bold transition-all border-b-4 flex items-center justify-center ${selectedLevel === index + 1
                                    ? 'bg-yellow-500 text-black border-yellow-700 scale-110'
                                    : 'bg-slate-800 text-slate-400 border-slate-950 hover:bg-slate-700'
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                )}

                {/* Leaderboard Table */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border-2 border-slate-700 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-slate-900 px-6 py-4 grid grid-cols-12 gap-4 text-slate-400 text-sm font-bold uppercase border-b-2 border-slate-700">
                        <div className="col-span-1">Rank</div>
                        <div className="col-span-4">Player</div>
                        <div className="col-span-1">Level</div>
                        <div className="col-span-2">Time</div>
                        <div className="col-span-2">Moves</div>
                        <div className="col-span-2">Date</div>
                    </div>

                    {/* Table Body */}
                    {loading ? (
                        <div className="text-center py-12 text-slate-400">
                            <div className="animate-pulse">Loading scores...</div>
                        </div>
                    ) : scores.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p className="text-xl">No scores yet!</p>
                            <p className="text-sm mt-2">Be the first to play and set a record!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700">
                            {scores.map((score, index) => (
                                <div
                                    key={score.id}
                                    className={`px-6 py-4 grid grid-cols-12 gap-4 items-center transition-colors ${index < 3 ? 'bg-slate-700/30' : 'hover:bg-slate-700/20'
                                        }`}
                                >
                                    {/* Rank */}
                                    <div className="col-span-1 flex items-center justify-center">
                                        {getRankIcon(index + 1)}
                                    </div>

                                    {/* Player */}
                                    <div className="col-span-4 flex items-center gap-3">
                                        {score.userPhoto ? (
                                            <img
                                                src={score.userPhoto}
                                                alt={score.userName}
                                                className="w-10 h-10 rounded-full border-2 border-slate-600"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold">
                                                {score.userName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-white font-semibold truncate">
                                            {score.userName}
                                        </span>
                                    </div>

                                    {/* Level */}
                                    <div className="col-span-1 text-yellow-400 font-mono font-bold">
                                        {score.level}
                                    </div>

                                    {/* Time */}
                                    <div className="col-span-2 text-green-400 font-mono font-bold">
                                        {formatTime(score.score)}
                                    </div>

                                    {/* Moves */}
                                    <div className="col-span-2 text-blue-400 font-mono">
                                        {score.moves}
                                    </div>

                                    {/* Date */}
                                    <div className="col-span-2 text-slate-400 text-sm">
                                        {formatDate(score.createdAt)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Back to Home */}
                <div className="text-center mt-8">
                    <a
                        href="/"
                        className="inline-block bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-bold transition-all border-b-4 border-slate-900"
                    >
                        ← BACK TO GAMES
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SokobanGame from '../games/SokobanGame';

const GameDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    // Map ID to game component
    const renderGame = () => {
        switch (id) {
            case 'sokoban':
                return <SokobanGame />;
            default:
                return (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-red-500">GAME NOT FOUND</h2>
                        <p className="text-slate-400">The cartridge seems to be missing.</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 pt-20 pb-10 px-4">
            <div className="container mx-auto max-w-4xl">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={20} />
                    BACK TO ARCADE
                </Link>

                <div className="bg-slate-900 border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                    {/* Arcade Header */}
                    <div className="bg-slate-800 p-4 border-b-4 border-slate-950 flex justify-between items-center">
                        <h1 className="text-xl font-bold text-indigo-400 uppercase tracking-widest">
                            {id?.replace('-', ' ')}
                        </h1>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                    </div>

                    {/* Game Area */}
                    <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                        {renderGame()}
                    </div>

                    {/* Arcade Controls Decoration */}
                    <div className="bg-slate-800 p-6 border-t-4 border-slate-950">
                        <div className="flex justify-between items-center opacity-50 pointer-events-none">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-red-600 border-b-4 border-red-800"></div>
                                <div className="w-12 h-12 rounded-full bg-blue-600 border-b-4 border-blue-800"></div>
                            </div>
                            <div className="w-24 h-24 bg-slate-700 rounded-full border-4 border-slate-600 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameDetailPage;

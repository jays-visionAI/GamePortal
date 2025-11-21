import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad, Trophy, Users, ArrowRight } from 'lucide-react';

const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 sm:py-32">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/80 to-slate-950"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-block mb-4 px-4 py-1 bg-indigo-900/50 border border-indigo-500/30 rounded-full backdrop-blur-sm">
                        <span className="text-indigo-300 font-mono text-sm">READY PLAYER ONE?</span>
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-lg">
                        ENTER THE <br />
                        <span className="text-indigo-500">RETRO VERSE</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Relive the golden age of arcade gaming. Challenge your friends, climb the leaderboards, and experience the nostalgia of 8-bit glory directly in your browser.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="#games" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 flex items-center gap-2">
                            <Gamepad className="w-6 h-6" />
                            PLAY NOW
                        </a>
                        <button className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 flex items-center gap-2">
                            <Trophy className="w-6 h-6" />
                            LEADERBOARD
                        </button>
                    </div>
                </div>
            </section>

            {/* Game Grid Section */}
            <section id="games" className="container mx-auto px-4 py-16">
                <div className="flex items-end justify-between mb-10 border-b border-slate-800 pb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                            FEATURED GAMES
                        </h2>
                        <p className="text-slate-400">Select a cartridge to start playing</p>
                    </div>
                    <div className="hidden sm:flex gap-2">
                        {/* Filters could go here */}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Game Card 1: Sokoban */}
                    <Link to="/game/sokoban" className="group relative bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-800 hover:border-indigo-500 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20">
                        <div className="aspect-video bg-slate-800 relative overflow-hidden">
                            <div className="absolute inset-0 bg-indigo-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1614294148960-9aa740632360?auto=format&fit=crop&q=80"
                                alt="Sokoban"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur text-xs font-bold px-2 py-1 rounded text-yellow-400 border border-yellow-500/30 z-20">
                                PUZZLE
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">SOKOBAN</h3>
                            <p className="text-slate-400 text-sm mb-4 line-clamp-2">Classic warehouse keeper puzzle. Push boxes to their designated spots.</p>
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Users size={14} />
                                    <span>1.2k plays</span>
                                </div>
                                <span className="text-indigo-400 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    PLAY <ArrowRight size={14} />
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Placeholder Cards */}
                    {['Sky Shooter', 'Barrel Jumper', 'Xrion Style'].map((game, idx) => (
                        <div key={idx} className="group relative bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                            <div className="aspect-video bg-slate-800 relative flex items-center justify-center">
                                <span className="text-4xl font-black text-slate-700 rotate-12 border-4 border-slate-700 p-2 rounded-lg">COMING SOON</span>
                            </div>
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-white mb-1">{game.toUpperCase()}</h3>
                                <p className="text-slate-400 text-sm mb-4">Under development.</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;

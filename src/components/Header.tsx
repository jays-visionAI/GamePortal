import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Gamepad2, LogIn, LogOut, Trophy } from 'lucide-react';

const Header: React.FC = () => {
    const { user, signInWithGoogle, logout } = useAuth();

    return (
        <header className="bg-slate-900 border-b-4 border-indigo-500 p-4 text-white sticky top-0 z-50 shadow-lg shadow-indigo-500/20">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-500 transition-colors">
                        <Gamepad2 size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tighter uppercase bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
                        Retro Game Portal
                    </h1>
                </Link>

                <nav className="flex items-center gap-4">
                    {/* Leaderboard Link */}
                    <Link
                        to="/leaderboard"
                        className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded font-bold transition-all active:scale-95 border-b-4 border-yellow-800 hover:border-yellow-900"
                    >
                        <Trophy size={18} />
                        <span className="hidden sm:inline">LEADERBOARD</span>
                    </Link>

                    {/* Login/Logout */}
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                                {user.photoURL && (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName || 'User'}
                                        className="w-8 h-8 rounded-full border-2 border-indigo-400"
                                    />
                                )}
                                <span className="text-sm font-medium text-slate-300 hidden sm:block">
                                    {user.displayName}
                                </span>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition-all active:scale-95 border-b-4 border-red-800 hover:border-red-900"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline">LOGOUT</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={signInWithGoogle}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-bold transition-all active:scale-95 border-b-4 border-indigo-800 hover:border-indigo-900"
                        >
                            <LogIn size={18} />
                            <span>LOGIN</span>
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;

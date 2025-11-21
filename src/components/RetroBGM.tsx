import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const RetroBGM: React.FC = () => {
    const [isMuted, setIsMuted] = useState(false); // Start unmuted, but audio context might be suspended
    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const isPlayingRef = useRef(false);
    const noteIndexRef = useRef(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMutedRef = useRef(false); // Ref to track mute state in loop

    // Sync ref with state
    useEffect(() => {
        isMutedRef.current = isMuted;
        if (!isMuted && audioContextRef.current?.state === 'running' && !isPlayingRef.current) {
            isPlayingRef.current = true;
            playNote();
        } else if (isMuted) {
            stopAudio();
        }
    }, [isMuted]);

    // Simple retro melody (frequencies in Hz)
    const melody = [
        110, 110, 130, 146, 164, 146, 130, 110, // A2 sequence
        98, 98, 110, 130, 146, 130, 110, 98,    // G2 sequence
        82, 82, 98, 110, 130, 110, 98, 82,      // E2 sequence
        110, 110, 130, 146, 164, 146, 130, 110  // A2 sequence
    ];

    const noteDuration = 200; // ms

    const playNote = () => {
        if (isMutedRef.current) {
            isPlayingRef.current = false;
            return;
        }

        if (!audioContextRef.current) {
            initAudio();
        }

        if (audioContextRef.current && gainNodeRef.current) {
            // Create oscillator
            const osc = audioContextRef.current.createOscillator();
            const gain = audioContextRef.current.createGain();

            osc.type = 'square'; // Retro 8-bit sound
            osc.frequency.value = melody[noteIndexRef.current];

            // Envelope for short, plucky sound
            gain.gain.setValueAtTime(0.05, audioContextRef.current.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(gainNodeRef.current);

            osc.start();
            osc.stop(audioContextRef.current.currentTime + 0.15);

            // Next note
            noteIndexRef.current = (noteIndexRef.current + 1) % melody.length;

            // Schedule next note
            timeoutRef.current = setTimeout(playNote, noteDuration);
        }
    };

    const initAudio = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Master gain
            const masterGain = audioContextRef.current.createGain();
            masterGain.gain.value = 0.1; // Keep volume low
            masterGain.connect(audioContextRef.current.destination);
            gainNodeRef.current = masterGain;
        }
    };

    const startAudio = () => {
        initAudio();

        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }

        if (!isPlayingRef.current && !isMutedRef.current) {
            isPlayingRef.current = true;
            playNote();
        }
    };

    const stopAudio = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        isPlayingRef.current = false;
    };

    const toggleMute = () => {
        setIsMuted(prev => !prev);
    };

    // Handle autoplay policy
    useEffect(() => {
        const handleUserInteraction = () => {
            startAudio();
            // Remove listener after first interaction
            window.removeEventListener('click', handleUserInteraction);
            window.removeEventListener('keydown', handleUserInteraction);
        };

        window.addEventListener('click', handleUserInteraction);
        window.addEventListener('keydown', handleUserInteraction);

        return () => {
            stopAudio();
            window.removeEventListener('click', handleUserInteraction);
            window.removeEventListener('keydown', handleUserInteraction);
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    return (
        <button
            onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the global listener again unnecessarily
                toggleMute();
            }}
            className="fixed bottom-4 right-4 bg-slate-800 p-3 rounded-full border-2 border-slate-600 text-slate-400 hover:text-white hover:border-white transition-all z-50 shadow-lg"
            title={isMuted ? "Unmute BGM" : "Mute BGM"}
        >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
    );
};

export default RetroBGM;

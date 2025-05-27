import React, { useState, useEffect, useCallback } from 'react';
import './music-player.css';

function BackgroundGradient({ colors }) {
    if (colors.length === 0) return null;
    
    const gradientStyle = colors.length === 1
        ? { backgroundColor: colors[0] }
        : {
            backgroundImage: `linear-gradient(to bottom, ${colors.map((color, index) => {
                const percentage = (index / (colors.length - 1)) * 100;
                return `${color} ${percentage}%`;
            }).join(', ')})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat'
        };
    
    return <div className="background-gradient" style={gradientStyle} />;
}

function App() {
    const [songs, setSongs] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const getMoodAndColor = useCallback(async (songTitle) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/analyze-song`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ songTitle })
            });

            if (!response.ok) throw new Error('Song not found');
            const { umore: mood } = await response.json();
            return mood;
        } catch (error) {
            throw new Error('Song not found');
        }
    }, []);

    const generateColorFromMood = useCallback((mood, songTitle = '') => {
        const moodColors = {
            // Mood tristi/scuri
            'triste': 'hsl(240, 40%, 20%)',      // Blu scuro
            'malinconico': 'hsl(280, 30%, 25%)', // Viola scuro
            'drammatico': 'hsl(260, 35%, 23%)',  // Viola più scuro
            
            // Mood calmi/rilassanti
            'calmo': 'hsl(180, 40%, 40%)',       // Teal
            'rilassante': 'hsl(140, 40%, 50%)',  // Verde
            'ambient': 'hsl(190, 35%, 45%)',     // Blu chiaro
            
            // Mood allegri/energetici
            'allegro': 'hsl(60, 70%, 60%)',      // Giallo
            'energetico': 'hsl(0, 80%, 50%)',    // Rosso
            'aggressivo': 'hsl(0, 70%, 40%)',    // Rosso scuro
            
            // Generi specifici
            'pop': 'hsl(320, 70%, 60%)',         // Rosa
            'rock': 'hsl(0, 65%, 45%)',          // Rosso scuro
            'jazz': 'hsl(30, 60%, 45%)',         // Arancione
            'classica': 'hsl(210, 40%, 45%)',    // Blu medio
            'elettronica': 'hsl(280, 60%, 55%)', // Viola brillante
            
            // Mood neutri
            'neutro': 'hsl(200, 30%, 40%)'       // Blu grigiastro (default)
        };
        
        // Calcola una variazione basata sul titolo della canzone
        const hash = songTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const baseColor = moodColors[mood.toLowerCase()] || 'hsl(200, 30%, 40%)';
        
        // Estrai i componenti HSL dal colore base
        const [h, s, l] = baseColor.match(/\d+/g).map(Number);
        
        // Aggiungi una leggera variazione basata sul hash
        const newHue = ((h + (hash % 20) - 10) + 360) % 360; // ±10 gradi di variazione
        const newSat = Math.max(20, Math.min(80, s + ((hash % 10) - 5))); // ±5% di saturazione
        const newLight = Math.max(10, Math.min(70, l + ((hash % 10) - 5))); // ±5% di luminosità
        
        return `hsl(${newHue}, ${newSat}%, ${newLight}%)`;
    }, []);

    const addSong = async () => {
        if (!inputValue.trim() || isLoading) return;
        if (songs.length >= 8) {
            setError('Max 8 songs');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const mood = await getMoodAndColor(inputValue);
            const color = generateColorFromMood(mood, inputValue.trim());
            setSongs(prev => [...prev, { title: inputValue.trim(), color }]);
            setInputValue('');
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const removeSong = (index) => {
        setSongs(prev => prev.filter((_, i) => i !== index));
        setError('');
    };

    const gradientColors = songs.map(song => song.color);

    return (
        <main className="music-player">
            <BackgroundGradient colors={gradientColors} />
            
            <div className="content">
                {songs.map((song, index) => (
                    <div className="song-item" key={index}>
                        <span className="song-title">{song.title}</span>
                        <button
                            className="remove-button"
                            onClick={() => removeSong(index)}
                            aria-label="Remove song"
                        >
                            ×
                        </button>
                    </div>
                ))}

                {songs.length < 8 && (
                    <div className="song-input">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addSong()}
                            placeholder="Add a song..."
                            disabled={isLoading}
                        />
                        <button
                            onClick={addSong}
                            disabled={!inputValue.trim() || isLoading}
                        >
                            {isLoading ? '...' : '+'}
                        </button>
                    </div>
                )}

                {error && <div className="error">{error}</div>}
            </div>
        </main>
    );
}

export default App;

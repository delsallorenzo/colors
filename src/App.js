import React, { useState, useEffect, useRef, useCallback } from 'react';

// Ensure Tailwind CSS is loaded (implicitly available in Canvas React apps)

function App() {
    const [songs, setSongs] = useState([]);
    const [currentSongTitle, setCurrentSongTitle] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isProcessingSongs, setIsProcessingSongs] = useState(false);
    const [gradientColors, setGradientColors] = useState([]);

    const addSong = () => {
        if (currentSongTitle.trim() === '') {
            setErrorMessage('Il titolo della canzone non può essere vuoto.');
            return;
        }
        if (songs.length >= 8) {
            setErrorMessage('Puoi inserire un massimo di 8 canzoni.');
            return;
        }
        setSongs([...songs, { title: currentSongTitle.trim(), genre: '', color: '' }]);
        setCurrentSongTitle('');
        setErrorMessage('');
    };

    const removeSong = (indexToRemove) => {
        setSongs(songs.filter((_, index) => index !== indexToRemove));
        setErrorMessage(''); // Clear error if songs count changes
    };

    const getMoodAndColor = useCallback(async (songTitle) => {
        try {
            const prompt = `Data la canzone intitolata '${songTitle}', qual è il suo genere probabile e che tipo di umore o tavolozza di colori (es. 'vivace', 'scuro', 'calmo', 'energetico', 'malinconico', 'rilassante', 'allegro', 'aggressivo') la rappresenterebbe meglio? Rispondi in formato JSON con 'genere' e 'umore'.`;
            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            "genere": { "type": "STRING" },
                            "umore": { "type": "STRING" }
                        },
                        "propertyOrdering": ["genere", "umore"]
                    }
                }
            };

            const apiKey = "AIzaSyC6wmCvhlUu8Icx7f0GvJlRZOINxnag97o"; // Canvas will provide this
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                throw new Error(`Errore API: ${response.status} ${errorData.error?.message || response.statusText}`);
            }

            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const jsonString = result.candidates[0].content.parts[0].text;
                try {
                    const parsedJson = JSON.parse(jsonString);
                    return parsedJson;
                } catch (parseError) {
                    console.error("Failed to parse JSON from API response:", jsonString, parseError);
                    // Fallback to a default mood if parsing fails
                    return { genere: 'Sconosciuto', umore: 'neutro' };
                }
            } else {
                console.warn("No content in API response:", result);
                return { genere: 'Sconosciuto', umore: 'neutro' };
            }
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setErrorMessage(`Errore nel recupero del genere/umore per "${songTitle}".`);
            return { genere: 'Sconosciuto', umore: 'neutro' }; // Return default on error
        }
    }, []);

    const generateColorFromMood = (mood) => {
        let h, s, l;
        const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        switch (mood.toLowerCase()) {
            case 'vivace': // Pop, allegro
            case 'allegro':
                h = random(0, 360); // Full spectrum
                s = random(70, 95); // High saturation
                l = random(60, 80); // Brightness
                break;
            case 'scuro': // Triste, malinconico
            case 'malinconico':
                h = random(200, 280); // Blues, purples
                s = random(20, 50); // Low saturation
                l = random(20, 40); // Dark
                break;
            case 'calmo': // Rilassante, chill
            case 'rilassante':
                h = random(100, 200); // Greens, blues
                s = random(40, 70); // Medium saturation
                l = random(50, 75); // Medium brightness
                break;
            case 'energetico': // Rock, aggressivo
            case 'aggressivo':
                h = random(0, 60); // Reds, oranges
                s = random(60, 90); // High saturation
                l = random(40, 60); // Medium-dark brightness
                break;
            default: // Neutro or unknown
                h = random(0, 360);
                s = random(10, 30); // Low saturation
                l = random(50, 70); // Medium brightness
                break;
        }
        return `hsl(${h}, ${s}%, ${l}%)`;
    };

    const processSongs = async () => {
        if (songs.length < 3) {
            setErrorMessage('Devi inserire almeno 3 canzoni.');
            return;
        }
        setIsProcessingSongs(true);
        setErrorMessage('');

        // Lancia tutte le chiamate in parallelo
        const results = await Promise.all(
            songs.map(song => getMoodAndColor(song.title))
        );

        const updatedSongs = [];
        const colors = [];

        results.forEach((result, idx) => {
            const { genere, umore } = result;
            const color = generateColorFromMood(umore);
            updatedSongs.push({ ...songs[idx], genre: genere, color: color });
            colors.push(color);
        });

        setSongs(updatedSongs);
        setGradientColors(colors);
        setIsProcessingSongs(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-inter flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
                <h1 className="text-3xl font-bold text-center mb-6 text-blue-400">La Tua Playlist di Colori</h1>

                <div className="mb-4">
                    <label htmlFor="song-input" className="block text-sm font-medium text-gray-300 mb-2">
                        Aggiungi un titolo di canzone (da 3 a 8):
                    </label>
                    <div className="flex space-x-2">
                        <input
                            id="song-input"
                            type="text"
                            value={currentSongTitle}
                            onChange={(e) => setCurrentSongTitle(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') addSong();
                            }}
                            placeholder="Nome della canzone..."
                            className="flex-grow p-3 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                        />
                        <button
                            onClick={addSong}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out shadow-md"
                            disabled={songs.length >= 8}
                        >
                            Aggiungi
                        </button>
                    </div>
                    {errorMessage && <p className="text-red-400 text-sm mt-2">{errorMessage}</p>}
                </div>

                {songs.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-300 mb-3">Canzoni Selezionate:</h2>
                        <ul className="space-y-2">
                            {songs.map((song, index) => (
                                <li key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-md shadow-sm">
                                    <span className="text-white">{song.title}</span>
                                    <button
                                        onClick={() => removeSong(index)}
                                        className="ml-4 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200 ease-in-out"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button
                    onClick={processSongs}
                    className={`w-full py-3 rounded-md text-lg font-semibold transition duration-300 ease-in-out shadow-lg
                        ${songs.length >= 3 && songs.length <= 8 && !isProcessingSongs
                            ? 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                    disabled={songs.length < 3 || songs.length > 8 || isProcessingSongs}
                >
                    {isProcessingSongs ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Elaborazione...
                        </div>
                    ) : (
                        'Conferma Selezione'
                    )}
                </button>
            </div>

            {gradientColors.length > 0 && (
                <ColorGradientDisplay colors={gradientColors} />
            )}
        </div>
    );
}

function ColorGradientDisplay({ colors }) {
    const gradientRef = useRef(null);
    const [backgroundPosition, setBackgroundPosition] = useState(0);
    const animationFrameRef = useRef(null);
    const lastMouseY = useRef(0);
    const scrollSpeed = useRef(0); // Current scroll speed based on mouse movement
    const targetScrollSpeed = useRef(0); // Target scroll speed for smooth transition

    const totalGradientHeight = colors.length * 100; // Each color takes 100% of the height initially
    const loopPoint = totalGradientHeight; // When to reset position for infinite loop

    const animateScroll = useCallback(() => {
        setBackgroundPosition(prevPos => {
            const newPos = prevPos + scrollSpeed.current;
            // Loop the background position
            return newPos % loopPoint;
        });

        // Smoothly adjust scrollSpeed towards targetScrollSpeed
        scrollSpeed.current += (targetScrollSpeed.current - scrollSpeed.current) * 0.05; // Ease in/out

        animationFrameRef.current = requestAnimationFrame(animateScroll);
    }, [loopPoint]);

    useEffect(() => {
        // Start the continuous scroll animation
        targetScrollSpeed.current = 0.5; // Initial slow scroll
        animationFrameRef.current = requestAnimationFrame(animateScroll);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [animateScroll]);

    const handleMouseMove = useCallback((e) => {
        if (!gradientRef.current) return;

        const rect = gradientRef.current.getBoundingClientRect();
        const mouseY = e.clientY - rect.top; // Mouse Y relative to the gradient div

        // Calculate a speed based on mouse position
        // Closer to top -> scroll up, closer to bottom -> scroll down
        // Middle -> slow/stop
        const normalizedMouseY = mouseY / rect.height; // 0 to 1
        targetScrollSpeed.current = (normalizedMouseY - 0.5) * 4; // Adjust multiplier for sensitivity

        lastMouseY.current = mouseY;
    }, []);

    const handleMouseLeave = useCallback(() => {
        targetScrollSpeed.current = 0.5; // Reset to slow scroll when mouse leaves
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (!gradientRef.current || !e.touches[0]) return;

        const rect = gradientRef.current.getBoundingClientRect();
        const touchY = e.touches[0].clientY - rect.top;

        const normalizedTouchY = touchY / rect.height;
        targetScrollSpeed.current = (normalizedTouchY - 0.5) * 4;

        lastMouseY.current = touchY;
    }, []);

    const handleTouchEnd = useCallback(() => {
        targetScrollSpeed.current = 0.5; // Reset to slow scroll when touch ends
    }, []);


    const gradientStyle = {
        backgroundImage: `linear-gradient(to bottom, ${colors.map(c => c).join(', ')})`,
        // Double the gradient to allow for seamless looping
        backgroundSize: `100% ${totalGradientHeight * 2}px`, // Make it tall enough to scroll
        backgroundPosition: `0px ${-backgroundPosition}px`, // Negative for upward scroll
        transition: 'background-position 0.05s linear', // Smooth transition for position updates
    };

    return (
        <div className="w-full h-screen flex justify-center items-center p-4">
            <div
                ref={gradientRef}
                className="relative w-full max-w-sm h-[calc(100vh*16/9)] max-h-[80vh] bg-gray-700 rounded-lg shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
                style={{
                    aspectRatio: '9 / 16', // Ensure 9/16 aspect ratio
                    ...gradientStyle,
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Visual indicator for colors, optional */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-70">
                    {colors.map((color, index) => (
                        <div
                            key={index}
                            className="text-white text-xs font-bold text-center"
                            style={{ color: 'white', textShadow: '1px 1px 2px black' }}
                        >
                            {/* You could display song title here if desired, but it would scroll */}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default App;

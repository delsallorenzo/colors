import React, { useState, useEffect, useRef, useCallback } from 'react';
import './music-player.css'; // Assicurati che questo file esista e sia corretto

// DEFINIZIONE DI ColorGradientDisplay (spostata prima di App)
function ColorGradientDisplay({ colors }) {
    const gradientRef = useRef(null);
    const [backgroundPosition, setBackgroundPosition] = useState(0);
    const animationFrameRef = useRef(null);
    const lastMouseY = useRef(0);
    const scrollSpeed = useRef(0);
    const targetScrollSpeed = useRef(0);

    const totalGradientHeight = colors.length > 0 ? colors.length * 100 : 200;
    const loopPoint = totalGradientHeight > 0 ? totalGradientHeight : 200;

    const animateScroll = useCallback(() => {
        setBackgroundPosition(prevPos => {
            const newPos = prevPos + scrollSpeed.current;
            return loopPoint > 0 ? newPos % loopPoint : newPos;
        });
        scrollSpeed.current += (targetScrollSpeed.current - scrollSpeed.current) * 0.05;
        animationFrameRef.current = requestAnimationFrame(animateScroll);
    }, [loopPoint]);

    useEffect(() => {
        targetScrollSpeed.current = 0.5;
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
        const mouseY = e.clientY - rect.top;
        const normalizedMouseY = rect.height > 0 ? mouseY / rect.height : 0.5;
        targetScrollSpeed.current = (normalizedMouseY - 0.5) * 4;
        lastMouseY.current = mouseY;
    }, []);

    const handleMouseLeave = useCallback(() => {
        targetScrollSpeed.current = 0.5;
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (!gradientRef.current || !e.touches[0]) return;
        const rect = gradientRef.current.getBoundingClientRect();
        const touchY = e.touches[0].clientY - rect.top;
        const normalizedTouchY = rect.height > 0 ? touchY / rect.height : 0.5;
        targetScrollSpeed.current = (normalizedTouchY - 0.5) * 4;
        lastMouseY.current = touchY;
    }, []);

    const handleTouchEnd = useCallback(() => {
        targetScrollSpeed.current = 0.5;
    }, []);

    const displayColors = colors.length === 0
        ? ['rgba(51, 51, 51, 1)', 'rgba(51, 51, 51, 1)']
        : colors.length === 1
            ? [colors[0], colors[0]]
            : colors;

    const gradientStyle = {
        backgroundImage: `linear-gradient(to bottom, ${displayColors.join(', ')})`,
        backgroundSize: `100% ${totalGradientHeight > 0 ? totalGradientHeight * 2 : 400}px`,
        backgroundPosition: `0px ${-backgroundPosition}px`,
        transition: 'background-position 0.05s linear',
    };

    return (
        <div
            ref={gradientRef}
            className="absolute inset-0 w-full h-full -z-10 overflow-hidden"
            style={gradientStyle}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        />
    );
}


function App() {
    // ... (tutti i tuoi state: songs, currentSongTitle, ecc. come prima) ...
    const [songs, setSongs] = useState([]);
    const [currentSongTitle, setCurrentSongTitle] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isProcessingSongs, setIsProcessingSongs] = useState(false);
    const [gradientColors, setGradientColors] = useState([]);

    // ... (le tue funzioni: getMoodAndColor, generateColorFromMood, addSong, removeSong come definite/corrette in precedenza) ...
    const getMoodAndColor = useCallback(async (songTitle) => {
        try {
            console.log("getMoodAndColor: Fetching mood for:", songTitle);
            const response = await fetch(`${process.env.REACT_APP_API_URL}/analyze-song`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ songTitle: songTitle })
            });

            console.log("getMoodAndColor: Response status:", response.status);
            if (!response.ok) {
                const errorData = await response.json();
                console.error("getMoodAndColor: API error response:", errorData);
                throw new Error(`Errore API: ${response.status} - ${errorData.error || 'Errore sconosciuto'}`);
            }
            const result = await response.json();
            console.log("getMoodAndColor: Parsed API result:", result);
            
            const finalResult = {
                genere: result.genere || 'Sconosciuto',
                umore: result.umore || 'neutro'
            };
            console.log("getMoodAndColor: Final mood/genre returned:", finalResult);
            return finalResult;
        } catch (error) {
            console.error("getMoodAndColor: Error calling backend API:", error);
            setErrorMessage(`Errore nel recupero del genere/umore per "${songTitle}": ${error.message}`);
            return { genere: 'Sconosciuto', umore: 'neutro' };
        }
    }, []); // setErrorMessage è stabile

    function hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
    }

    const generateColorFromMood = useCallback((mood, title = "") => {
        const hash = hashString(title + mood);
        let h, s, l;
        switch (mood.toLowerCase()) {
            case 'scuro': case 'malinconico': h = (hash % 60) + 200; s = 20 + (hash % 10); l = 10 + (hash % 10); break;
            case 'calmo': case 'rilassante': h = 160 + (hash % 40); s = 40 + (hash % 20); l = 70 + (hash % 10); break;
            case 'vivace': case 'allegro': h = (hash % 360); s = 70 + (hash % 20); l = 80 + (hash % 10); break;
            case 'energetico': case 'aggressivo': h = (hash % 60); s = 80 + (hash % 15); l = 55 + (hash % 10); break;
            default: h = (hash % 360); s = 30 + (hash % 20); l = 50 + (hash % 10); break;
        }
        return `hsl(${h}, ${s}%, ${l}%)`;
    }, []);

    const addSong = async () => {
        if (currentSongTitle.trim() === '') {
            setErrorMessage('Il titolo della canzone non può essere vuoto.');
            return;
        }
        if (songs.length >= 8) {
            setErrorMessage('Puoi inserire un massimo di 8 canzoni.');
            return;
        }
        setIsProcessingSongs(true);
        setErrorMessage('');
        try {
            const { genere, umore } = await getMoodAndColor(currentSongTitle.trim());
            const color = generateColorFromMood(umore, currentSongTitle.trim());
            const newSong = { title: currentSongTitle.trim(), genre: genere, color };
            setSongs(prevSongs => [...prevSongs, newSong]);
            setCurrentSongTitle('');
        } catch (error) {
            console.error("addSong: Errore durante l'aggiunta del brano:", error);
        } finally {
            setIsProcessingSongs(false);
        }
    };

    const removeSong = (indexToRemove) => {
        const newSongs = songs.filter((_, index) => index !== indexToRemove);
        setSongs(newSongs);
        setErrorMessage('');
    };
    
    useEffect(() => {
        let newGradientColors = songs.map(song => song.color).filter(Boolean);
        if (newGradientColors.length === 0) {
            newGradientColors = ['rgba(51, 51, 51, 1)', 'rgba(51, 51, 51, 1)'];
        }
        setGradientColors(newGradientColors);
    }, [songs, generateColorFromMood]);


    return (
      // Aggiungi 'relative' al contenitore principale
      <main className="music-player min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <ColorGradientDisplay colors={gradientColors} />
        {/* Assicura che song-list (e altri elementi) siano sopra lo sfondo con z-index */}
        <div className="song-list relative z-10"> {/* Aggiunto relative e z-10 */}
          {songs.map((song, index) => (
            <article className={`song-item${song.title ? '' : ' song-item-inactive'}`} key={index}>
              <h2 className="song-title">{song.title || 'Song title & Artist name'}</h2>
              {/* Questo è il "pallino" che hai visto. Puoi tenerlo o rimuoverlo. */}
              {song.title && song.color && (
                <div style={{width: '1em', height: '1em', backgroundColor: song.color, marginLeft: '0.5em', borderRadius: '50%', display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)'}} title={`Colore: ${song.color}`}></div>
              )}
              {song.title ? (
                <button
                  className="remove-button"
                  aria-label={`Rimuovi ${song.title}`}
                  onClick={() => removeSong(index)}
                  tabIndex={0}
                >
                  <span className="remove-icon">+</span>
                </button>
              ) : null}
            </article>
          ))}
          {songs.length < 8 && (
            <article className="song-item song-item-inactive relative z-10"> {/* Aggiunto relative e z-10 */}
              <input
                type="text"
                value={currentSongTitle}
                onChange={(e) => setCurrentSongTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSong()}
                placeholder="Song title & Artist name"
                className="song-title bg-transparent border-none outline-none text-inherit w-full"
                style={{ padding: "16px 42px", fontSize: 12, fontWeight: 400 }}
                disabled={isProcessingSongs}
              />
              <button
                className="add-button"
                aria-label="Add song to playlist"
                onClick={addSong}
                tabIndex={0}
                disabled={currentSongTitle.trim() === "" || isProcessingSongs}
              >
                {isProcessingSongs ? "..." : "+"}
              </button>
            </article>
          )}
  
          {errorMessage && (
            <p className="text-red-400 text-sm mt-2 relative z-10" aria-live="polite"> {/* Aggiunto relative e z-10 */}
              {errorMessage}
            </p>
          )}

          <section className="action-buttons relative z-10"> {/* Aggiunto relative e z-10 */}
            {/* ... i tuoi bottoni ... */}
            <div className="action-group">
                <button className="action-button" aria-label="Share">
                <span className="action-icon" style={{fontSize: 36, fontWeight: 100, lineHeight: 1}}>↑</span>
                <span className="action-text">share</span>
                </button>
            </div>
            <div className="action-group">
                <button className="action-button" aria-label="Download">
                <span className="action-icon" style={{fontSize: 36, fontWeight: 100, lineHeight: 1}}>↓</span>
                <span className="action-text">download</span>
                </button>
            </div>
          </section>
        </div>
      </main>
    );
}

export default App;
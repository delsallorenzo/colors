// Importa la libreria dotenv per caricare le variabili d'ambiente
require('dotenv').config();

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors'); // Per gestire le richieste da domini diversi

const app = express();
const port = process.env.PORT || 3001; // La porta del server, usa 3001 se non specificata

// Configura CORS: è fondamentale per permettere al tuo frontend React (che gira su una porta diversa)
// di fare richieste a questo backend. Sostituisci 'http://localhost:3000' con l'URL effettivo del tuo frontend.
app.use(cors({
    origin: 'http://localhost:3000' // O il dominio del tuo sito in produzione, es. 'https://tuosito.com'
}));

// Middleware per parsare il corpo delle richieste JSON
app.use(express.json());

// Inizializza l'API di Google Gemini usando la chiave caricata dal file .env
// process.env.GEMINI_API_KEY accede alla variabile GEMINI_API_KEY definita nel tuo file .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Seleziona il modello Gemini da utilizzare. Gemini-pro è un buon punto di partenza.
// Puoi considerare "gemini-1.5-flash" per risposte più veloci e limiti gratuiti più alti se necessario.
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// oppure
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Endpoint POST per analizzare il brano musicale
app.post('/analyze-song', async (req, res) => {
    console.log('Richiesta ricevuta:', req.body);
    const { songTitle } = req.body; // Estrai il titolo della canzone dal corpo della richiesta

    // Gestione errore: se il titolo non è presente
    if (!songTitle) {
        return res.status(400).json({ error: 'Titolo della canzone mancante.' });
    }

try {
    const prompt = `Analizza il seguente brano musicale e forniscimi il suo genere e il mood principale. Rispondi in formato JSON con i campi "genere" (stringa) e "umore" (stringa). Esempio: {"genere": "Pop", "umore": "allegro"}. Canzone: "${songTitle}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log('Risposta grezza da Gemini:', text); // DEBUG
    
    // Extract JSON from code blocks if present
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
        // Use content inside code blocks
        text = codeBlockMatch[1].trim();
    } else {
        // If no code blocks, find JSON by braces
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            text = text.substring(firstBrace, lastBrace + 1);
        }
    }
    
    try {
        const parsedResult = JSON.parse(text);
        res.json(parsedResult);
    } catch (jsonError) {
        console.error('Errore parsing JSON:', jsonError, 'Testo:', text);
        res.status(500).json({ error: 'Errore nella conversione del risultato in JSON', details: jsonError.message });
    }
} catch (error) {
    console.error('Errore dettagliato:', error); // DEBUG
    res.status(500).json({ error: 'Errore interno del server durante l\'analisi del brano.', details: error.message });

    }
});

// Avvia il server e mettilo in ascolto sulla porta specificata
app.listen(port, () => {
    console.log(`Backend server in ascolto su http://localhost:${port}`);
});
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const port = 3000;

app.use(express.static('public'));

const composers = [
    "Johann Sebastian Bach", "Wolfgang Amadeus Mozart", "Ludwig van Beethoven",
    "Frédéric Chopin", "Pyotr Ilyich Tchaikovsky", "Claude Debussy"
    // Add more composers as needed
];

app.get('/random-composer', async (req, res) => {
    try {
        const randomComposer = composers[Math.floor(Math.random() * composers.length)];
        const composerData = await fetchComposerInfo(randomComposer);
        res.json(composerData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch composer information' });
    }
});

async function fetchComposerInfo(composerName) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(composerName)}`;
    const response = await axios.get(url);
    const pages = response.data.query.pages;
    const pageId = Object.keys(pages)[0];
    const extract = pages[pageId].extract;
    return { name: composerName, extract: extract.split('\n')[0] };
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

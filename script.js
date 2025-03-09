const composers = [
    "Johann Sebastian Bach", "Wolfgang Amadeus Mozart", "Ludwig van Beethoven",
    "Frédéric Chopin", "Pyotr Ilyich Tchaikovsky", "Claude Debussy"
    // Add more composers as needed
];

document.getElementById('generate-btn').addEventListener('click', generateComposer);

function generateComposer() {
    const composerInfo = document.getElementById('composer-info');
    composerInfo.innerHTML = 'Loading...';

    const randomComposer = composers[Math.floor(Math.random() * composers.length)];
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(randomComposer)}&origin=*`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            const extract = pages[pageId].extract;
            composerInfo.innerHTML = `
                <strong>${randomComposer}</strong><br>
                ${extract.split('\n')[0]}
            `;
        })
        .catch(error => {
            console.error('Error:', error);
            composerInfo.innerHTML = 'Failed to fetch composer information.';
        });
}

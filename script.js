const composers = [
    "Johann Sebastian Bach", "Wolfgang Amadeus Mozart", "Ludwig van Beethoven",
    "Frédéric Chopin", "Pyotr Ilyich Tchaikovsky", "Claude Debussy"
];

document.getElementById('generate-btn').addEventListener('click', generateComposer);

function generateComposer() {
    const composerInfo = document.getElementById('composer-info');
    composerInfo.innerHTML = 'Loading...';

    const randomComposer = composers[Math.floor(Math.random() * composers.length)];
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro=true&explaintext=true&titles=${encodeURIComponent(randomComposer)}&pithumbsize=300&origin=*`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            const extract = pages[pageId].extract;
            const imageUrl = pages[pageId].thumbnail ? pages[pageId].thumbnail.source : '';

            // Fetch additional composer details (this would require a separate API or database)
            const composerDetails = getComposerDetails(randomComposer);

            composerInfo.innerHTML = `
                <img id="composer-image" src="${imageUrl}" alt="${randomComposer}">
                <div id="composer-details">
                    <h2>${randomComposer}</h2>
                    <p>${extract.split('\n')[0]}</p>
                    <p><strong>Lifespan:</strong> ${composerDetails.lifespan}</p>
                    <p><strong>Period:</strong> ${composerDetails.period}</p>
                    <p><strong>Most Famous Work:</strong> ${composerDetails.famousWork}</p>
                    <audio controls>
                        <source src="${composerDetails.audioSample}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error:', error);
            composerInfo.innerHTML = 'Failed to fetch composer information.';
        });
}

function getComposerDetails(composer) {
    // This function would ideally fetch data from a database or API
    // For demonstration purposes, we'll use hardcoded data
    const details = {
        "Johann Sebastian Bach": {
            lifespan: "1685-1750",
            period: "Baroque",
            famousWork: "Brandenburg Concertos",
            audioSample: "https://example.com/bach_sample.mp3"
        },
        "Wolfgang Amadeus Mozart": {
            lifespan: "1756-1791",
            period: "Classical",
            famousWork: "Eine kleine Nachtmusik",
            audioSample: "https://example.com/mozart_sample.mp3"
        },
        // Add details for other composers...
    };
    return details[composer] || {
        lifespan: "Unknown",
        period: "Unknown",
        famousWork: "Unknown",
        audioSample: ""
    };
}

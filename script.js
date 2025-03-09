const COMPOSERS = [
    "Johann Sebastian Bach", "Wolfgang Amadeus Mozart",
    "Ludwig van Beethoven", "Frédéric Chopin",
    "Pyotr Ilyich Tchaikovsky", "Claude Debussy",
    "Johannes Brahms", "Giuseppe Verdi",
    "Richard Wagner", "Antonio Vivaldi"
];

document.getElementById('generate-btn').addEventListener('click', generateComposer);

async function generateComposer() {
    const container = document.getElementById('composer-info');
    container.innerHTML = '<div class="loading">Loading...</div>';

    try {
        const composer = COMPOSERS[Math.floor(Math.random() * COMPOSERS.length)];
        const [wikiData, audioSample] = await Promise.all([
            fetchWikipediaData(composer),
            findAudioSample(composer)
        ]);

        container.innerHTML = `
            <img class="composer-image" src="${wikiData.image || 'https://via.placeholder.com/300?text=No+Image'}" alt="${composer}">
            <div class="composer-details">
                <h2>${composer}</h2>
                ${wikiData.birth ? `<p><strong>Born:</strong> ${wikiData.birth}</p>` : ''}
                ${wikiData.death ? `<p><strong>Died:</strong> ${wikiData.death} (Age ${wikiData.age})</p>` : ''}
                ${wikiData.period ? `<p><strong>Period:</strong> ${wikiData.period}</p>` : ''}
                ${wikiData.summary ? `<p>${wikiData.summary}</p>` : ''}
                ${audioSample ? `
                    <p><strong>Featured Work:</strong> ${audioSample.title}</p>
                    <audio controls>
                        <source src="${audioSample.url}" type="audio/mpeg">
                        Your browser does not support audio
                    </audio>
                ` : '<p>No audio sample available</p>'}
            </div>
        `;
    } catch (error) {
        container.innerHTML = `<div class="error">Error loading data: ${error.message}</div>`;
        console.error(error);
    }
}

async function fetchWikipediaData(composer) {
    const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages|revisions|categories&rvprop=content&titles=${encodeURIComponent(composer)}&pithumbsize=300&origin=*`
    );
    const data = await response.json();
    const page = Object.values(data.query.pages)[0];
    
    return {
        image: page.thumbnail?.source,
        summary: extractFirstParagraph(page.extract),
        ...extractBioData(page.revisions[0]['*']),
        period: extractHistoricalPeriod(page.categories)
    };
}

function extractFirstParagraph(extract) {
    return extract?.split('\n').find(p => p.trim().length > 0) || 'No summary available';
}

function extractBioData(wikiText) {
    const birthMatch = wikiText.match(/\{\{Birth date\|(.*?)\}\}/);
    const deathMatch = wikiText.match(/\{\{Death date\|(.*?)\}\}/);
    const birth = birthMatch ? formatDate(birthMatch[1]) : null;
    const death = deathMatch ? formatDate(deathMatch[1]) : null;
    const age = birth && death ? new Date(death).getFullYear() - new Date(birth).getFullYear() : null;

    return { birth, death, age };
}

function formatDate(dateStr) {
    const parts = dateStr.split('|').filter(p => !isNaN(p));
    return parts.length >= 3 
        ? new Date(parts[0], parts[1]-1, parts[2]).toLocaleDateString()
        : dateStr.replace(/\|/g, ' ');
}

function extractHistoricalPeriod(categories) {
    const periodMap = {
        'Baroque': /baroque/i,
        'Classical': /classical/i,
        'Romantic': /romantic/i,
        'Impressionist': /impressionist/i,
        'Neoclassical': /neoclassical/i
    };

    const category = categories.find(cat => 
        Object.entries(periodMap).find(([period, regex]) => 
            regex.test(cat.title)
        )
    );

    return category 
        ? Object.entries(periodMap).find(([_, regex]) => 
            regex.test(category.title)
        )[0]
        : 'Unknown Period';
}

async function findAudioSample(composer) {
    try {
        const response = await fetch(
            `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(composer)}+haswbstatement:P51&format=json&origin=*`
        );
        const data = await response.json();
        const audioFile = data.query.search.find(item => 
            item.title.toLowerCase().endsWith('.ogg') || 
            item.title.toLowerCase().endsWith('.mp3')
        );

        return audioFile ? {
            title: audioFile.title.split('/').pop().replace(/_/g, ' '),
            url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(audioFile.title)}`
        } : null;
    } catch {
        return null;
    }
}

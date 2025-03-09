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
        const wikiData = await fetchWikipediaData(composer);

        container.innerHTML = `
            <img class="composer-image" src="${wikiData.image || 'https://via.placeholder.com/300?text=No+Image'}" alt="${composer}">
            <div class="composer-details">
                <h2>${composer}</h2>
                ${wikiData.birth ? `<p><strong>Born:</strong> ${wikiData.birth}</p>` : ''}
                ${wikiData.death ? `<p><strong>Died:</strong> ${wikiData.death} (Age ${wikiData.age})</p>` : ''}
                ${wikiData.summary ? `<p>${wikiData.summary}</p>` : ''}
                <div id="audio-player">Loading audio sample...</div>
            </div>
        `;

        // Fetch audio sample from Wikimedia Commons
        const audioSample = await findAudioSample(composer);
        updateAudioPlayer(audioSample);

    } catch (error) {
        container.innerHTML = `<div class="error">Error loading data: ${error.message}</div>`;
        console.error(error);
    }
}

async function fetchWikipediaData(composer) {
    const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages|revisions&exintro=1&explaintext=1&rvprop=content&titles=${encodeURIComponent(composer)}&pithumbsize=300&origin=*`
    );
    const data = await response.json();
    const page = Object.values(data.query.pages)[0];
    
    return {
        image: page.thumbnail?.source,
        summary: getFirstThreeSentences(page.extract),
        ...extractBioData(page.revisions[0]['*'])
    };
}

function getFirstThreeSentences(text) {
    const sentences = text.split('.').filter(sentence => sentence.trim().length > 0);
    return sentences.slice(0, 3).map(sentence => sentence + '.').join(' ');
}

function extractBioData(wikiText) {
    const birthMatch = wikiText.match(/\{\{Birth date\|(.*?)\}\}/);
    const deathMatch = wikiText.match(/\{\{Death date\|(.*?)\}\}/);
    const birth = birthMatch ? formatDate(birthMatch[1]) : null;
    const death = deathMatch ? formatDate(deathMatch[1]) : null;
    const age = birth && death ? calculateAge(birth, death) : null;

    return { birth, death, age };
}

function formatDate(dateStr) {
    const parts = dateStr.split('|').filter(p => !isNaN(p));
    return parts.length >= 3 
        ? new Date(parts[0], parts[1]-1, parts[2]).toLocaleDateString()
        : dateStr.replace(/\|/g, ' ');
}

function calculateAge(birth, death) {
    const birthDate = new Date(birth);
    const deathDate = new Date(death);
    let age = deathDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = deathDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && deathDate.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

async function findAudioSample(composer) {
    try {
        // Search for audio files related to the composer on Wikimedia Commons
        const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(composer)}+filetype:audio&format=json&origin=*`;
        
        console.log(`Searching for audio files: ${searchUrl}`); // Debugging log
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        if (data.query && data.query.search.length > 0) {
            console.log("Search results:", data.query.search); // Debugging log
            const fileTitle = data.query.search[0].title;
            return {
                title: fileTitle.replace(/_/g, ' '),
                url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileTitle)}`
            };
        }
        
        console.warn("No audio files found for:", composer); // Debugging log
        return null; // No audio sample found
    } catch (error) {
        console.error("Error fetching audio sample from Wikimedia Commons:", error);
        return null;
    }
}

function updateAudioPlayer(audioSample) {
    const audioPlayer = document.getElementById('audio-player');
    
    if (audioSample) {
        audioPlayer.innerHTML = `
            <p><strong>Featured Work:</strong> ${audioSample.title}</p>
            <audio controls>
                <source src="${audioSample.url}" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
            <p><a href="${audioSample.url}" target="_blank">Download or view full file</a></p>
        `;
    } else {
        audioPlayer.innerHTML = '<p>No audio sample available</p>';
    }
}

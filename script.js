// List of composers
const composers = [
    "Johann Sebastian Bach", "Wolfgang Amadeus Mozart", "Ludwig van Beethoven",
    "Frédéric Chopin", "Pyotr Ilyich Tchaikovsky", "Claude Debussy",
    "Johannes Brahms", "Franz Schubert", "George Frideric Handel",
    "Igor Stravinsky", "Gustav Mahler", "Richard Wagner"
];

// Periods
const periods = {
    "Johann Sebastian Bach": "Baroque",
    "Wolfgang Amadeus Mozart": "Classical",
    "Ludwig van Beethoven": "Classical/Romantic",
    "Frédéric Chopin": "Romantic",
    "Pyotr Ilyich Tchaikovsky": "Romantic",
    "Claude Debussy": "Impressionist",
    "Johannes Brahms": "Romantic",
    "Franz Schubert": "Classical/Romantic",
    "George Frideric Handel": "Baroque",
    "Igor Stravinsky": "Neoclassical",
    "Gustav Mahler": "Romantic",
    "Richard Wagner": "Romantic"
};

// Composer details
const composerDetails = {
    "Johann Sebastian Bach": { birth: "1685", death: "1750" },
    "Wolfgang Amadeus Mozart": { birth: "1756", death: "1791" },
    "Ludwig van Beethoven": { birth: "1770", death: "1827" },
    "Frédéric Chopin": { birth: "1810", death: "1849" },
    "Pyotr Ilyich Tchaikovsky": { birth: "1840", death: "1893" },
    "Claude Debussy": { birth: "1862", death: "1918" },
    "Johannes Brahms": { birth: "1833", death: "1897" },
    "Franz Schubert": { birth: "1797", death: "1828" },
    "George Frideric Handel": { birth: "1685", death: "1759" },
    "Igor Stravinsky": { birth: "1882", death: "1971" },
    "Gustav Mahler": { birth: "1860", death: "1911" },
    "Richard Wagner": { birth: "1813", death: "1883" }
};

// Function to generate a random composer
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
            const imageUrl = pages[pageId].thumbnail ? pages[pageId].thumbnail.source : 'https://via.placeholder.com/300?text=No+Image+Available';

            const details = composerDetails[randomComposer];
            const period = periods[randomComposer];
            const birthYear = parseInt(details.birth);
            const deathYear = parseInt(details.death);
            const age = deathYear - birthYear;

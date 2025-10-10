// index.js
import polka from 'polka';
import { LRUCache } from 'lru-cache';
import { setup, readingBeginning, kanjiBeginning } from 'jmdict-simplified-node';

const PORT = process.env.PORT || 3000;
const app = polka();

// Initialize JMDict
const jmdictPromise = setup(
  'my-jmdict-db',                  // LevelDB path
  './jmdict-eng-3.6.1.json', // JSON filename if DB not found
  false,                            // verbose
  false                             // omitPartial
);

// Simple LRU cache for English searches
const cache = new LRUCache({ max: 500 });
// Helper: format a word for frontend
function formatWordForCard(word) {
  const kanji = word.kanji?.map(k => k.text).filter(Boolean) || [];
  const kana = word.kana?.map(k => k.text).filter(Boolean) || [];
  const definitions = word.sense?.flatMap(s => s.gloss?.map(g => g.text) || []) || [];
  const pos = word.sense
    ? [...new Set(word.sense.flatMap(s => s.partOfSpeech || []))]
    : [];
  return { id: word.id, kanji, kana, definitions, pos };
}

// Build English index once for faster searches
let englishIndex = null;
async function buildEnglishIndex() {
  if (englishIndex) return englishIndex;

  const { db } = await jmdictPromise;
  const allWords = await readingBeginning(db, '', -1);
  englishIndex = allWords;
  return englishIndex;
}

app.get('/api/search', async (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();
  const TOP_N = 3;

  if (!query) {
    return res.end(JSON.stringify({ message: [] }));
  }

  try {
    const { db } = await jmdictPromise;
    let results = [];

    const isJapanese = /^[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]+$/u.test(query);

    if (isJapanese) {
      const readingResults = await readingBeginning(db, query, 10);
      const kanjiResults = await kanjiBeginning(db, query, 10);
      results = [...readingResults, ...kanjiResults];
    } else {
      // Use cache for English search
      if (cache.has(query)) {
        results = cache.get(query);
      } else {
        const allWords = await buildEnglishIndex();
        results = allWords.filter(word =>
          word.sense.some(sense =>
            sense.gloss.some(gl => gl.text.toLowerCase().includes(query))
          )
        );
        cache.set(query, results);
      }
    }

    // Deduplicate by ID
    const seen = new Set();
    results = results.filter(word => {
      if (seen.has(word.id)) return false;
      seen.add(word.id);
      return true;
    });

    // Limit to top N
    results = results.slice(0, TOP_N);

    // Format for frontend
    const cards = results.map(formatWordForCard);

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: cards }));

  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

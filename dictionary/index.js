// index.js
import polka from 'polka';
import { LRUCache } from 'lru-cache';
import { setup, readingBeginning, kanjiBeginning } from 'jmdict-simplified-node';

const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN || '').replace(/\/$/, '');
const app = polka();

// Initialize JMDict
const jmdictPromise = setup(
  'my-jmdict-db',
  './jmdict-eng-3.6.1.json',
  false,
  false
);

// LRU cache
const cache = new LRUCache({ max: 500 });

// Format helper
function formatWordForCard(word) {
  const kanji = word.kanji?.map(k => k.text).filter(Boolean) || [];
  const kana = word.kana?.map(k => k.text).filter(Boolean) || [];
  const definitions = word.sense?.flatMap(s => s.gloss?.map(g => g.text) || []) || [];
  const pos = word.sense ? [...new Set(word.sense.flatMap(s => s.partOfSpeech || []))] : [];
  return { id: word.id, kanji, kana, definitions, pos };
}

// English index cache
let englishIndex = null;
async function buildEnglishIndex() {
  if (englishIndex) return englishIndex;
  const { db } = await jmdictPromise;
  englishIndex = await readingBeginning(db, '', -1);
  return englishIndex;
}

// ✅ Global CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowThisOrigin =
    !ALLOWED_ORIGIN || origin === ALLOWED_ORIGIN || origin === 'http://localhost:5173';

  if (allowThisOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  next();
});

// API
app.get('/api/search', async (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();
  const TOP_N = 3;

  res.setHeader('Content-Type', 'application/json');

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

    const seen = new Set();
    results = results.filter(w => !seen.has(w.id) && seen.add(w.id)).slice(0, TOP_N);

    const cards = results.map(formatWordForCard);
    res.end(JSON.stringify({ message: cards }));

  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🌐 Allowed origin: ${ALLOWED_ORIGIN || 'any'}`);
});

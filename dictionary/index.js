// index.js
import polka from 'polka';
import { LRUCache } from 'lru-cache';
import Fuse from 'fuse.js';
import { setup, readingBeginning, kanjiBeginning } from 'jmdict-simplified-node';

const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN || '').replace(/\/$/, '');
const app = polka();

// --------------------------
// Initialize JMDict
// --------------------------
const jmdictPromise = setup(
  'my-jmdict-db',
  './jmdict-eng-3.6.1.json',
  false,
  false
);

// --------------------------
// LRU Caches
// --------------------------
const cacheEnglish = new LRUCache({ max: 500 });
const cacheJapanese = new LRUCache({ max: 500 });

// --------------------------
// Format Word for Card with score
// --------------------------
function formatWordForCard(word, score) {
  const kanji = word.kanji?.map(k => k.text).filter(Boolean) || [];
  const kana = word.kana?.map(k => k.text).filter(Boolean) || [];
  const definitions = word.sense?.flatMap(s => s.gloss?.map(g => g.text) || []) || [];
  const pos = word.sense ? [...new Set(word.sense.flatMap(s => s.partOfSpeech || []))] : [];
  return { id: word.id, kanji, kana, definitions, pos, score };
}

// --------------------------
// English Index Cache
// --------------------------
let englishIndex = null;
async function buildEnglishIndex() {
  if (englishIndex) return englishIndex;
  const { db } = await jmdictPromise;
  englishIndex = await readingBeginning(db, '', -1);
  return englishIndex;
}

// --------------------------
// Japanese Priority Tags
// --------------------------
function getJapanesePriority(word) {
  let score = 0;
  const pri = [...(word.kanji || []), ...(word.kana || [])].flatMap(x => x.pri || []);
  if (pri.includes('news1')) score += 2;
  if (pri.includes('ichi1')) score += 1.5;
  if (pri.includes('spec1')) score += 1;
  return score;
}

// --------------------------
// English Search: weighted & fuzzy
// --------------------------
function searchEnglish(words, query, topN = 5) {
  if (!query) return [];

  const normalizedQuery = query.trim().toLowerCase();
  const queryWords = normalizedQuery.split(/\s+/);

  let scored = words
    .map(word => {
      const glosses = word.sense.flatMap(s =>
        s.gloss?.map(g => g.text.toLowerCase().trim()) || []
      );

      let maxScore = 0;

      for (let i = 0; i < glosses.length; i++) {
        const gloss = glosses[i];
        const glossWords = gloss.split(/\s+/);
        const weight = (glosses.length - i) / glosses.length;

        const exactMatch = queryWords.every(qw => glossWords.includes(qw));
        if (exactMatch) maxScore = Math.max(maxScore, 3 + weight);

        const startsWithMatch = queryWords.every(qw =>
          glossWords.some(w => w.startsWith(qw))
        );
        if (startsWithMatch) maxScore = Math.max(maxScore, 2 + weight);

        const containsMatch = queryWords.every(qw =>
          glossWords.some(w => w.includes(qw))
        );
        if (containsMatch) maxScore = Math.max(maxScore, 1 + weight);
      }

      return { word, score: maxScore };
    })
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score);

  // Fallback fuzzy search if not enough results
  if (scored.length < topN) {
    const fuse = new Fuse(words, { keys: ['sense.gloss.text'], includeScore: true, threshold: 0.4 });
    const fuzzyResults = fuse.search(normalizedQuery).map(r => ({ word: r.item, score: 1 }));
    for (const r of fuzzyResults) {
      if (!scored.find(s => s.word.id === r.word.id)) scored.push(r);
    }
  }

  // Deduplicate and limit topN
  const seen = new Set();
  const results = [];
  for (const { word, score } of scored) {
    if (!seen.has(word.id)) {
      results.push({ word, score });
      seen.add(word.id);
    }
    if (results.length >= topN) break;
  }

  return results;
}

// --------------------------
// Japanese Search: kanji-first, sense & pri aware
// --------------------------
function rankJapaneseEntries(words, query, topN = 5) {
  const normalizedQuery = query.trim();

  let scored = words
    .map(word => {
      const kanjiTexts = (word.kanji?.map(k => k.text) || []).map(t => t.trim());
      const kanaTexts = (word.kana?.map(k => k.text) || []).map(t => t.trim());

      let score = 0;

      if (kanjiTexts.includes(normalizedQuery)) score = 5;
      else if (kanaTexts.includes(normalizedQuery)) score = 4;
      else if (kanjiTexts.some(t => t.startsWith(normalizedQuery))) score = 3;
      else if (kanaTexts.some(t => t.startsWith(normalizedQuery))) score = 2;
      else if (kanjiTexts.concat(kanaTexts).some(t => t.includes(normalizedQuery))) score = 1;

      score += getJapanesePriority(word);

      return { word, score };
    })
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score);

  // Fallback fuzzy search if needed
  if (scored.length < topN) {
    const fuse = new Fuse(words, { keys: ['kanji.text', 'kana.text'], threshold: 0.3 });
    const fuzzyResults = fuse.search(normalizedQuery).map(r => ({ word: r.item, score: 1 }));
    for (const r of fuzzyResults) {
      if (!scored.find(s => s.word.id === r.word.id)) scored.push(r);
    }
  }

  // Deduplicate and limit topN
  const seen = new Set();
  const results = [];
  for (const { word, score } of scored) {
    if (!seen.has(word.id)) {
      results.push({ word, score });
      seen.add(word.id);
    }
    if (results.length >= topN) break;
  }

  return results;
}

// --------------------------
// Global CORS Middleware
// --------------------------
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowThisOrigin =
    !ALLOWED_ORIGIN || origin === ALLOWED_ORIGIN || origin === 'http://localhost:5173';

  if (allowThisOrigin) res.setHeader('Access-Control-Allow-Origin', origin);

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

// --------------------------
// API: Search
// --------------------------
app.get('/api/search', async (req, res) => {
  const query = (req.query.q || '').trim();
  const TOP_N = 5;
  res.setHeader('Content-Type', 'application/json');

  if (!query) return res.end(JSON.stringify({ message: [] }));

  try {
    const { db } = await jmdictPromise;
    let results = [];

    const isJapanese = /^[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]+$/u.test(query);

    if (isJapanese) {
      if (cacheJapanese.has(query)) {
        results = cacheJapanese.get(query);
      } else {
        const readingResults = await readingBeginning(db, query, 10);
        const kanjiResults = await kanjiBeginning(db, query, 10);
        results = [...readingResults, ...kanjiResults];

        results = rankJapaneseEntries(results, query, TOP_N);
        cacheJapanese.set(query, results);
      }
    } else {
      if (cacheEnglish.has(query)) {
        results = cacheEnglish.get(query);
      } else {
        const allWords = await buildEnglishIndex();
        results = searchEnglish(allWords, query, TOP_N);
        cacheEnglish.set(query, results);
      }
    }

    // Include score in response
    const cards = results.map(({ word, score }) => formatWordForCard(word, score));
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

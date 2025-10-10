<script>
  import Keyboard from '$/lib/KeyBoard.svelte';
  import QwertyKeyboard from '$/keyboard/QwertyKeyboard.js';
  import HiraganaKeyboard from '$/keyboard/HiraganaKeyboard';
  import { fly } from 'svelte/transition';


  let suggestions = [];
  let inputValue = '';
  let inputRef;
  let isEnglish = true;
  let isUsingKeyboard = false;
  let darkMode = false;
  let searchState = 'idle'; // 'idle', 'loading', 'results', 'no-results'

  const english = new QwertyKeyboard();
  const japanese = new HiraganaKeyboard();
  let keyboard = english;

  let typingTimeout;

  // Fetch results from API
  async function searchWords() {
    if (!inputValue.trim()) {
      suggestions = [];
      searchState = 'idle';
      return;
    }

    searchState = 'loading';

    try {
      const res = await fetch(import.meta.env.VITE_DICTIONARY+`api/search?q=${encodeURIComponent(inputValue)}`);
      const data = await res.json();

      suggestions = data.message
        .slice(0, 10) // limit to top 10 results
        .map(word => ({
          id: word.id,
          kanji: word.kanji.join(', ') || '',
          reading: word.kana.join(', ') || '',
          meanings: word.definitions.join(', '),
          pos: word.pos ? word.pos.join(', ') : ''
        }));

      searchState = suggestions.length ? 'results' : 'no-results';
    } catch (err) {
      console.error(err);
      suggestions = [];
      searchState = 'no-results';
    }
  }

  // Live input handler with debounce
  function handleInputChange(e) {
    inputValue = e.target.value;

    clearTimeout(typingTimeout);

    if (!inputValue.trim()) {
      suggestions = [];
      searchState = 'idle';
      return;
    }

    typingTimeout = setTimeout(() => searchWords(), 300);
  }

  // Handle virtual keyboard input
  function handleKeyPress(key) {
    if (key.code === 'Enter') {
      clearTimeout(typingTimeout);
      searchWords();
      return;
    }
    if (key.code === 'Backspace') {
      const start = inputRef.selectionStart;
      const end = inputRef.selectionEnd;

      if (start !== end) {
        inputValue = inputValue.slice(0, start) + inputValue.slice(end);
        setTimeout(() => inputRef.setSelectionRange(start, start), 0);
      } else if (start > 0) {
        inputValue = inputValue.slice(0, start - 1) + inputValue.slice(start);
        setTimeout(() => inputRef.setSelectionRange(start - 1, start - 1), 0);
      }
    } else if (key.code === 'Space') {
      inputValue += ' ';
    } else {
      inputValue += key.label;
    }

    // trigger live search
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => searchWords(), 300);
  }

  function selectWord(word) {
    inputValue = word.kanji || word.reading;
    suggestions = [];
    searchState = 'idle';
  }

  function toggleLanguage() {
    isEnglish = !isEnglish;
    keyboard = isEnglish ? english : japanese;
  }

  function toggleKeyboard() {
    isUsingKeyboard = !isUsingKeyboard;
    if (isUsingKeyboard) setTimeout(() => inputRef.focus(), 0);
  }

  function toggleTheme() {
    darkMode = !darkMode;
  }
</script>

<main class={darkMode ? 'dark' : ''}>
  <!-- Header -->
  <nav class="header">
    <div class="header-title">akihi</div>
    <p class="header-subtitle">Japanese Dictionary</p>
    <button class="theme-btn" on:click={toggleTheme}>
      {darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  </nav>

  <!-- Search -->
  <div class="search-container">
    <input
      bind:this={inputRef}
      bind:value={inputValue}
      placeholder="Search Japanese words..."
      on:input={handleInputChange}
      readonly={isUsingKeyboard}
    />
    <button class="toggleKeyboard" on:click={toggleKeyboard}>
      {isUsingKeyboard ? 'Hide Keyboard' : 'Show Keyboard'}
    </button>
  </div>

  <div class="output">
    {#if searchState === 'loading'}
      <div class="loading">
        Loading...
      </div>
    {:else if searchState === 'no-results'}
      <div class="not-found">
        Not Found
      </div>
    {:else if searchState === 'results'}
      {#each suggestions as s (s.id)}
        <div class="card" in:fly={{ y: 20, duration: 200 }}>
          <div class="card-header">
            <h2>{s.kanji || s.reading}</h2>
            {#if s.pos}<span class="pos">{s.pos}</span>{/if}
          </div>
          {#if s.reading}<p class="reading">{s.reading}</p>{/if}
          <p class="meanings">{s.meanings}</p>
        </div>
      {/each}
    {/if}
  </div>






  <!-- Keyboard -->
  {#if isUsingKeyboard}
    <div class="keyboard-wrapper" transition:fly={{ y: 400, duration: 400 }}>
      <button class="toggleLanguage" on:click={toggleLanguage}>
        {isEnglish ? 'English Keyboard' : 'Hiragana Keyboard'}
      </button>
      <Keyboard {keyboard} onPress={handleKeyPress} />
    </div>
  {/if}
</main>

<style>

.header-title{
  font-size: 3rem;
}
/* Main theme */
main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--bg-color);
  color: var(--text-color);
  transition: background 0.3s, color 0.3s;
}

main.dark {
  --bg-color: #111827;
  --text-color: #f1f5f9;
  --card-bg: #1f2937;
  --card-shadow: rgba(0,0,0,0.5);
  --input-bg: #1f2937;
  --input-color: #f1f5f9;
  --btn-bg: #2563eb;
  --btn-color: white;
}

main:not(.dark) {
  --bg-color: #f3f4f6;
  --text-color: #1e293b;
  --card-bg: white;
  --card-shadow: rgba(0,0,0,0.1);
  --input-bg: white;
  --input-color: #1e293b;
  --btn-bg: #3b82f6;
  --btn-color: white;
}

/* Header */
.header {
  width: 100%;
  text-align: center;
  padding: 1.5rem 1rem;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  position: relative;
}

.theme-btn {
  position: absolute;
  right: 5rem;
  top: 3rem;
  background: white;
  color: #3b82f6;
  border-radius: 1rem;
  border: none;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
}

/* Search */
.search-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2rem 0;
  gap: 1rem;
  width: 90%;
  max-width: 700px;
}

input {
  width: 100%;
  padding: 1rem 1.2rem;
  font-size: 1rem;
  border-radius: 1rem;
  border: 1px solid #cbd5e1;
  box-shadow: 0 4px 12px var(--card-shadow);
  outline: none;
  background: var(--input-bg);
  color: var(--input-color);
}

.toggleKeyboard {
  background: var(--btn-bg);
  color: var(--btn-color);
  padding: 0.6rem 1.2rem;
  border-radius: 1rem;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}
.toggleKeyboard:hover { transform: scale(1.05); }

/* Cards */
.output {
  width: 95%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 20vh; /* leave space for keyboard */
}

.card {
  background: var(--card-bg);
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  box-shadow: 0 4px 12px var(--card-shadow);
  transition: transform 0.2s;
}

.card:hover { transform: translateY(-3px); }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.3rem;
}

.loading {
  border:none;
  text-align: center;
  font-style: italic;
  color: #64748b;
}
.not-found {
  text-align: center;
  font-style: italic;
  color: #f87171; /* red-ish for not found */
}

.pos {
  background: #e0f2fe;
  color: #0284c7;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
}

.reading {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0.3rem 0;
}

.meanings {
  font-size: 0.95rem;
  line-height: 1.4;
}

/* Keyboard wrapper */
.keyboard-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -6px 20px rgba(0,0,0,0.2);
  z-index: 100;
}

.toggleLanguage {
  background: var(--btn-bg);
  color: var(--btn-color);
  padding: 0.6rem 1rem;
  border-radius: 1rem;
  border: none;
  cursor: pointer;
  margin-bottom: 0.5rem;
}
</style>

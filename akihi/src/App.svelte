<script>
  import Keyboard from '$/lib/KeyBoard.svelte';
  import QwertyKeyboard from '$/keyboard/QwertyKeyboard.js';
  import HiraganaKeyboard from '$/keyboard/HiraganaKeyboard';
  import { fly } from 'svelte/transition';

  import { onMount } from 'svelte';

  let dict = {};
  let suggestions = [];

  onMount(async () => {
    const res = await fetch(`/jmdict-eng-common-3.6.1.json`);
    dict = await res.json();
    console.log(dict);

  });

  function handleInput() {
    if (!inputValue) {
      suggestions = [];
      return;
    }

    suggestions = dict.word[0];
    console.log(suggestions);
  }


  const english = new QwertyKeyboard();
  const japanese = new HiraganaKeyboard();
  let keyboard = english;
  let inputValue = ''
  let inputRef;
  function handleKeyPress(key) {
    console.log(key);
    if (key.code === "Enter") {
      console.log("Enter pressed:", inputValue);
      return;
    }
    if (key.code === "Space") {
      inputValue += " ";
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
      return;
    }
    inputValue += key.label;
    handleInput();
  }
  
  
  let isEnglish = true;
  function toggleLanguage() {
    isEnglish = !isEnglish;
    if(isEnglish){
      keyboard= english;
    }else{
      keyboard= japanese;
    }
  }

  let isUsingKeyboard = false;

  function toggleKeyboard() {
    isUsingKeyboard = !isUsingKeyboard;
  }

</script>

<main>
  <nav>
    <div class="title">akihi - Japanese Dictionary </div>
  </nav>
  <input bind:value={inputValue} bind:this={inputRef} on:input={handleInput} readonly={isUsingKeyboard} />


  <div class={"output"}>
    <ul>
      {#each suggestions as s}
        <li>{s.kanji} ({s.reading}): {s.meanings}</li>
      {/each}
    </ul>
  </div>

  {#if isUsingKeyboard}
  <div class={"keyboard"} transition:fly={{y:500,duration:600}}>
    <button
      class={"toggleLanguage"}
      on:click={toggleLanguage}
      on:keydown|preventDefault={(e) => e.key === ' ' && e.preventDefault()}
    >
      {isEnglish ? "English" : "Hiragana"}
    </button>
    <Keyboard {keyboard} onPress={handleKeyPress}/>
  </div>
  {/if}

  <button on:click={toggleKeyboard} class={"toggleKeyboard"}>
    {isUsingKeyboard ? "Hide Keyboard" : "Show Keyboard"}
  </button>
</main>

<style>
  .title{
    font-size:2rem;
    padding-top:1rem;
  }
  nav{
    height: 5rem;
    background-color: var(--nav-color);
    margin-bottom: 1rem;
  }
    .toggleLanguage {
    padding: 10px 20px;
    border-radius: 5px;
    background-color:  var(--keyboard-color);
    cursor: pointer;
    transition: background-color 0.2s;
  }




  input{
    font-size: 1rem;
    text-align: left;
    width: 500px;
    height: 50px;
  }

  .keyboard{
    display: grid;
    place-items: center; 
    row-gap: 10px;
  }


  .output{
    height: 40vh;
  }

  .toggleKeyboard{
    background-color: var(--nav-color);
    position: absolute;
    left:5vb;
    bottom: 5vb;
    outline: none;
  }

  button:hover{
    background-color: rgb(14, 103, 167);
  }
</style>
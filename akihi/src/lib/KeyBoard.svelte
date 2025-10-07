<script>
  export let keyboard
  export let onPress

  let activeKeys = new Set();
  function handleClick(key) {
    keyboard.press(key.code);
    if (onPress) onPress(key);
    activeKeys = new Set(activeKeys); 
    activeKeys.add(key.code);
    
    setTimeout(() => {
      activeKeys = new Set(activeKeys);
      activeKeys.delete(key.code);
    }, 150);
  }

  function handleKeyDown(e){
    console.log(e);
    keyboard.press(e.code);
    const key = keyboard.findKey(e.code);
    if(key && onPress){
      onPress(key);
    }
    activeKeys = new Set(activeKeys);
    activeKeys.add(e.code);
  }
  function handleKeyUp(e) {
    activeKeys = new Set(activeKeys);
    activeKeys.delete(e.code);
  }
</script>


<table class="keyboard">
  <tbody>
    {#each keyboard.layout.rows as row}
      <tr>
        {#each row as key}
          <td 
            class:active={activeKeys.has(key.code)}
            colspan={key.colspan || 1}
            on:click={() => handleClick(key)}
          >
            {key.label}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp}/>
<style>
.keyboard {
  background-color: var(--keyboard-color);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); 
  border-collapse: separate;
  border-spacing: 5px 10px; 
  padding: 20px;
  border-radius: 50px; 
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); 
}

.keyboard td {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 20px 30px;
  border-radius: 10px; 
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.keyboard td:hover {
  background-color: rgba(255, 255, 255, 0.25); 
  transform: translateY(-2px); 
}

.keyboard td.active {
  background-color: rgba(255, 255, 255, 0.5); /* active key */
  color: black;
  transform: translateY(-2px);
}
</style>

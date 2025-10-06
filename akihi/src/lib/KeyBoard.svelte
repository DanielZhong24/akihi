<script>
  const keyboard = [
    ["ぬ","ふ","あ","う","え","お","や","ゆ","よ","わ","ほ","へ"],
    ["た","て","い","す","か","ん","な","に","ら","せ","ち","と"],
    ["し","は","き","く","ま","の","り","れ","け","む","つ","Enter"],
    ["さ","そ","ひ","に","み","も","ね","る","め","ろ","Space"]
  ];

const keymaps = {
  "1":0,
  "2":1,
  "3":2,
  "4":3,
  "5":4,
  "6":5,
  "7":6,
  "8":7,
  "9":8,
  "0":9,
  "-":10,
  "=":11,
  "q":12,
  "w":13,
  "e":14,
  "r":15,
  "t":16,
  "y":17,
  "u":18,
  "i":19,
  "o":20,
  "p":21,
  "[":22,
  "]":23,
  "a":24,
  "s":25,
  "d":26,
  "f":27,
  "g":28,
  "h":29,
  "j":30,
  "k":31,
  "l":32,
  ";":33,
  "'":34,
  "z":36,
  "x":37,
  "c":38,
  "v":39,
  "b":40,
  "n":41,
  "m":42,
  ",":43,
  ".":44,
  "/":45,
  "Enter": 35,  
  " ": 46       
};


  function numToCoord(num){
    let row = 0;
    let col = num;

    while(col >= keyboard[row].length){
      col -= keyboard[row].length;
      row+=1;
    }

    return{row,col};
    
  }
  let activeKeys = new Set();
  function onKeyDown(e){
    let index = keymaps[e.key];
    if(index === undefined){
      return;
    }
    let {row,col} = numToCoord(index);

    activeKeys=new Set(activeKeys);
    activeKeys.add(`${row}-${col}`);
  }
  function onKeyUp(e){
    let index = keymaps[e.key];
    if(index === undefined){
      return;
    }
    let {row,col} = numToCoord(index);

    let newSet=new Set(activeKeys);
    newSet.delete(`${row}-${col}`);
    activeKeys=newSet;
  }


  let hoverKeys = new Set();
  function addShadow(id){
    const newSet = new Set(hoverKeys);
    newSet.add(id);
    hoverKeys = newSet;
  }
  function removeShadow(id){
    let newSet=new Set(hoverKeys);
    newSet.delete(id);
    hoverKeys=newSet;
  }
</script>
 
<main>

  <table>
    <tbody>
    {#each keyboard as rows,i}
      <tr>
        {#each rows as characters,j}
            {#if characters === "Space"}
              <td 
                class:active={activeKeys.has(`${i}-${j}`)} 
                class:hover={hoverKeys.has(`${i}-${j}`)} 
                colspan="2" 
                on:mouseenter={()=>addShadow(`${i}-${j}`)}
                on:mouseleave={()=>{removeShadow(`${i}-${j}`)}}>
                {characters}
              </td> 
            {:else}
              <td 
                class:active={activeKeys.has(`${i}-${j}`)} 
                class:hover={hoverKeys.has(`${i}-${j}`)} 
                on:mouseenter={()=>addShadow(`${i}-${j}`)}
                on:mouseleave={()=>{removeShadow(`${i}-${j}`)}}>
                {characters} 
              </td>
            {/if}        
        {/each}
      </tr>
    {/each}
    </tbody>
  </table>

</main>
<svelte:window on:keydown|preventDefault={onKeyDown} on:keyup={onKeyUp}/>

<style>
  table{
    background-color: rgb(28, 28, 31);
    border-radius: 20px;
    padding: 40px;
    border-spacing: 5px;
  }

  tr,td{
    font-size:1.5rem;
    background-color: rgb(43, 43, 47) ;
    padding: 30px 30px;
    border-radius: 20px;
  }

  .active{
    color: black;
    background-color:white;
  }

  .hover{
    color:white;
    background-color: gray;
  }
</style>

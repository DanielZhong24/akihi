import BaseKeyboard from "./BaseKeyboard.js";

const qwertyLayout = {
  name: "QWERTY",
  rows: [
    [
      { label: "Q", code: "KeyQ" },
      { label: "W", code: "KeyW" },
      { label: "E", code: "KeyE" },
      { label: "R", code: "KeyR" },
      { label: "T", code: "KeyT" },
      { label: "Y", code: "KeyY" },
      { label: "U", code: "KeyU" },
      { label: "I", code: "KeyI" },
      { label: "O", code: "KeyO" },
      { label: "P", code: "KeyP" },
    ],
    [
      { label: "A", code: "KeyA" },
      { label: "S", code: "KeyS" },
      { label: "D", code: "KeyD" },
      { label: "F", code: "KeyF" },
      { label: "G", code: "KeyG" },
      { label: "H", code: "KeyH" },
      { label: "J", code: "KeyJ" },
      { label: "K", code: "KeyK" },
      { label: "L", code: "KeyL" },
      { label: "Del", code:"Backspace"}
    ],
    [
      { label: "Z", code: "KeyZ" },
      { label: "X", code: "KeyX" },
      { label: "C", code: "KeyC" },
      { label: "V", code: "KeyV" },
      { label: "B", code: "KeyB" },
      { label: "N", code: "KeyN" },
      { label: "M", code: "KeyM" },
      { label: "Enter", code: "Enter", colspan: 3 },

    ],
    [
      { label: "Space", code: "Space", colspan: 10  }
    ]
  ]
}

export default class QwertyKeyboard extends BaseKeyboard {
  constructor() {
    super(qwertyLayout);
  }

  //let svelte handle the loading, provide with layout
  render() {
    return this.layout.rows;
  }
}

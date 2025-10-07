import BaseKeyboard from "./BaseKeyboard.js";
export const hiraganaKeyboard = {
    name:"Hiragana",

  rows:[
        [
            { label: "ぬ", code: "Digit1" },
            { label: "ふ", code: "Digit2" },
            { label: "あ", code: "Digit3" },
            { label: "う", code: "Digit4" },
            { label: "え", code: "Digit5" },
            { label: "お", code: "Digit6" },
            { label: "や", code: "Digit7" },
            { label: "ゆ", code: "Digit8" },
            { label: "よ", code: "Digit9" },
            { label: "わ", code: "Digit0" },
            { label: "ほ", code: "Minus" },
            { label: "へ", code: "Equal" }
        ],
        [
            { label: "た", code: "KeyQ" },
            { label: "て", code: "KeyW" },
            { label: "い", code: "KeyE" },
            { label: "す", code: "KeyR" },
            { label: "か", code: "KeyT" },
            { label: "ん", code: "KeyY" },
            { label: "な", code: "KeyU" },
            { label: "に", code: "KeyI" },
            { label: "ら", code: "KeyO" },
            { label: "せ", code: "KeyP" },
            { label: "ち", code: "BracketLeft" },
            { label: "と", code: "BracketRight" }
        ],
        [
            { label: "し", code: "KeyA" },
            { label: "は", code: "KeyS" },
            { label: "き", code: "KeyD" },
            { label: "く", code: "KeyF" },
            { label: "ま", code: "KeyG" },
            { label: "の", code: "KeyH" },
            { label: "り", code: "KeyJ" },
            { label: "れ", code: "KeyK" },
            { label: "け", code: "KeyL" },
            { label: "む", code: "Semicolon" },
            { label: "つ", code: "Quote" },
            { label: "Del", code: "Backspace" },

        ],
        [
            { label: "さ", code: "KeyZ" },
            { label: "そ", code: "KeyX" },
            { label: "ひ", code: "KeyC" },
            { label: "に", code: "KeyV" },
            { label: "み", code: "KeyB" },
            { label: "も", code: "KeyN" },
            { label: "ね", code: "KeyM" },
            { label: "る", code: "Comma" },
            { label: "め", code: "Period" },
            { label: "ろ", code: "Slash" },
            { label: "Enter", code: "Enter", colspan:2 }

        ],
        [
            { label: "Space", code: "Space", colspan: 12 }

        ]
    ]
}

export default class HiraganaKeyboard extends BaseKeyboard {
  constructor() {
    super(hiraganaKeyboard);
  }

  //let svelte handle the loading, provide with layout
  render() {
    return this.layout.rows;
  }
}
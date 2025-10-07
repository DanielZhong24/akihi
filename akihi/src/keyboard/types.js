//this is an abstract class for they keys and keyboard layout

//Interface for the Key
export const Key = {
    lable:"", //what appears on the screen
    code:"", // Event code that points to this key
    type:"char",// could be char,action,etc
    colspan:1,
};

//Interface for the Keyboard
export const Keyboard = {
    layout:"",//the layout of the keyboard, could be QWERTY or HIRAGANA etc
    rows:[] //the list that contains all rows of the keyboard
};
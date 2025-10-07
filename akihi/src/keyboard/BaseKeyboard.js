//this is an abstract class for a keyboard
export default class BaseKeyboard{
    constructor(layout){
        //validate that the layout is of proper type
        if(!layout|| !layout.rows){
            throw new Error("Keyboard layout is not valid, must have a 'rows' array");
        }
        this.layout = layout;
        this.listeners = new Set();
    }

    //passing a function to the listener
    onKeyPress(callBack){
        this.listeners.add(callBack);
    }

    //removing a function from the listener
    offKeyPress(callBack){
        this.listeners.delete(callBack);
    }

    //calling the function to be executed for each listner
    emitKeyPress(key){
        this.listeners.forEach(cb=>cb(key));
    }

    //find the key object by its code
    findKey(code){
        for(let row of this.layout.rows){
            for(let key of row){
                if(key.code === code){
                    return key;
                }
            }
        }

        return null;
    }

    //physical or virtual press of the key
    press(code){
        const key = this.findKey(code);
        if(key){
            this.emitKeyPress(key);
        }
    }

    render(){   
        throw new Error("Has to be implemented");
    }
}
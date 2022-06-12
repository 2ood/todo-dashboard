import ListenerLoader from "./listener_loader.js";

export default class DOMBuilder {
  constructor(listenerLoader){
    this.listenerLoader = listenerLoader;
  }
  //initalizes column's ul tag
  //loads work objects and appends them to the target ul


  //loads all the works in "active" collection
  buildActiveLi(json) {
    let result = document.createElement("div");

    json.forEach((doc) =>{
      result.appendChild(this.item(doc.CONTENT,doc.ID,false));
    })
    return result;
  }

  //returns a li object of input.value = value
  //isNone is a boolean for distinguishing created but not used li.
  //the li  with isNone=true are not synced to the firestore.
  item(value, id, isNone) {
    //handles dragstart event of lis

    let new_li = document.createElement("li");
    new_li.draggable = true;
    new_li.className = "draggable";
    new_li.id=id;

    let input = document.createElement("input");
    input.placeholder = value;
    input.value = value;
    if(isNone) input.className="none";

    let cancel = document.createElement("div");
    cancel.className= "cancel";
    cancel.innerHTML = "X";

    this.listenerLoader.loadLiListener(new_li);
    this.listenerLoader.loadItemInputListener(input);
    this.listenerLoader.loadCancelListener(cancel);

    new_li.appendChild(input);
    new_li.appendChild(cancel);

    return new_li;
  }
}

/* all listening events
1. create a li
src : add button
evt : click

2. edit an input's value
src : input
evt : change

3. move a li from one to another ul
src : li
evt : dragend

4. delete a li
src : cancel button
evt : click


1 <-> 4

2 <-> 2

3 <-> 3
*/

//class Work represents each listed works (to do, doing, or done).
class Work {
  constructor(content, generated_on, is_done, is_started, is_active, closed_on) {
    this.CONTENT = content;
    this.GENEREATE_DON = generated-on;
    this.IS_DONE = is_done;
    this.IS_STARTED = is_started;
    this.IS_ACTIVE = is_active;
    this.CLOSED_ON = closed_on;
  }

  toJson() {
    return {
      CONTENT : this.CONTENT,
      GENERATED_ON : this.GENERATED_ON,
      IS_DONE : this.IS_DONE,
      IS_STARTED : this.IS_STARTED,
      IS_ACTIVE : this.IS_ACTIVE,
      CLOSED_ON : this.CLOSED_ON
    };
  }
}

//class Trail represents a change in list.
class Trail {
  constructor(type, timestamp, target_id, details) {
    this.TYPE = type;
    this.TIMESTAMP = timestamp;
    this.TARGET_ID = target_id;
    this.DETAILS = details;
  }

  toJson() {
    return {
      TYPE : this.TYPE,
      TIMESTAMP : this.TIMESTAMP,
      TARGET_ID : this.TARGET_ID,
      DETAILS : this.DETAILS
    };
  }
}

//class TrailQueue represents the frontend queue of changes in lists
//TODO : implement method parse
class TrailQueue {
  constructor() {
    this._arr = [];
  }
  //add an item to the queue
  enqueue(item) {
    this._arr.push(item);
  }
  //return the first item of the reamining queue
  dequeue() {
    return this._arr.shift();
  }
  //return all the queued items in array
  toArray() {
    return this._arr;
  }

  //analyze queued trails and compresses them to minimal steps
  //build -> update -> delete
  //TODO : implement
  parse(trail_array) {
  }

  //parses and queues all trails
  //buffered version of method save
  saveAll(trail_array) {
    const parsed_array = parse(trail_array);
    parsed_array.forEach((trail)=>{
        this.save(trail);
    });
  }

  //queues a trail
  save(trail) {
    this.target_queue.enqueue(trail);
  }
}

//class FirebaseHandler groups functions that interacts with firestore directly.
//TODO : implement methods
class FirebaseHandler {
  constructor() {
    this.firebaseConfig = {
      apiKey: "AIzaSyCSTx5Z9L4imimR2Hzz7a_Mo9RMisk9vDQ",
      authDomain: "ood-to-do.firebaseapp.com",
      projectId: "ood-to-do",
      storageBucket: "ood-to-do.appspot.com",
      messagingSenderId: "58882087407",
      appId: "1:58882087407:web:48d72fc07389e36e22be1a"
    };
    this.app = firebase.initializeApp(this.firebaseConfig);
    this.firestore = this.app.firestore();
  }

  //TODO : implement
  //only used by sync
  _create(trail) {

  }

  //TODO : implement
  //only used by sync
  _update(trail) {
  }

  //TODO : implement
  //only used by sync
  _delete(trail) {
  }

  //edit the database according to parsed trails.

  sync(parsed_trail_array) {
  }
}

const fb = new FirebaseHandler();
const tq = new TrailQueue();
const todo_ul = document.getElementById("todo-ul");
const doing_ul = document.getElementById("doing-ul");
const done_ul = document.getElementById("done-ul");
const add_buttons = document.querySelectorAll("button.add");
const MILLISECONDS_OF_5MIN = 5*60*1000;

initializeList(todo_ul, "todo");
initializeList(doing_ul, "doing");
initializeList(done_ul, "done");

//TODO : listen to:  ctrl+s(save), ctrl+z(undo), ctrl+q(sync)
document.addEventListener("keydown",(evt)=>{
  /*
  const array = todo_ul.getElementsByTagName("input");
  let contents_array =[];
  for(let i=0;i<array.length;i++) {
    if(!array[i].classList.contains("none"))contents_array.push(array[i].value);
  }
  targetRef = firestore.collection('todo').doc(target_date_input.value);
  targetRef.update({
    TODOS : contents_array
  }).then(()=>{
    save.innerHTML="saved!";
    setTimeout(()=>{save.innerHTML="save";},2000);
  });
  */
});

//initalizes column's ul tag
//loads work objects and appends them to the target ul
function initializeList(target_ul, collection) {
  //returns the add button for a column
  function buildAddButton(){
    const result = document.createElement("button");
    result.type = "button";
    result.className = "add";
    result.addEventListener("click",(evt)=>{
      target_ul = evt.srcElement.parentNode.querySelector("ul:first-of-type");
      target_ul.appendChild(buildLi("",true));
    });

    return result;
  }
  //returns a li object of input.value = value
  //isNone is a boolean for distinguishing created but not used li.
  //the li  with isNone=true are not synced to the firestore.
  function buildLi(value, isNone) {
    //handles dragstart event of lis
    function handleDragStart(evt) {
      evt.srcElement.classList.add("dragging");
      evt.srcElement.classList.remove("draggable");
    }
    //handles dragend event of lis
    function handleDragEnd(evt) {
      evt.srcElement.classList.remove("dragging");
      evt.srcElement.classList.add("draggable");
    }
    //handles click event of cancel buttons
    function handleCancel(evt) {
      evt.preventDefault();
      const target = evt.srcElement.parentNode;
      target.parentNode.removeChild(target);
    }

    //make a DOM li object
    let new_li = document.createElement("li");
    new_li.draggable = true;
    new_li.className = "draggable";
    new_li.addEventListener("dragstart",handleDragStart);
    new_li.addEventListener("dragend",handleDragEnd);

    let input = document.createElement("input");
    input.value = value;

    if(isNone) {
      input.addEventListener("change",(evt)=>{evt.srcElement.classList.remove("none");});
      input.className="none";
    }

    let cancel = document.createElement("div");
    cancel.className= "cancel";
    cancel.innerHTML = "X";
    cancel.addEventListener("click",handleCancel);

    new_li.appendChild(input);
    new_li.appendChild(cancel);

    return new_li;
  }
  //handles drag event of ul tags
  function handleDrag(evt) {
    //finds where the dragging object is hovering before
    function getDragAfterElement(ul, y) {
      const draggable_elements = [...ul.querySelectorAll("li.draggable")];

      let result = draggable_elements[0];
      let closest = Number.NEGATIVE_INFINITY;

      for(el of draggable_elements) {
        const box = el.getBoundingClientRect();
        const offset = y-box.top;
        if(offset<=0 && offset >= closest) {
          result = el;
          closest = offset;
        }
      }

      return result;
    }

    evt.preventDefault();
    console.log("drag");
    const target_ul = todo_ul;
    const afterElement = getDragAfterElement(target_ul,evt.clientY);
    const dragging = document.querySelector(".dragging");
    target_ul.insertBefore(dragging,afterElement);
  }

  target_ul.innerHTML="";

  const collectionRef = fb.firestore.collection(collection);
  collectionRef.orderBy("GENERATED_ON","desc").get().then((querySnapshot)=>{
    querySnapshot.forEach((doc) =>{
      if(doc.exists) target_ul.appendChild(buildLi(doc.data().CONTENT,false));
    });
    target_ul.parentNode.appendChild(buildAddButton());
  });

  target_ul.addEventListener("dragover",handleDrag);
}

//returns a string of today's date in format yyyy-mm-dd
function getTodayDocName() {
  const today = new Date;
  let month = '' + (today.getMonth() + 1);
  let day = '' + today.getDate();
  let year = today.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}


//:TODO : implement
function onSaved() {
}

//TODO : implement
function onSync() {
}

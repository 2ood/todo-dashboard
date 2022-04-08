/* all listening events
1. create a li (implemented)
  src : add button
  evt : click

  trailJson = {
    TYPE : "CREATE",
    TIMESTAMP : Util.timestamp(),
    TARGET_ID : id,
    DETAILS : {
      CONTENT : "",
      TO : target_ul.id
    }
  }

2-1. edit an input's value (implemented)
  src : input
  evt : change

  trailJson = {
    TYPE : "EDIT",
    TIMESTAMP : Util.timestamp(),
    TARGET_ID : src.parentNode.id,
    DETAILS : {
      FROM : src.placeholder,
      TO : src.value
    }
  }


2-2. move a li from one to another ul (implemented)
  src : li
  evt : dragend

  trailJson = {
    TYPE : "MOVE",
    TIMESTAMP : Util.timestamp(),
    TARGET_ID : dragging.id,
    DETAILS : {
      FROM : dragging.getAttribute("from"),
      TO : target.id,
    }
  }

2-3. archive a done_ul
  evt : click

  trailJson = {
    TYPE : "ARCHIVE",
    TIMESTAMP : Util.timestamp(),
    TARGET_ID : target.id,
    DETAILS : {}
  }

5. delete a li (implemented)
  src : cancel button
  evt : click

  trailJson = {
    TYPE : "DELETE",
    TIMESTAMP : Util.timestamp(),
    TARGET_ID : target.id,
    DETAILS : {
      FROM : target.parentNode.id
    }
  }




1 <-> 4

2 <-> 2

3 <-> 3
*/

//class Work represents each listed works (to do, doing, or done).
class Work {
  constructor(id, content, generated_on, is_done, is_started, is_active, closed_on) {
    this.ID = id;
    this.CONTENT = content;
    this.GENEREATED_ON = generated_on;
    this.IS_DONE = is_done;
    this.IS_STARTED = is_started;
    this.IS_ACTIVE = is_active;
    this.CLOSED_ON = closed_on;
  }

  static fromJson(json) {
    return new Work(json.ID, json.CONENT, json.GENERATED_ON, json.IS_DONE, json.IS_STARTED,json.IS_ACTIVE,json.CLOSED_ON);
  }

  toJson() {
    return {
      ID : this.ID,
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
  static fromJson (json) {
    return new Trail(json.TYPE, json.TIMESTAMP, json.TARGET_ID,json.DETAILS);
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

  //return true if the queue is not empty
  hasMore() {
    return (this._arr.length>0);
  }

  //dequeue all and return an array;
  dequeueToArray() {
    let result = [];
    while(this.hasMore()) {
      result.push(this.dequeue());
    }
    return result;
  }
  //return all the queued items in array
  toArray() {
    return this._arr;
  }

  //analyze queued trails and compresses them to minimal steps
  //build -> update -> delete
  //TODO : implement
  parse() {
  }

  //parses and queues all trails
  //buffered version of method save
  saveAll() {
    const parsed_array = parse(this._arr);
    parsed_array.forEach((trail)=>{
        this.enqueue(trail);
    });
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

  //only used by sync
  _create(trail) {
    let result = {code : 406, message : "Not acceptible in create method", trail : trail};
    if(trail.TYPE!="CREATE") return result;

    const to = trail.DETAILS.TO ;
    const workJson = {
      ID : trail.TARGET_ID,
      CONTENT : trail.DETAILS.CONTENT,
      GENERATED_ON : trail.TIMESTAMP,
      IS_DONE : (to == "done-ul"),
      IS_STARTED : (to == "doing-ul" || to=="done-ul"),
      IS_ACTIVE : true,
      CLOSED_ON : (to == "done-ul")?trail.TIMESTAMP : Util.nullTime()
    };

    const target_ref = this.firestore.collection(workJson.IS_ACTIVE?"active":"archived").doc(workJson.ID);

    const r = target_ref.set(workJson).catch((error) => {
      result = {code : 400, message : error.message, trail : trail};
      return result;
    });;

    result = {code: 200, message : "OK", trail : trail};
    return result;

  }

  //only used by sync
  _update(trail) {
    let result = {code : 406, message : "Not acceptible in update method", trail : trail};

    let updateJson={};
    let is_active = true;

    if(trail.TYPE=="MOVE") {
      const to = trail.DETAILS.TO ;
      updateJson = {
        IS_DONE : (to == "done-ul"),
        IS_STARTED : (to == "doing-ul" || to=="done-ul"),
        CLOSED_ON : (to == "done-ul")?trail.TIMESTAMP : Util.nullTime()
      }
    }
    else if (trail.TYPE=="EDIT") {
      const to = trail.DETAILS.TO;
      updateJson = {
        CONTENT : to
      }
    }
    else if (trail.TYPE=="ARCHIVE") {
      updateJson = {
        IS_ACTIVE : false
      }
    }
    else return result;

    const target_ref = this.firestore.collection(is_active?"active":"archived").doc(trail.TARGET_ID);
    const r = target_ref.update(updateJson).catch((error)=>{
        result = {code: 400, message : error.message, trail : trail};
        return result;
    });

    if(trail.TYPE=="ARCHIVE") {
        result = _archive(trail);
        return result;
    }
    else {
      result = {code: 200, message : "OK", trail : trail};
      return result;
    }
  }

  //TODO : implement
  //only used by sync
  _delete(trail) {
    let result = {code : 406, message : "Not acceptible in delete method", trail : trail};
    if(trail.TYPE!="DELETE") return result;

    const reference_ref = this.firestore.collection("active").doc(trail.TARGET_ID);

    let r = reference_ref.delete().catch((error)=>{
        result = {code: 400, message : error.message, trail : trail};
        return result;
    });

    result = {code: 200, message : "OK", trail : trail};
    return result;
  }

  //TODO : implement
  //only used by sync
  _archive(trail) {
    let result = {code : 406, message : "Not acceptible in archive method"};
    if(trail.TYPE!="ARCHIVE") return result;

    const reference_ref = this.firestore.collection("active").doc(trail.TARGET_ID);
    const target_ref = this.firestore.collection("archive").doc(trail.TARGET_ID);

    referece_ref.get().then((docRef)=>{
      if(docRef.exists){
        let referece_doc = docRef.data();
        target_ref.set(referece_doc).then(()=>{
          referece_ref.delete().then(()=>{
              result = {code: 200, message : "OK", trail : trail};
          }).catch((error) => {
            result = {code : 400, message : error.message, trail : trail};
            return result;
          });
        }).catch((error) => {
          result = {code : 400, message : error.message, trail : trail};
          return result;
        });
      }
    });
  }

  //edit the database according to parsed trails.

  sync(parsed_trail_array) {
    let result = {code : 400, message : "trail Empty", trail : null};

      for(let i=0; i<parsed_trail_array.length;i++) {
        let trailJson = parsed_trail_array[i];
        if(trailJson.TYPE == "CREATE") {result = this._create(trailJson);}
        else if(trailJson.TYPE == "MOVE" || trailJson.TYPE == "EDIT" || trailJson.TYPE == "ARCHIVE") {result = this._update(trailJson);}
        else if(trailJson.TYPE == "DELETE") {result = this._delete(trailJson);}
        else {
          result = {code : 400, message : "Unknown trail type", trail : trailJson};
          return result;
        }
        setTimeout(()=>{},2000);
        console.log(result);

        if(i+1 >= parsed_trail_array.length) return result;
      }
    return result;
  }
}

class Util {
  //returns a string of runtime time
  static timestamp() {
    return new Date();
  }
  static nullTime() {
    let result = new Date();
    result.setTime(0);
    return result;
  }

  //returns a random 9-digit random id
  static id() {
    return Math.random().toString(36).substr(2, 9);
  }
}

const MILLISECONDS_OF_5MIN = 5*60*1000;
const fb = new FirebaseHandler();
const tq = new TrailQueue();
const todo_ul = document.getElementById("todo-ul");
const doing_ul = document.getElementById("doing-ul");
const done_ul = document.getElementById("done-ul");

initializeList(todo_ul, "todo");
initializeList(doing_ul, "doing");
initializeList(done_ul, "done");
loadActiveLi();

//listen to:  ctrl+s(save), ctrl+z(undo), ctrl+q(sync)
document.addEventListener("keydown",
(evt) => {
  if(evt.ctrlKey) {
    if(evt.key=="s") {
      evt.preventDefault();
      evt.stopPropagation();
      onSaved();
    }
    else if(evt.key=="z") {
      evt.preventDefault();
      evt.stopPropagation();
      onUndo();
    }
    else if(evt.key=="q") {
      evt.preventDefault();
      evt.stopPropagation();
      onSync();
    }
  }
});

//initalizes column's ul tag
//loads work objects and appends them to the target ul
function initializeList(target_ul, statusName) {


  //handles drag event of ul tags
  function handleDrag(evt) {
    evt.preventDefault();
  }
  //handles click event of add button
  function handleAdd(evt) {
    const target_ul = evt.srcElement.parentNode.querySelector("ul:first-of-type");
    const id = Util.id();
    target_ul.appendChild(buildLi("",id,true));

    const trailJson = {
      TYPE : "CREATE",
      TIMESTAMP : Util.timestamp(),
      TARGET_ID : id,
      DETAILS : {
        CONTENT : "",
        TO : target_ul.id
      }
    }

    tq.enqueue(trailJson);
  }
  //handles drop event of ul
  function handleDrop(evt) {
    let target = evt.toElement;
    const dragging = document.querySelector(".dragging");

    for(;target!=document;) {
      if(target.classList.contains("droppable")) {
        target.insertBefore(dragging,null);
        const trailJson = {
          TYPE : "MOVE",
          TIMESTAMP : Util.timestamp(),
          TARGET_ID : dragging.id,
          DETAILS : {
            FROM : dragging.getAttribute("from"),
            TO : target.id,
          }
        }
        tq.enqueue(trailJson);
        break;
      }
      else {
        target = target.parentNode;
      }
    }
  }

    target_ul.innerHTML="";
    target_ul.addEventListener("dragover",handleDrag);
    target_ul.addEventListener("drop",handleDrop);

    const add_button = target_ul.parentNode.querySelector("button:first-of-type");
    add_button.addEventListener("click",handleAdd);
}

function loadActiveLi() {

  const collectionRef = fb.firestore.collection("active");
  collectionRef.orderBy("GENERATED_ON","desc").get().then((querySnapshot)=>{
    querySnapshot.forEach((doc) =>{
      if(doc.exists) {
        const docs = doc.data();
        let target_ul ="";

        if(!docs.IS_STARTED) target_ul = todo_ul;
        else if(docs.IS_DONE) target_ul = done_ul;
        else target_ul = doing_ul;

        target_ul.appendChild(buildLi(docs.CONTENT,docs.ID,false));
      }
    });
  });
}

//returns a li object of input.value = value
//isNone is a boolean for distinguishing created but not used li.
//the li  with isNone=true are not synced to the firestore.
function buildLi(value, id, isNone) {
  //handles dragstart event of lis
  function handleDragStart(evt) {
    const src = evt.srcElement;
    src.classList.add("dragging");
    src.setAttribute("from",src.parentNode.id);
    src.classList.remove("draggable");

    const droppables = document.getElementsByClassName("droppable");
    for(d of droppables) d.classList.add("colored-drop-point");
  }
  //handles dragend event of lis
  function handleDragEnd(evt) {
    const src = evt.srcElement;

    src.removeAttribute("from");

    src.classList.remove("dragging");
    src.classList.add("draggable");

    const droppables = document.getElementsByClassName("droppable");
    for(d of droppables) d.classList.remove("colored-drop-point");
  }
  //handles click event of cancel buttons
  function handleCancel(evt) {
    evt.preventDefault();
    const target = evt.srcElement.parentNode;

    const trailJson = {
      TYPE : "DELETE",
      TIMESTAMP : Util.timestamp(),
      TARGET_ID : target.id,
      DETAILS : {
        FROM : target.parentNode.id
      }
    }
    tq.enqueue(trailJson);

    target.parentNode.removeChild(target);
  }

  let new_li = document.createElement("li");
  new_li.draggable = true;
  new_li.className = "draggable";
  new_li.id=id;
  new_li.addEventListener("dragstart",handleDragStart);
  new_li.addEventListener("dragend",handleDragEnd);


  let input = document.createElement("input");
  input.placeholder = value;
  input.value = value;
  input.addEventListener("change",(evt)=>{
    const src = evt.srcElement;
    const trailJson = {
      TYPE : "EDIT",
      TIMESTAMP : Util.timestamp(),
      TARGET_ID : src.parentNode.id,
      DETAILS : {
        FROM : src.placeholder,
        TO : src.value
      }
    }
    tq.enqueue(trailJson);
    src.placeholder = src.value;
  });

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

//returns a string of today's date in format yyyy-mm-dd
//deprecated
function getTodayFormatted() {
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

function onSaved() {
  tq.parse();
  console.log("saved : ", Util.timestamp());
}

//:TODO : implement
function onUndo() {
  console.log("undo : ",Util.timestamp());
}

function onSync() {
  console.log("started syncing : ",Util.timestamp());
  tq.parse();
  let sync_result = fb.sync(tq.dequeueToArray());
  if(sync_result.code == 200) console.log("successfully synced : ",Util.timestamp());
  else { console.log("Error in sync : ",Util.timestamp(),sync_result.message);console.log(sync_result.trail) }
}

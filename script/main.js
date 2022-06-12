import FirebaseHandler from "./firebase_handler.js";
import {Trail, TrailQueue} from "./trail.js";
import {Work, WorkHandler} from "./work.js";
import DOMBuilder from "./dom_builder.js";
import ListenerLoader from "./listener_loader.js";

//vaious utility methods for generating timestamp, id.
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

const builder = new DOMBuilder();
const listenerLoader = new ListenerLoader();

let list_data = await fb.loadActiveLiFromDB();

listenerLoader.loadUlListener(todo_ul);
listenerLoader.loadUlListener(doing_ul);
listenerLoader.loadUlListener(done_ul);

todo_ul.appendChild(builder.buildActiveLi(list_data.todo));
doing_ul.appendChild(builder.buildActiveLi(list_data.doing));
done_ul.appendChild(builder.buildActiveLi(list_data.done));


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

const save_button = document.getElementById("save-button");
const sync_button = document.getElementById("sync-button");

save_button.addEventListener("click",onSaved);
sync_button.addEventListener("click",onSync);

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

//function on "Ctrl+s" key down
//parses current trail queue
function onSaved() {
  tq.parse();
  console.log("saved : ", Util.timestamp());

  const button = document.getElementById("save-button");
  button.classList.remove("reminder");
}

//:TODO : implement
function onUndo() {
  console.log("undo : ",Util.timestamp());
}

//function on "Ctrl+q" key down
//executes current trail queue
function onSync() {
  console.log("started syncing : ",Util.timestamp());

  onSaved();
  let sync_result = fb.sync(tq.dequeueToArray());
  if(sync_result.code == 200) {
    console.log("successfully synced : ",Util.timestamp());

    const button = document.getElementById("sync-button");
    button.classList.remove("reminder");
  }
  else { console.log("Error in sync : ",Util.timestamp(),sync_result.message);console.log(sync_result.trail) }
}

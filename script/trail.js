import Util from "./util.js";

//class Trail represents a change in list.
export class Trail {
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

  static moveJson(simpleJson) {
    return {
      TYPE : "MOVE",
      TIMESTAMP : Util.timestamp(),
      TARGET_ID : simpleJson.id,
      DETAILS : {
        FROM : simpleJson.from,
        TO : simpleJson.to,
      }
    };
  }

  static createJson(simpleJson) {
    return {
      TYPE : "CREATE",
      TIMESTAMP : Util.timestamp(),
      TARGET_ID : simpleJson.id,
      DETAILS : {
        CONTENT : "",
        TO : simpleJson.to
      }
    };
  }

  static editJson(simpleJson) {
    return {
      TYPE : "EDIT",
      TIMESTAMP : Util.timestamp(),
      TARGET_ID : simpleJson.id,
      DETAILS : {
        FROM : simpleJson.from,
        TO : simpleJson.to
      }
    };
  }

  static deleteJson(simpleJson) {
    return {
      TYPE : "DELETE",
      TIMESTAMP : Util.timestamp(),
      TARGET_ID : simpleJson.id,
      DETAILS : {
        FROM : simpleJson.from
      }
    };
  }
}

//class TrailQueue represents the frontend queue of changes in lists
//TODO : implement method parse
export class TrailQueue {
  constructor() {
    this._arr = [];
  }
  //add an item to the queue
  enqueue(item) {
    this._arr.push(item);
    const buttons = document.querySelectorAll("banner button");

    for(let b of buttons) {
      b.classList.add("reminder");
    }
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

3. delete a li (implemented)
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

reverse function
1 <-> 3
2-1 <-> 2-1
2-2 <-> 2-2
2-3 <-> ? cannot undo
*/

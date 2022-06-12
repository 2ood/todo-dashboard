export default class ListenerLoader {
  constructor() {}

  loadUlListener(target_ul) {
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

      while(target!=document) {
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

    const add_button = target_ul.parentNode.querySelector("button:first-of-type");

    target_ul.innerHTML="";
    target_ul.addEventListener("dragover",handleDrag);
    target_ul.addEventListener("drop",handleDrop);

    add_button.addEventListener("click",handleAdd);

  }

  loadLiListener(target_li) {
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

    target_li.addEventListener("dragstart",handleDragStart);
    target_li.addEventListener("dragend",handleDragEnd);
  }

  loadItemInputListener(target_input) {
    function handleChange(evt) {
      const src = evt.srcElement;

      if(src.classList.contains("none") && src.value!="") evt.srcElement.classList.remove("none");

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
    }

    target_input.addEventListener("change",handleChange);
  }

  loadCancelListener(target_button) {
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

    target_button.addEventListener("click",handleCancel);
  }
}



/*
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

    while(target!=document) {
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

*/

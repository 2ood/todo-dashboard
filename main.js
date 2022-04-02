class Work {
  constructor(content, generatedOn, isDone, isStarted, closedOn) {
    this.CONTENT = content;
    this.GENEREATE_DON = generatedOn;
    this.IS_DONE = isDone;
    this.IS_STARTED = isStarted;
    this.CLOSED_ON = closedOn;
  }

  toJson() {
    return {
      CONTENT : this.CONTENT,
      GENERATED_ON : this.GENERATED_ON,
      IS_DONE : this.IS_DONE,
      IS_STARTED : this.IS_STARTED,
      CLOSED_ON : this.CLOSED_ON
    };
  }
}

const firebaseConfig = {
  apiKey: "AIzaSyCSTx5Z9L4imimR2Hzz7a_Mo9RMisk9vDQ",
  authDomain: "ood-to-do.firebaseapp.com",
  projectId: "ood-to-do",
  storageBucket: "ood-to-do.appspot.com",
  messagingSenderId: "58882087407",
  appId: "1:58882087407:web:48d72fc07389e36e22be1a"
};

const app = firebase.initializeApp(firebaseConfig);
const firestore = app.firestore();
const todo_ul = document.getElementById("todo-ul");
const doing_ul = document.getElementById("doing-ul");
const done_ul = document.getElementById("done-ul");
const add_buttons = document.querySelectorAll("button.add");
const MILLISECONDS_OF_5MIN = 5*60*1000;

initializeList(todo_ul, "todo");
initializeList(doing_ul, "doing");
initializeList(done_ul, "done");

todo_ul.addEventListener("dragover",handleDrag);
doing_ul.addEventListener("dragover",handleDrag);
done_ul.addEventListener("dragover",handleDrag);


for(a of add_buttons) {
  a.addEventListener("click",(evt)=>{
    target_ul = evt.srcElement.parentNode.querySelector("ul:first-of-type");
    target_ul.appendChild(buildLi("",true));
  });
}

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
  setInterval(onSaved,MILLISECONDS_OF_5MIN)
});


function initializeList(target_ul, collection) {

  target_ul.innerHTML="";

  const collectionRef = firestore.collection(collection);
  collectionRef.orderBy("GENERATED_ON","desc").get().then((querySnapshot)=>{
    querySnapshot.forEach((doc) =>{
      if(doc.exists) {
          target_ul.appendChild(buildLi(doc.data().CONTENT,false));
      }
      });
    cancels = target_ul.getElementsByClassName("cancel");
    for(c of cancels) {
      c.addEventListener("click",handleCancel);
    }
  });
}

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

function handleCancel(evt) {
  evt.preventDefault();
  const target = evt.srcElement.parentNode;
  target.parentNode.removeChild(target);
}

function buildLi(value, isNone) {
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

function handleDragStart(evt) {
  evt.srcElement.classList.add("dragging");
  evt.srcElement.classList.remove("draggable");
}
function handleDragEnd(evt) {
  evt.srcElement.classList.remove("dragging");
  evt.srcElement.classList.add("draggable");
}

function handleDrag(evt) {
  evt.preventDefault();
  console.log("drag");
  const target_ul = todo_ul;
  const afterElement = getDragAfterElement(target_ul,evt.clientY);
  const dragging = document.querySelector(".dragging");
  target_ul.insertBefore(dragging,afterElement);
}

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
    else ;
  }

  return result;
}

function onSaved() {

}

function onSync() {
  //TODO : implement
}

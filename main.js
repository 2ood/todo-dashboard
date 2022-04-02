const firebaseConfig = {
  apiKey: "AIzaSyCSTx5Z9L4imimR2Hzz7a_Mo9RMisk9vDQ",
  authDomain: "ood-to-do.firebaseapp.com",
  projectId: "ood-to-do",
  storageBucket: "ood-to-do.appspot.com",
  messagingSenderId: "58882087407",
  appId: "1:58882087407:web:48d72fc07389e36e22be1a"
};

firebase.initializeApp(config);
const app = firebase.initializeApp(firebaseConfig);
const firestore = app.firestore();
const todayis = document.getElementById("today-is");
todayis.innerHTML += getTodayDocName();
const todayRef = firestore.collection('todo').doc(getTodayDocName());
const todo_ul = document.getElementById("todo-ul");
const add = document.getElementById("add");
const save = document.getElementById("save");
const go = document.getElementById("go");
const go_today = document.getElementById("go-today");
const target_date_input = document.getElementById("target-date");

target_date_input.value = getTodayDocName();
initializeList(getTodayDocName());

todo_ul.addEventListener("dragover",handleDrag);

add.addEventListener("click",(evt)=>{
  todo_ul.appendChild(buildLi("",true));
});


save.addEventListener("click",(evt)=>{
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
});


go.addEventListener("click",()=>{
  initializeList(target_date_input.value);
});

go_today.addEventListener("click",()=>{
  target_date_input.value = getTodayDocName();
  initializeList(target_date_input.value);
});

function initializeList(docName) {

  todo_ul.innerHTML="";

  const dateRef = firestore.collection('todo').doc(docName);
  dateRef.get().then((doc)=>{
    if(doc.exists) {
      const arr = doc.data().TODOS;
      if(arr.length==0) {
        let li = buildLi("(none)",true);
        todo_ul.appendChild(li);
      }
      for(let i=0;i<arr.length;i++) {
        todo_ul.appendChild(buildLi(arr[i],false));
      }
      cancels = todo_ul.getElementsByClassName("cancel");
      for(c of cancels) {
        c.addEventListener("click",handleCancel);
      }
    }
    else {
        dateRef.set({
          TODOS :[]
        });
        let li = buildLi("(none)",true);
        todo_ul.appendChild(li);
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
  console.log(target);
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
  const afterElement = getDragAfterElement(todo_ul,evt.clientY);
  const dragging = document.querySelector(".dragging");
  todo_ul.insertBefore(dragging,afterElement);

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


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
const todayis = document.getElementById("today-is");
todayis.innerHTML += getTodayDocName();
const todayRef = firestore.collection('todo').doc(getTodayDocName());
const todo_ul = document.getElementById("todo-ul");
const add = document.getElementById("add");
const save = document.getElementById("save");
const go = document.getElementById("go");
const target_date_input = document.getElementById("target-date");

target_date_input.value = getTodayDocName();
initializeList(getTodayDocName());


add.addEventListener("click",(evt)=>{
  let new_li = document.createElement("li");
  let input = document.createElement("input");
  let cancel = document.createElement("div");
  cancel.className= "cancel";
  cancel.innerHTML = "X";
  cancel.addEventListener("click",handleCancel);

  new_li.appendChild(input);
  new_li.appendChild(cancel);
  todo_ul.appendChild(new_li);
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
  });
});


go.addEventListener("click",()=>{
  initializeList(target_date_input.value);
});

function initializeList(docName) {

  todo_ul.innerHTML="";

  const dateRef = firestore.collection('todo').doc(docName);
  dateRef.get().then((doc)=>{
    if(doc.exists) {
      const arr = doc.data().TODOS;
      if(arr.length==0) {
        todo_ul.innerHTML+= `
        <li><input type="text" value="(None)" class="none"></input><div class="cancel">X</div></li>`;
        todo_ul.querySelector("input.none:first-of-type").addEventListener("change",(evt)=>{evt.srcElement.classList.remove("none");});
      }
      for(let i=0;i<arr.length;i++) {
        todo_ul.innerHTML+= `
        <li><input type="text" value="${arr[i]}"></input><div class="cancel">X</div></li>`;
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
          todo_ul.innerHTML+= `
          <li><input type="text" value="(None)" class="none"></input><div class="cancel">X</div></li>`;
          todo_ul.querySelector("input.none:first-of-type").addEventListener("change",(evt)=>{evt.srcElement.classList.remove("none");});
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

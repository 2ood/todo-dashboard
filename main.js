
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

todayRef.get().then((doc)=>{
  if(!doc.exists) {
    todayRef.set({
      TODOS :[]
    });
  } else ;
});

const todo_ul = document.getElementById("todo-ul");


todayRef.get().then((doc)=>{
  if(doc.exists) {
    const docs = doc.data();
    const arr = docs.TODOS;
    console.log("here");
    for(let i=0;i<arr.length;i++) {
      todo_ul.innerHTML+= `
      <li><input type="text" value="${arr[i]}"></input><div class="cancel">X</div></li>`;
    }
    cancels = todo_ul.getElementsByClassName("cancel");
    for(c of cancels) {
      c.addEventListener("click",handleCancel);
    }
  }
});

const add = document.getElementById("add");
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

const save = document.getElementById("save");
save.addEventListener("click",(evt)=>{
  const array = todo_ul.getElementsByTagName("input");
  let contents_array =[];
  for(let i=0;i<array.length;i++) {
    contents_array.push(array[i].value);
  }
  todayRef.update({
    TODOS : contents_array
  });
});

function getTodayDocName() {
  const today = new Date;
  const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  return date;
}

function handleCancel(evt) {
  evt.preventDefault();
  const target = evt.srcElement.parentNode;
  console.log(target);
  target.parentNode.removeChild(target);
}

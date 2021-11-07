window.onload=function() {
    imgs = document.getElementById("img-pool");
    bf = document.getElementById("changepic-forward");
    bb = document.getElementById("changepic-backward");
    picnum = document.getElementById("picnum");
    pw = document.querySelector("textarea#number");
    content= document.querySelector("button#shownum");
    addworks = document.getElementsByClassName("push-lock");
    addchecks = document.getElementsByClassName("add-check");
    dels = document.getElementsByClassName("smalldel");
    addComment = document.getElementById("add-comment");
    
    console.log("here");
    //----------implementation of picture changing----------------
    
    bf.onclick = function() {
        if(imgs.className=="1") imgs.className="2";
        else if(imgs.className=="2") imgs.className="3";
        else imgs.className="1";
        
        picnum.innerHTML=imgs.className;
        
        for(var i =0;i<imgs.childNodes.length;i++) {
            if(imgs.childNodes[i].id==imgs.className) imgs.childNodes[i].className="show";
            else imgs.childNodes[i].className="none";
        }
    }; //end of bf.onclick
    
    bb.onclick = function() {
        if(imgs.className=="2") imgs.className="1";
        else if(imgs.className=="3") imgs.className="2";
        else imgs.className="3";
        
        picnum.innerHTML=imgs.className;
        
        for(var i =0;i<imgs.childNodes.length;i++) {
            if(imgs.childNodes[i].id==imgs.className) imgs.childNodes[i].className="show";
            else imgs.childNodes[i].className="none";
        }
    }; //end of bb.onclick
    
    //----------end of implementation of picture changing----------------
    
    //----------implementation of saving shortkey----------------
    // saving shortkey is Alt+s
    document.addEventListener("keydown", on_keydown);
    function on_keydown(e){
        //console.log(e.key);
        if(e.altKey && e.key=='s'){
            console.log("save");
            save();
        }
        else if(e.key=='ArrowRight') bf.click();
        else if(e.key=='ArrowLeft') bb.click();
    }
    
    function save() {
        var htmlContent = [document.head.innerHTML,document.body.innerHTML];
        var bl = new Blob(htmlContent, {type:"text/html"});
        var a = document.createElement("a");
        a.href = URL.createObjectURL(bl);
        a.download="index.html";
        a.hidden=true;
        document.body.appendChild(a);
        a.click();
    }
    //----------end of implementation of saving shortkey----------------
    
    //----------implementation of showing password area----------------
    content.onclick = function() {
        if(pw.className!="none") {
            pw.className="none";
            this.innerHTML="전화번호 보이기";
        }
        else { 
             pw.className="content";
            this.innerHTML="전화번호 숨기기";
        }
    };
    //----------end of implementation of showing password area----------------
    
    
    //----------implementation of adding work groups----------------
    for(var i=0;i<addworks.length;i++) {
        console.log(addworks.length);
        addworks[i].onclick=function() {
            var tar = document.getElementById(this.id+"w");
            if(tar.className=="workgroup-hidden"){
                tar.className="workgroup";
                this.className="push-lock-selected";
            }
            else {
                tar.className="workgroup-hidden";
                this.className="push-lock";
            }
        }
    }
    
    //----------end of implementation of adding work groups----------------
    
    //----------implementation of adding todos----------------
    for(var i =0;i<addchecks.length;i++) {
        addchecks[i].onclick=function() {
            var tar = document.getElementById(this.id+"c");
            tar.appendChild(buildChecks());
        }
    }
    
    function buildChecks() {
        var d = document.createElement("div");
        d.className="work";
        var ic = document.createElement("input");
        ic.setAttribute("type","checkbox");
        var ict= document.createElement("input");
        ict.setAttribute("type","text");
        ict.className="todo";
        ict.setAttribute("placeholder","항목");
        ict.setAttribute("value","");
        
        var icb = document.createElement("button");
        icb.className="smalldel";
        icb.innerHTML="삭제";
        icb.onclick = function() {
            if(confirm("진짜로?")){
                var tar = this.parentNode;
                tar.parentNode.removeChild(tar);
            }
        }
        
        d.appendChild(ic);
        d.appendChild(ict);
        d.appendChild(icb);
        return d;
    }
    //----------end of implementation of adding todos----------------
    
    //----------implementation of smalldels----------------
    for(var i=0;i<dels.length;i++) {
        dels[i].onclick= function() {
            if(confirm("진짜로?")){
                var tar = this.parentNode;
                tar.parentNode.removeChild(tar);
            }
        }
    }
        
    //----------end of implementation of smalldels----------------
    
    //----------implementation of adding comment div----------------
    addComment.onclick = function() {
        work = document.createElement("div");
        work.className="work";
        
        time = document.createElement("input");
        time.className="name";
        time.type="text";
        time.placeholder="시간";
        
        n= document.createElement("input");
        n.className = "name";
        n.type="text";
        n.placeholder="이름";
        
        b = document.createElement("button");
        b.className= "smalldel";
        b.id = "commentdel";
        b.innerHTML="삭제";
        b.onclick =function(){
            if(confirm("진짜로?")){
                var tar = this.parentNode;
                tar.parentNode.removeChild(tar);
            }
        };
        
        w = document.createElement("div");
        w.className="work";
        
        ta = document.createElement("textarea");
        ta.className = "content";
        ta.type= "text";
        ta.placeholder="근무가 특이사항 없습니다.";
        
        w.appendChild(ta);
        work.appendChild(time);
        work.appendChild(n);
        work.appendChild(b);
        work.appendChild(w);
        this.parentNode.insertBefore(work,this);
    };
}
//----------end of implementation of adding comment div----------------
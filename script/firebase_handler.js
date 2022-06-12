import Util from "./util.js";

//class FirebaseHandler groups functions that interacts with firestore directly.
export default class FirebaseHandler {
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

  async loadActiveLiFromDB() {
    const result = {
      todo : [],
      doing : [],
      done : []
    };

    const collectionRef = this.firestore.collection("active");
    let querySnapshot = await collectionRef.orderBy("GENERATED_ON","desc").get();

    querySnapshot.forEach((doc) =>{
      if(doc.exists) {
        const docs = doc.data();

        if(!docs.IS_STARTED) result.todo.push(docs);
        else if(docs.IS_DONE) result.done.push(docs);
        else result.doing.push(docs);
      }
    });

    return result;
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

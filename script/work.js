//class Work represents each listed works (to do, doing, or done).
export class Work {
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

export class WorkHandler {
  constructor(){}

  static fromJson(json) {
    return new WorkHandler();
  }

  toJson(){}
}

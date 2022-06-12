//vaious utility methods for generating timestamp, id.
export default class Util {
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

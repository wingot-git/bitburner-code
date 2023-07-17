//
// Library file for various generally useful functions.
//

export function getTimeStamp () {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return time;
}
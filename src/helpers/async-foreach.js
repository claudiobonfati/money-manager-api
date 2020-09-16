// Set forEach as async function
Array.prototype.forEachAsync = async function forEach(callback, thisArg) {
    if (typeof callback !== "function") {
        throw new TypeError(callback + " is not a function");
    }
    var array = this;
    thisArg = thisArg || this;
    for (var i = 0, l = array.length; i !== l; ++i) {
        await callback.call(thisArg, array[i], i, array);
    }
};
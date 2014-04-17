module.exports = Debug;
var util = require('util'), stream = require('stream');
util.inherits(module.exports, stream.Transform);
function Debug(options) {
    stream.Transform.call(this, options);
    this._writableState.objectMode = true;
    this._readableState.objectMode = false;
}
Debug.prototype._transform = function(chunk, encoding, cb) {
    this.push(JSON.stringify(chunk, null, '\t'));
    this.push('\n');
    cb();
};


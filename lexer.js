module.exports = Lexer;
var util = require('util'), stream = require('stream');
util.inherits(module.exports, stream.Transform);
function Lexer(options) {
    stream.Transform.call(this, options);
    this._writableState.objectMode = false;
    this._readableState.objectMode = true;

    this._buffer = '';
}
Lexer.prototype._transform = function(chunk, encoding, cb) {
    this._buffer += chunk;
    var lines = this._buffer.split(/\r?\n/);
    this._buffer = lines.pop();
    lines.forEach(this._line.bind(this));
    cb();
};
Lexer.prototype._flush = function(cb) {
    var rem = this._buffer.trim();
    if (rem) {
        this._line(rem);
    }
    cb();
};
Lexer.prototype._line = function(line) {
    try {
        this._lineSync(line);
    } catch (e) {
        this.emit('error', e);
        this.end();
    }
};
Lexer.prototype._lineSync = function(line) {
    line = line.trim();
    if (line.length == 0) return;
    while((line = line.replace(/^\s*/, '')).length > 0) {
        var ch = line.charAt(0);
        if (ch == '"') {
            line = this._string(line);
        } else if (ch == '=') {
            line = line.substr(1); // chomp
            this.push({type: 'op', data: '='});
        } else if (/[\d.]/.test(ch)) {
            line = this._number(line);
        } else {
            line = this._word(line);
        }
    }

    this.push({'type': 'lineBreak'});
};
Lexer.prototype._word = function (line) {
    var words = line.match(/^\w+/);
    if (words !== null){
        var word = words[0];
        this.push({type: word});
        return line.substr(word.length);
    }
    throw new Error("can't lex word " + line);
};
Lexer.prototype._string = function(line) {
    line = line.substr(1); // leading "
    var ix = line.indexOf('"');
    if (ix < 0) throw new Error('unterminated string ' + line);
    this.push({type: 'string', data: line.substr(0, ix)});
    return line.substr(ix + 1);
};
Lexer.prototype._number = function(line) {
    var number = line.match(/^\d*\.?\d+(\s|$)/);
    if (number !== null) {
        this.push({type: 'num', data: parseFloat(number[0], 10)});
        return line.substr(number[0].length);
    } else { throw new Error('not a number: ' + line); }
};

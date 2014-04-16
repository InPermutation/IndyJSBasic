module.exports = Parser;
var util = require('util'), stream = require('stream');
util.inherits(module.exports, stream.Transform);
function Parser(options) {
    stream.Transform.call(this, options);
    this._writableState.objectMode = true;
    this._readableState.objectMode = true;

    this._state = 'newStmt';

    this._stmtstack = [];
    this._statements = [];
}
function last(a) { return a[a.length - 1]; }

Parser.prototype._transform = function(token, _enc, cb) {
    try {
        this._innerTransform(token);
    } catch (e) {
        this.emit('err', e);
        this._innerTransform = function(){};
    }
    cb();
};
Parser.prototype._innerTransform = function(token) {
    switch (this._state) {
        case 'newStmt':
            switch(token.type) {
                case 'END':
                    this._statements.push({type: 'END'});
                    this._state = 'EOL';
                    break;
                case 'PRINT':
                    this._statements.push({type: 'PRINT'});
                    this._state = 'stringExpr';
                    break;
                case 'FOR':
                    this._statements.push({type: 'FOR'});
                    this._state = 'forVar';
                    break;
                case 'NEXT':
                    var forBody = this._statements;
                    if (this._stmtstack.length === 0)  throw new Error('no matching FOR for NEXT');
                    this._statements = this._stmtstack.pop();
                    var forStatement = last(this._statements);
                    forStatement.body = forBody;
                    this._state = 'EOL';
                    break;
                default: throw new Error('unknown statement type ' +JSON.stringify(token));
            }
            break;
        case 'forVar':
            last(this._statements).varName = token.type;
            this._state = 'forAssignment';
            break;
        case 'forAssignment':
            if(token.data !== '=') throw new Error('expected = ; found ' + JSON.stringify(token));
            this._state = 'forInit';
            break;
        case 'forInit':
            if(token.type !== 'num') throw token;
            last(this._statements).init = token.data;
            this._state = 'to';
            break;
        case 'to':
            if(token.type!=='TO') throw token;
            this._state = 'forStep';
            break;
        case 'forStep':
            if(token.type!=='num') throw token;
            last(this._statements).limit = token.data;

            last(this._statements).step = 1;

            this._stmtstack.push(this._statements);
            this._statements = [];
            this._state = 'EOL';
            break;
        case 'stringExpr':
            if(token.type!=='string') throw token;
            last(this._statements).expr = token;
            this._state = 'EOL';
            break;
        case 'EOL':
            if(token.type !== 'lineBreak') throw token;
            if(this._stmtstack.length === 0) {
                this._statements.forEach(this.push.bind(this));
                this._statements = [];
            }
            this._state = 'newStmt';
            break;
        default: throw token;
    }
};
Parser.prototype._flush = function(cb) {
    if(this._stmtstack.length !== 0) this.emit('err', new Error('unclosed ' + last(last(this._stmtstack)).type));
    cb();
}




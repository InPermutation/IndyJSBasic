
module.exports = Generator;
var util = require('util'), stream = require('stream');
util.inherits(module.exports, stream.Transform);
function Generator(options) {
    stream.Transform.call(this, options);
    this._writableState.objectMode = true;
    this._readableState.objectMode = false;

    this.tabs = 0;
}
Generator.prototype._transform = function(chunk, encoding, cb) {
    this.statement(chunk);
    cb();
};
Generator.prototype.statement = function(statement) {
    var type = statement['type'];
    var func = this[type];
    if (func) {
        this.leadTabs();
        func.call(this, statement);
    } else throw type;
};
Generator.prototype.leadTabs = function() {
    this.push(new Array(this.tabs+1).join('  '));
};
Generator.prototype.PRINT = function(stmt) {
    this.push('console.log(');
    this.push(JSON.stringify(stmt.expr.data));
    this.push(');\r\n');
};
Generator.prototype.END = function(stmt) {
    this.push('process.exit(0);\r\n');
};
Generator.prototype.FOR = function(stmt) {
    this.push('for(var ');
    this.push(stmt.varName);
    this.push(' = ');
    this.push(stmt.init.toString());
    this.push('; ');
    this.push(stmt.varName);
    this.push(' <= ');
    this.push(stmt.limit.toString());
    this.push('; ');
    this.push(stmt.varName);
    this.push(' += ');
    this.push(stmt.step.toString());
    this.push(') {\r\n');
        this.tabs++;
        stmt.body.forEach(this.statement.bind(this));
        this.tabs--;
    this.leadTabs();
    this.push('}\r\n');
};


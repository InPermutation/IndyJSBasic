var Lexer = require('./lexer'), Parser = require('./parser'),
    Generator = require('./generator');
var lexer = new Lexer();
var parser = new Parser();
var generator = new Generator();

var Jsonify = require('./jsonify');
var jsonify = new Jsonify();

// lexer.pipe(jsonify).pipe(process.stderr);
// parser.pipe(jsonify).pipe(process.stderr);

process.stdin
    .pipe(lexer)
    .pipe(parser)
    .pipe(generator)
    .pipe(process.stdout);


var Lexer = require('./lexer'), Parser = require('./parser'),
    Generator = require('./generator');
var lexer = new Lexer();
var parser = new Parser();
var generator = new Generator();

process.stdin
    .pipe(lexer)
    .pipe(parser)
    .pipe(generator)
    .pipe(process.stdout);


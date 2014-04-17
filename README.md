IndyJSBasic
===========

**The 30 Minute Compiler**

This is the source code from the [IndyJS April 2014 meetup](http://www.meetup.com/indyjs/events/167314462/).

`basic.js` expects source code on stdin and outputs generated JavaScript to stdout.

Use shell redirection to perform an actual compilation:

`node basic.js < test.bas > test.js && node test.js`

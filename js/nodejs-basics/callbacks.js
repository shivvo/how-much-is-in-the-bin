var fs = require('fs');

// var data = fs.readFileSync('hello.js');
// console.log(data.toString());

fs.readFile('hello.js', function (err, data) {
  if (err) return console.error(err);
  console.log(data.toString());
});

console.log("Program Ended");


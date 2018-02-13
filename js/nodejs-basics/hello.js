var http = require('http');

http.createServer(function (request, response) {
  // HTTP Status Ok
  // Content type: text
  response.writeHead(200, {'Content-Type' : 'text/plain'});
  
  // Well hello
  response.end('Well hello');
}).listen(20000);

console.log('well hello at 20000');

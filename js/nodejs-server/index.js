var express = require('express');
var bodyParser = require('body-parser');

var database = [];

function createMessage(sender, content) {
  return {
    sender: sender,
    content: content,
    timestamp: Date()
  };
}

var app = express();
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('hello, world!\n');
});

app.post('/sendMessage', function (req, res) {
  var sender = req.body.sender;
  var content = req.body.content;
  var message = createMessage(sender, content);
  database.push(message);
  res.send("");
});

app.get('/allMessages', function (req, res) {
  var formattedMessages = database.map(function (e) {
    return e.sender + "(" + e.timestamp + "): " + e.content;
  });
  var allMessagesString = formattedMessages.join("\n") + "\n";
  res.send(allMessagesString);
});

var server = app.listen(20000, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("Chatroom app listening at http://%s:%s", host, port)
});

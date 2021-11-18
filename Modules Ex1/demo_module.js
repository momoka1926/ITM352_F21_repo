//モジュールは何かを動かすための部品のようなもの
//To include a module, use the require() function with the name of the module
var http = require('http');
//now your application has access to the HTTP module, and is able to create a server
var dt = require('./myfirstmodule');
//Notice that we use ./ to locate the module, that means that the module is located in the same folder as the Node.js file.
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write("The date and time are currently: " + dt.myDateTime());
  res.end();
}).listen(8080);
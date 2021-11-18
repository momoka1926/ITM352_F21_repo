var http = require('http');
var fs = require('fs');
http.createServer(function (req, res) {
  //The fs.readFile() method is used to read files on your computer
  fs.readFile('demofile1.html', function(err, data) {
    res.write(data);
  });

}).listen(8080);




// The File System module has methods for creating new files:
// 1. fs.appendFile()
//  appends （付け加える）specified content to a file
// 2. fs.open()
//  takes a "flag" as the second argument, if the flag is "w" for "writing", the specified file is opened for writing
// 3. fs.writeFile()
//  replaces the specified file and content if it exists


// The File System module has methods for updating files:
// 1. fs.appendFile()
// appends the specified content at the end of the specified file
// 2. fs.writeFile()
// replaces the specified file and content

// To delete a file with the File System module, use the fs.unlink() method

// To rename a file with the File System module, use the fs.rename() method.
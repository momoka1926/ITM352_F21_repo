// var userdata = require('./user_data.json')
const fs = require('fs'); // allows us file system

var filename = 'user_data.json'
var user_data_str = fs.readFileSync(filename, 'utf-8');
var user_data_obj = JSON.parse(user_data_str);

console.log(user_data_obj["Kazman"]["password"]);
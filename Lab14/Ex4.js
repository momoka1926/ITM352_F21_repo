var fs = require('fs');
var express = require('express');
var app = express();
var filename = './user_data.json'
var myParser = require("body-parser");


if (fs.existsSync(filename)) {
    var file_stats = fs.statSync(filename);
    console.log(`${filename} has ${file_stats.size} characters`);
    // have reg data file, so read data and parse into user_data_obj
    data = fs.readFileSync(filename, "utf-8");
    users_data = JSON.parse(data);
    console.log(data);
} else {
    console.log(`${filename} does not exist`);
}

username = 'newuser';
users_data[username] = {};
users_data[username].password = 'newpass';
users_data[username].email = 'newuser@user.com';

// a method inbuilt in express to recognize the incoming Request Object as strings or arrays, middleware
app.use(express.urlencoded({ extended: true }));

app.get("/login", function (request, response) {
    // Give a simple login form
    str = `
<body>
<form action="" method="POST"> 
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
});

app.get("/register", function (request, response) {
    // Give a simple register form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
<input type="email" name="email" size="40" placeholder="enter email"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
 });

 app.post("/register", function (request, response) {
    // process a simple register form
    username = request.body.username;
    users_data[username] = {};
    users_data[username].password = request.body.password;
    users_data[username].email = request.body.email;
    console.log(users_data);
 });

 
app.post("/login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not 
    let login_username = request.body['username'];
    let login_password = request.body['password'];
    // check if username exeist, then check password entered match password stored
    if (typeof users_reg_data [login_username] != 'undefined') {
        if (users_reg_data[login_username]["password"] == login_password) {
            response.send(`${login_username} is loged in`);
        } else {
            response.redirect(`./login?err=incorrect password for ${login_username}`); 
        }
    } else {
        response.send(`${login_username} does not exist`);
    }

    response.send('processing login' + JSON.stringify(request.body))
});


app.listen(8080, () => console.log(`listening on port 8080`));

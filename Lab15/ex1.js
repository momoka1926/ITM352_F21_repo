var fs = require('fs');
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());


app.get('/set_cookie', function (request, response){
    //this will send a cookie to the requester
    response.cookie('name', 'Dan');
    response.send('The name cookie has been sent')
});

app.get('/use_cookie', function (request, response){
    //this will get the name cookie from the requester and display a message
    //console.log(request.cookies);
    response.send(`Welcome to the Use Cookie page ${request.cookies.name}`)
});

// recognize the incoming Request Object as strings or arrays
app.use(express.urlencoded({ extended: true }));


var pos = 0;
var bytesRead = 0;
var filename = './user_data.json';

if (fs.existsSync(filename)) {
    var stats = fs.statSync(filename);
    console.log(filename + ' has ' + stats["size"] + ' characters');

  
    data = fs.readFileSync(filename, 'utf-8');
   users_reg_data = JSON.parse(data);
   console.log(data);

} else {
    console.log(filename + ' does not exist!');
}


//add the submitted form data to users_reg_data then saves this updated object to user_data.json using JSON.stringify()
app.get("/login", function (request, response) {
    // Give a simple login form
    str = `
<body>
<form action="javascript" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
 });

app.post("/login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    the_username = request.body['username'];
    the_password = request.body['password'];
    // check if username exeist, then check password entered match password stored
    if(typeof users_reg_data[the_username] != 'undefined') {
       if(users_reg_data[the_username].password == the_password) {
           // if matches, 
           response.send(`${the_username} is logged in`);
       } else {
           // if the password doesn't match, 
           response.redirect('/login');
       }
    }
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
    users_reg_data[username] = {};
    users_reg_data[username].password = request.body.password;
    users_reg_data[username].email = request.body.email;
    console.log(users_reg_data);
    fs.writeFileSync(filename,JSON.stringify(users_reg_data));
    response.send('registerd!');
 });
app.listen(8080, () => console.log(`listening on port 8080`));
var fs = require('fs');
var express = require('express');
var app = express();

//request for roading cookie
// var cookieParser = require('cookie-parser');
// app.use(cookieParser());

// cookie parser will be buit in express-session
// express-session is going to send a cookie with session id
var session = require('express-session');
app.use(session({secret: "MySecretKey", resave: true, saveUninitialized: true}));


app.get('/set_cookie', function (request, response){
    //this will send a cookie to the requester
    // modify the header
    response.cookie('name', 'Momoka', {maxAge: 5*1000}); // key=name, value=Momoka
    // send a reponse
    response.send('The name cookie has been sent')
});

app.get('/use_cookie', function (request, response){
    //this will get the name cookie from the requester and display a message
    //console.log(request.cookies);
    // request.cookies come from cookieParser
    response.send(`Welcome to the Use Cookie page ${request.cookies.name}`)
});

//don't need set_session because it automatically sets.
app.get('/use_session', function (request, response){
    //this will get the name cookie from the requester and display a message
    //console.log(request.cookies);
    // request.cookies come from cookieParser
    response.send(`welcome, your session ID is ${request.session.id}`)
});

// recognize the incoming Request Object as strings or arrays
app.use(express.urlencoded({ extended: true }));


var filename = 'user_data.json';
if (fs.existsSync(filename)) {
    // have user_data file, so read data and parse into users_reg_data object
    let user_data_str = fs.readFileSync(filename, 'utf-8'); // reads content of the file and returns as a string
    var users_reg_data = JSON.parse(user_data_str); // parses into oject and stores in users_reg_data
    var file_stats = fs.statSync(filename);
    console.log(`${filename} has ${file_stats.size} characters`);
} else {
    console.log(`Hey! ${filename} does not exist!`)
}


//add the submitted form data to users_reg_data then saves this updated object to user_data.json using JSON.stringify()
app.get("/login", function (request, response) {
    //check if already logged in by seeing if the username cookie exists
    var welcome_str = 'Welcome. You need to login.';
    if(typeof request.cookies[username] != 'undefined'){
        welcome_str = `Welcome ${request.cookies[username]}. You logged in last on ${request.session.lastLogin}`;
    }
    // Give a simple login form
    str = `
<body>
${welcome_str}<br>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
 });

app.post("/login", function (request, response) {
    // Get last login from session if it exists.  If not, create first login
    // var lastLoginTime = 'first login';
    // if(typeof request.session.lastLogin != 'undefined'){
    //     lastLoginTime = request.session.lastLogin;
    // }
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    the_username = request.body['username'];
    the_password = request.body['password'];
    // console.log(lastLoginTime);
    // check if username exeist, then check password entered match password stored
    if(typeof users_reg_data[the_username] != 'undefined') {
        // when user succesufully log in, and the username and password match,
       if(users_reg_data[the_username].password == the_password) {
           //display the last time a user logged in
           request.session.lastLogin = new Date();
           response.cookie(`username`, the_username);
           response.send(`${the_username} is logged in. You last logged in on ${lastLoginTime}`);
           return;
           // last login may not be existed, so use typeof

           // Do I have last login?
           if(typeof request.session['last login'] != undefined) {
               //get last login
               var last_login = request.session['last login'];
           } else {
               //if i don't have, set last_login to first login 
               var last_login = request.session['First login'];
           }
           //last login to the current date
           request.session['last login'] = new Date().toISOString(); // put login date into session
           // if matches, 
           response.send(`You last logging in on ${last_login}`);
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
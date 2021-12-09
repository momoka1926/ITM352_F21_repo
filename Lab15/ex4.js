var express = require('express');
var app = express();
const fs = require('fs');

var cookieParser = require('cookie-parser');
app.use(cookieParser());

// cookie parser will be buit in express-session
// express-session is going to send a cookie with session id
var session = require('express-session');
app.use(session({secret: "MySecretKey", resave: true, saveUninitialized: true}));

var filename = './user_data.json';

if (fs.existsSync(filename)) {
    // have user_data file, so read data and parse into object
    var file_stats = fs.statSync(filename); 
    var user_data_str = fs.readFileSync(filename, 'utf-8'); // reads content of the file and returns as a string
    var user_data = JSON.parse(user_data_str); // turns the string into an object
    console.log(`${filename} has ${file_stats.size} characters`);
} else {
    console.log(`Hey! ${filename} doesn't exist!`)
};

app.get('/set_cookie', function(request, response){
    //this will send a cookie to the requester
    // modify the header
    response.cookies('name', 'Momoka', {maxAge: 5000});// key=name, value=Momoka
    // send a reponse
    response.send('The name cookie has been sent')
});

app.get('/use_cookie', function(request, response){
    // this will get the name from the client (requester) and display a message
    console.log(request.cookies);
   // request.cookies come from cookieParser
    response.send(`Welcome to the use cookie page ${request.cookies.name}!`);
});

//don't need set_session because it automatically sets.
app.get('/use_session', function(request, response){
    //this will get the name cookie from the requester and display a message
    //console.log(request.cookies);
    // request.cookies come from cookieParser
    response.send(`welcome, your session ID is ${request.session.id}`);
    session.destroy();
})

// recognize the incoming Request Object as strings or arrays
app.use(express.urlencoded({ extended: true })); // this takes the data  and puts it into a request.body for the POST 


//add the submitted form data to users_reg_data then saves this updated object to user_data.json using JSON.stringify()
app.get("/login", function (request, response) {
    // check if already logged in by seeing if the username cookie exists
    var welcome_str = 'Welcome! You need to login.';
    if(typeof request.cookies.username != 'undefined') {
        welcome_str = `Welcome ${request.cookies.username}! You last loged in on ${request.session['last login']}`;
    }; 
    // if it gets a login it will generate 'this' function which is a login page
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
    /// Get last login from session if it exists.  If not, create first login
    // var lastLoginTime = 'first login';
    // if(typeof request.session.lastLogin != 'undefined'){
    // lastLoginTime = request.session.lastLogin;
    // }
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    let login_username = request.body['username'];
    let login_password = request.body['password'];
    //check if usernane exists, then check if password entered matches password stored
    if (typeof user_data[login_username] != 'undefined') {
        if (user_data[login_username]['password'] == login_password) {
            if (typeof request.session['last login'] != 'undefined'){
                var last_login = request.session['last login']
            } else {
                var last_login = request.session['last login'] = 'first time logging in '  
            }
            //display the last time a user logged in
            request.session['last login'] = new Date().toISOString() 
            response.cookie('username', login_username);
            response.send(`You last logged in on ${last_login}`)
        }
        else {
            response.send(`Incorrect password!`)
        }
    } else {
        response.send(`User, ${login_username}, does not exist!`);
    }


});

app.get("/register", function (request, response) {
    // Give a simple register form
    str = `
        <body>
        <form action="" method="POST">
        <input type="text" name="username" size="40" placeholder="enter username" ><br />
        <input type="text" name="name" size="40" placeholder="enter name" ><br />
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
    let new_login_username = request.body['username'];
    let new_login_password = request.body['password'];
    let new_login_repeatpassword = request.body['repeat_password'];
    let new_login_email = request.body['email'];
    fs.writeFileSync(filename,JSON.stringify(users_reg_data));
    response.send('registerd!');   
});



app.listen(8080, () => console.log(`listening on port 8080`));
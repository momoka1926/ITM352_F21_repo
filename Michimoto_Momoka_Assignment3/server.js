/* 
Author: Momoka Michimoto
Description: This makes the server. Also checking if the customer enter the valid quantity.
Sources: Assignment1, Lab13, Lab14 Ex4, W3resource, Assignment1_MVC_server, Assignment 2 code example and Assignment 3 code example.
Professor Port helped me some codes.
Got some tips from classmates.  (Vo Tina)
*/


// borrowed from Lab13
var products = require('./products.json');
// set inital inventory 
//products.forEach((prod, i) => { prod.quantity_available = 10; });
var express = require('express');
var app = express();
var fs = require('fs');
const qs = require('querystring');

//get the users data from json file
var filename = './user_data.json';

//get session
var session = require('express-session');
app.use(session({ secret: "MySecretKey", resave: true, saveUninitialized: true }));

//get cookie
var cookieParser = require('cookie-parser');

app.use(express.urlencoded({ extended: true }));


//not to delete the data which customers entered in order page, to bring exact the same data to invoice
var qty_data = {};

// borrowed from Lab 14 
if (fs.existsSync(filename)) {
    // have reg data file, so read data and parse into user_data_obj
    var file_stats = fs.statSync(filename); //return information about the given file path
    var data = fs.readFileSync(filename, 'utf-8'); // read the file and return its content.
    var user_data = JSON.parse(data);
} else {
    console.log(filename + ' does not exist!');
}

// monitor all requests
// checking to see if it gets the right things
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path, request.body);
    next(); //keep going
});

// this returns the shopping cart for the current session
app.post("/get_cart", function (request, response) {
    if (typeof request.session.cart == 'undefined') {
        request.session.cart = {};
    }
    response.json(request.session.cart);
});

// returns the Javascript for defining the produc info 
app.get("/products.js", function (request, response, next) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});


//get the body
app.use(express.urlencoded({ extended: true }));

//----------------CART-----------------------//
app.post("/add_to_cart", function (request, response) {
    let POST = request.body;
    var products_key = POST['products_key']; // POST the products_key 
    var errors = {}; // assume no errors
    var empty = true; //assume no quantities
    var quantity_array = [];

    for (let i in products[products_key]) {
        q = POST['quantity'][i];

        // check if it's a valid quantity
        if (isNonNegInt(q) == false) {
            errors['invalid' + i] = `Sorry, ${q} is not a valid quantity for ${products[products_key][i].name}`;
        }

        // check if quantity desired is avaialble
        if (q > products[products_key][i].quantity_available) {
            errors['quantity' + i] = `We don't have ${q} ${products[products_key][i].name} available. Sorry for inconvenience.`;
        }

        //check if the quantity is selected
        if (q > 0) {
            empty = false;
            console.log("Quantities selected")
        } else if ((typeof errors['invalid' + i] != 'undefined') && (typeof errors['quantity' + i] != 'undefined')) {
            errors['empty'] = `Please put some quantities.`;
        }
    }

    //error message on new line
    if (Object.keys(errors).length > 0) {
        var errorMessage = '';
        for (err in errors) {
            errorMessage += errors[err] + '\n';
        }

        let params = new URLSearchParams(request.body);
        params.append('errorMessage', errorMessage);
        response.redirect(`./products_display.html?${params.toString()}`);
        return;
    } else { // put quantities in cart and go to cart page
        // make shopping cart if it's not exist
        if (typeof request.session.cart == 'undefined') {
            request.session.cart = {};
        }
        // put these quantities for this products_key in the cart, and create a new
        if (typeof request.session.cart[products_key] == 'undefined') {
            request.session.cart[products_key] = [];
        }
        for (let i in products[products_key]) {
            quantity_requested = Number(POST['quantity'][i]);
            // add quantities_requested to the existing value
            if (typeof request.session.cart[products_key][i] != 'undefined') {
                request.session.cart[products_key][i] += quantity_requested; //add to it exisiting cart
            } else {
                request.session.cart[products_key][i] = quantity_requested; // put items in the cart

            }
        }
        console.log(request.session);
        response.redirect(`./cart.html`);
    }
});

//-------------UPDATE CART-------------------//
app.post("/update_cart", function (request, response) {
    //replace the shopping cart data
    var update_cart = request.body;
    var errors = {}; //assume no errors
    console.log(update_cart, request.session.cart);

    // Check that the new quantities wanted are available/valid
    //if there is no errors
    if (Object.keys(errors).length == 0) {
        for (let pk in request.session.cart) {
            for (let i in request.session.cart[pk]) {
                if(typeof update_cart[`quantity_${pk}_${i}`] != 'undefined'){
                // add/remove updated quantities from inventory
                products[pk][i].quantity_available -= request.session.cart[pk][i];
                // update cart
                request.session.cart[pk][i] = Number(update_cart[`quantity_${pk}_${i}`]);
            }
        }
    }
    }
    let params = new URLSearchParams(request.body);
    params.append('errors', JSON.stringify(errors));
    response.redirect("./cart.html?"); // goes to shopping cart if correct
});


//----------------LOGIN page----------------- //
// borrowed from useful example for Assignment2 and also from Vo Tina & Kam Chloe
app.post("/process_login", function (request, response) {
    var errors = {};
    // Process login form POST and redirect to logged in page if ok, back to login page if not 
    var login_username = request.body['username'].toLowerCase();
    var login_password = request.body['password'];

    // check if username exist, then check password entered match password stored
    if (typeof user_data[login_username] != 'undefined') {
        // take "password" and check if the password in the textbox is right
        if (user_data[login_username].password == request.body['password']) {
            // store username, email, and full name in the session
            request.session['username'] = login_username; // username
            request.session['email'] = user_data[login_username]['email']; // email
            request.session['fullname'] = user_data[login_username]['fullname']; //fullname

            var user_info = { "username": login_username, "email": user_data[login_username].email };
            response.cookie('user_info', JSON.stringify(user_info), { maxAge: 30 * 60 * 1000 }); // expires in 30 mins

            console.log(`Welcome ${request.session['username']}`);

            //then, go back to the products page
            console.log(`${login_username} successfully logged in`);
            response.redirect('./products_display.html');
            return;
        } else {
            // code from Kam Chloe
            incorrectLogin_str = 'The password is incorrect.';
            console.log(errors);
            request.query.login_username = login_username;
            request.query.name = user_data[login_username].name;
        }

    } else {
        incorrectLogin_str = 'The username does not exists or wrong.';
        console.log(errors);
        request.query.login_username = login_username;
    }
    //then go back to login with errors (sticky)
    response.redirect(`./login.html?loginMessage=${incorrectLogin_str}&wrong_pass=${login_username}`);
});



// -------------REGISTER page-------------- //
// borrowed from W3resource
app.post("/register", function (request, response) {
    console.log(request.body);
    var reg_errors = {};
    // check username 
    var reg_username = request.body['username'].toLowerCase();
    // only letters and numbers, at least 4 but less than 10, 
    if (/^[0-9a-zA-Z]{4,10}$/.test(request.body.username) == false) {
        reg_errors['username'] = 'Please use only letters and numbers, at least 4 but less than 10 characters';
    }
    // unique case insenitive
    if (typeof user_data[reg_username] != 'undefined') {
        reg_errors['username'] = 'This username is already taken'
    }

    // check fullname
    if (/^[A-Za-z, ]+$/.test(request.body.fullname) == false) {
        reg_errors['name'] = 'Please enter YOUR FULL NAME here';
    }
    // check email
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(request.body.email) == false) {
        reg_errors['email'] = 'Please use a valid email (Ex: name@jseafoods.com)';
    }

    // check password
    if (request.body.password.length < 6) {
        reg_errors['password'] = 'You need to have a minimum of 6 characters'
    };

    // check psw-repeat
    if (request.body.password != request.body.repeat_password) {
        reg_errors['repeat_password'] = `Repeat password is not the same as password you typed above`;
    }


    //borrowed from Assignment 2 useful example, Li Xinfei
    //save the information to user_data.json
    if (Object.keys(reg_errors).length == 0) {
        var username = request.body['username'].toLowerCase();
        user_data[reg_username] = {};
        user_data[reg_username].name = request.body.name;
        user_data[reg_username].password = request.body.password;
        user_data[reg_username].email = request.body.email;
        // save updated user_data obj to file
        fs.writeFileSync(filename, JSON.stringify(user_data));
        // send cookies after the user registers for an account
        response.cookie('login', username, { maxAge: 30 * 60 * 1000 }); // expire in 30 mins
        response.cookie('email', username.email);
        //directly move to the invoice page to purchase
        response.redirect('./invoice.html?' + params.toString());
        return;
    } else {
        //go back to register page with errors
        let errs_obj = { "reg_errors": JSON.stringify(reg_errors) };
        let params = new URLSearchParams(errs_obj);
        response.redirect(`./register.html?` + params.toString());
    }
});



// -----------LOGOUT--------------- //
app.get("/logout", function (request, response, next) {
    var user_info = JSON.parse(request.cookies['user_info']); //makes user_info into JSON
    var username = user_info["username"];
    // messages will show up after logout
    logout_msg = `<script>alert('${user_info.name} has successfully logged out!'); location.href="./index.html";</script>`;
    response.clearCookie('user_info'); //destroys cookie
});

//---------PURCHASE---------------//
app.post("/confirm", function (request, response) {
    let username = request.cookies["login"]; //get username from cookies
    console.log(req.cookies);
    // send user to login page
    if (typeof req.cookies["login"] == 'undefined') {
        res.redirect(`./login.html`);
        return;
    }
    //check errors
    var errors = {};
    if (JSON.stringify(errors) === '{}') {
        //put their username and email in the URL/string
        let params = new URLSearchParams();
        params.append('username', username);
        params.append('email', user_data[username].email);
        res.redirect(`./invoice.html?${params.toString()}`);
    } else { //if wrong,
        res.redirect(`./cart.html`);
    }
});

// -----------COMPLETE PURCHASE and EMAIL------------- //
app.post('/complete_purchase', function (request, response, next) {
    var invoice = request.body; //save invoice data
    var user_info = JSON.parse(request.cookies["user_info"]); //user_info into JSON
    var the_email = user_info["email"]; //save users' email
    var transporter = nodemailer.createTransport({
        // sets up mail server
        //security, only functions on UH network
        host: "mail.hawaii.edu",
        port: 25,
        secure: false, // use TLS
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
    });

    var mailOptions = {
        from: 'momo2@jstore.com',
        to: the_email,
        subject: `Thanks, ${user_info.name} For Purchasing from Fresh JStore`,
        html: invoice.invoicehtml
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            status_str = 'There was an error and your invoice could not be emailed :(';
        } else {
            status_str = `Your invoice was mailed to ${the_email}`;
        }
        response.json({ "status": status_str });
    });
    response.clearCookie('user_info'); //destroys cookie
    request.session.destroy(); //delete the session, once email is sent
});


// process purchase request (validate quantities, check quantity available)
// codes are referenced from info_server_Ex5.js
function isNonNegInt(q, returnErrors = false) {
    errors = []; // assume no errors
    if (q == '') q = 0  //blank means 0
    if (Number(q) != q) errors.push('<font color="red">Not a number</font>'); //check if value is a number
    if (q < 0) errors.push('<font color="red">Negative value</font>'); // Check if it is non-negative
    if (parseInt(q) != q) errors.push('<font color="red">Not an integer</font>'); // Check if it is an integer

    return returnErrors ? errors : (errors.length == 0);
}


// route all other GET requests to files in public 
app.use(express.static('./public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));
/* 
Author: Momoka Michimoto
Description: This makes the server. Also checking if the customer enter the valid quantity.
Sources: Assignment1, Lab13, Lab14 Ex4, W3resource, and Assignment 2 code example.
Professor Port helped me some codes.
Got some tips from classmates. (Vo Tina, Li Xinfei)
*/


// borrowed from Lab13
var products = require('./products.json');
// set inital inventory 
// products.forEach((prod, i) => { prod.quantity_available = 10; });
var express = require('express');
var app = express();
var fs = require('fs');
const qs = require('querystring');

//get the users data from json file
var filename = './user_data.json';

//get session
var session = require('express-session');
var products_data = require('./products.json');

app.use(session({ secret: "MySecretKey", resave: true, saveUninitialized: true }));

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


//get the body
app.use(express.urlencoded({ extended: true }));


//----------------LOGIN page-----------------
// borrowed from useful example for Assignment2 and also from Vo Tina (thanks!)
app.post("/process_login", function (request, response) {
    var errors = {};
    // Process login form POST and redirect to logged in page if ok, back to login page if not 
    var username = request.body['username'].toLowerCase();

    // check if username exist, then check password entered match password stored
    if (typeof user_data[username] != 'undefined') {
        // take "password" and check if the password in the textbox is right
        if (user_data[username].password == request.body['password']) {
            // if matches, (true)
            let params = new URLSearchParams(qty_data);
            params.append('username' , username); //put username into params
            params.append('email' , user_data[username].email);
            //directly move to the invoice page
            response.redirect('./invoice.html?' + params.toString());
           return;
        } else {
            // if the password doesn't match, (false)      
            errors['login_err'] = 'Wrong Password';
        }
    } else {
        // if the username doesn't exist
        errors['login_err'] = 'Wrong Username';
    }
    //then go back to login with errors
    let params = new URLSearchParams(errors);
    params.append('username' , username); //put username into params
    response.redirect(`./login.html?` + params.toString());
});
//----------------------------


// -------------REGISTER page--------------
// borrowed from W3resource
app.post("/register", function (request, response) {
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


    //borrowed from Assignment 2 useful example
    //save the information to user_data.json
    if (Object.keys(reg_errors).length == 0) {
        user_data[reg_username] = {};
        user_data[reg_username].name = request.body.name;
        user_data[reg_username].password = request.body.password;
        user_data[reg_username].email = request.body.email;
        // save updated user_data obj to file
        fs.writeFileSync(filename, JSON.stringify(user_data));

        let params = new URLSearchParams(qty_data); // put saved qty data into query
            params.append('username' , request.body.username); //put username into query
            params.append('email' , user_data[reg_username].email);
            //directly move to the invoice page
            response.redirect('./invoice.html?' + params.toString());
            return;
    } else {
        //then go back to register page with errors
        let errs_obj = { "reg_errors": JSON.stringify(reg_errors) };
        let params = new URLSearchParams(errs_obj);
        params.append('reg_data' , JSON.stringify(request.body)); //put reg data into params
        params.append('username' , request.body.username); //put username into params
        response.redirect(`./register.html?` + params.toString());
    }
});
//--------------------------




//routing
app.get("/products.js", function (request, response, next) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});



//-----------PURCHASE-------------
//get the quantity data from the order form, then check it and 
// copied from my assignment1 server.js and modified it to bring the customers to invoice page after they login 
app.post('/process_form', function (request, response, next) {
    var quantities = request.body["quantity"];
    var quantity_available = 10;
    var errors = {};
    let reqbody = request.body;
    var has_quantities = false; //assume no quantities

    // Check that quantities are non-negative integers
    for (i in quantities) {
        // check ith quantity
        if (isNonNegInt(quantities[i]) == false) {
            errors['quantity_' + i] = `Please choose a valid quantity for ${products[i].name}`;
        }
        // Check if any quanties were selected
        if (quantities[i] > 0) {
            has_quantities = true;
        }
        // Check if quantity desired is avaialble
        if (quantities[i] > products[i].quantity_available) {
            errors['quantity_available' + i] = `We don't have ${(quantities[i])} ${products[i].name} available. sorry for inconvenience.`;
        }
    }
    // Check if quantity is selected
    if (!has_quantities) {
        errors['no_quantities'] = `Please select some items!`;
    }


    let qty_obj = { "quantity": JSON.stringify(quantities) };
    // console.log(Object.keys(errors));
    //ask if the object is empty or not
    if (Object.keys(errors).length == 0) {
        // remove from inventory quantities
        for (i in products) {
            products[i].quantity_available -= Number(quantities[i]);
        }
        // save quantity data for use later in invoice
        qty_data = qty_obj;
        response.redirect('./login.html');
    } else { //if i have errors, take the errors and go back to products_display.html
        let errs_obj = { "errors": JSON.stringify(errors) };
        console.log(qs.stringify(qty_obj));
        response.redirect('./products_display.html?' + qs.stringify(qty_obj) + '&' + qs.stringify(errs_obj));
    }

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
//------------------


// route all other GET requests to files in public 
app.use(express.static('./public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));
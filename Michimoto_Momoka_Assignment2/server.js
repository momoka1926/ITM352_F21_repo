/* 
Momoka Michimoto
This makes the server.
Also checking if the customer enter the valid quantity.
Code referenced from Assignment1, Lab14 Ex4, and Assignment 2 code example.
Professor Port helped me some codes.
Got some tips from classmates and W3resource.
*/

var products = require('./products.json');
// set inital inventory 
products.forEach((prod, i) => { prod.quantity_available = 10; });
var express = require('express');
var app = express();
var fs = require('fs');
const qs = require('querystring');
const { request } = require('express');

//get the users data from json file
var filename = './user_data.json';

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

//get the body
app.use(express.urlencoded({ extended: true }));


//----------------LOGIN page-----------------
app.post("/process_login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not 
    var username = request.body['username'].toLowerCase();
    var password = request.body['password'];

    // check if username exist, then check password entered match password stored
    if (typeof user_data[username] != 'undefined') {
        // take "password" and check if the password in the textbox is right
        if (user_data[username].password == request.body['password']) {
            // if matches, (true)
            qty_data['username'] = username;
            qty_data['email'] = user_data[username].email;
            let params = new URLSearchParams(qty_data);
            //directly move to the invoice page
            response.redirect('./invoice.html?' + params.toString());
           
        } else {
            // if the password doesn't match, (false)      
            request.query.username = username;
            request.query['login_err'] = 'Wrong Password';
        }
    } else {
        // if the username doesn't match
        request.query.password = password;
        request.query['login_err'] = 'Wrong Username';
    }
    //then,
    params = new URLSearchParams(request.query);
    response.redirect(`./login.html?` + params.toString());
});
//----------------------------


// -------------REGISTER page--------------
app.post("/register", function (request, response) {
    var reg_errors = {};
    var reg_username = request.body['username'].toLowerCase();
    var reg_password = request.body['password'];

    //USERNAME
    if (/^[A-Za-z, ]+$/.test(request.body.name)) {
    } else {
        reg_errors['name'] = 'Please enter YOUR FULL NAME here';
    }
    if (/^[0-9a-zA-Z]+$/.test(request.body.name)) {
    }
    else {
        reg_errors['name'] = 'Please use only letters';
    }
    if (typeof user_data[reg_username] != undefined) {
        reg_errors['username'] = 'This username is already taken'
    }
    if (typeof user_data[reg_username] == '') {
        reg_errors['username'] = `Please decide your username`;
    }

    //EMAIL
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(request.body.email)) {
    } else {
        reg_errors['email'] = 'Please use a valid email (Ex: name@jseafoods.com)'
    }
    //PASSWORD
    if (request.body.password.length < 7) {
        reg_errors['password'] = 'Please use minimum of 7 characters to your password'
    };
    //REPEAT PASSWORD 
    if (request.body.password !== request.body.repeat_password) {
        reg_errors['repeat_password'] = `Repeat password is not the same as password you typed above`;
    }

    //borrowed from Assignment 2 useful example
    //save the information to user_data.json
    if (Object.keys(reg_errors).length == 0) {
        user_data[username] = {};
        user_data[username].name = request.body.name;
        user_data[username].password = request.body.password;
        user_data[username].email = request.body.email;

        fs.writeFileSync(filename, JSON.stringify(user_data), "utf-8");
        qty_data['username'] = username;
        qty_data['email'] = user_data[username]['email'];
        let params = new URLSearchParams(qty_data);
        response.redirect(`./invoice.html?` + params.toString());
    } else {
        request.body['reg_errors'] = JSON.stringify(reg_errors);
        let params = new URLSearchParams(request.body);
        response.redirect(`./register.html?` + params.toString());
    }
});
//--------------------------



// monitor all requests
// checking to see if it gets the right things
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path, request.body);
    next(); //keep going
});

//routing
app.get("/products.js", function (request, response, next) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});



//-----------PURCHASE-------------
//get the quantity data from the order form, then check it and 
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
        response.redirect('./invoice.html?' + qs.stringify(qty_obj));
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
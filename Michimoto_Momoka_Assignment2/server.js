/* 
Momoka Michimoto
This makes the server for my store.
Also checking if the customer enter the valid quantity.
Code referenced from Assignment1, Lab14 Ex4, and Assignment 2 code example.
Professor Port helped me some codes.
*/

var products = require('./products.json');
// set inital inventory 
products.forEach((prod, i) => { prod.quantity_available = 10; });
var express = require('express');
var app = express();
var fs = require('fs');
const qs = require('querystring');

//get the users data from json file.
var filename = './user_data.json';

// borrowed from Lab 14 
if (fs.existsSync(filename)) {
    // have reg data file, so read data and parse into user_data_obj
        var file_stats = fs.statSync(filename); //return information about the given file path
        var data = fs.readFileSync(filename, 'utf-8'); // read the file and return its content.
        var users_reg_data = JSON.parse(data);
    } else {
        console.log(filename + ' does not exist!');
    }    

//get the body
app.use(express.urlencoded({ extended: true }));


// REGISTER section
app.post("/register_form", function (request, response) {
    var reg_errors = {};
    var reg_username = request.body['username'].toLowerCase();
    var reg_password = request.body['password'];
    //password error
    if (request.body[username] > 8 || request.body[username] < 6) {
        reg_errors['username'] = 'Please use minimum of 6 characters and maximum of 8 characters.'
    };
    //username error
    if (request.body[username] != undefined) {
        reg_errors['username'] = 'This username is already taken.'
    };
    
});

//LOGIN section
app.post("/process_login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not 
    var log_username = request.body['username'].toLowerCase();
    var log_password = request.body['password'];
    // check if username exist, then check password entered match password stored
    if (typeof users_reg_data[log_username] != 'undefined') {
        // take "password" and check if the password in the textbox is right
        if (users_reg_data[log_username]["password"] == login_password) {
            // if matches, 
            response.redirect('./invoice.html?'+ params.toString());
        } else {
            // if the password doesn't match,             
            response.redirect(`./login.html`+ params.toString());
        }
    }
});

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
        for(i in products){
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

//login page
app.post('/process_login', function (request, response, next) {
    var errors = {};
    let reqbody = request.body;
    var has_quantities = false; 
});

//register page
app.post('/register_form', function (request, response, next) {
    var errors = {};
    let reqbody = request.body;
    var has_quantities = false; 
});

// route all other GET requests to files in public 
app.use(express.static('./public')); 

// start server
app.listen(8080, () => console.log(`listening on port 8080`));
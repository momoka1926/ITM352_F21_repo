/* 
Momoka Michimoto
This makes the server for my store.
Also checking if the customer enter the valid quantity.
Code referenced from Lab13 Ex4 and screen cast.
Professor Port helped me some codes.
*/

var products = require('./products.json');
// set inital inventory 
products.forEach((prod, i) => { prod.quantity_available = 10; });
var express = require('express');
var app = express();
const qs = require('querystring');
const { truncate } = require('fs');

// monitor all requests
// checking to see if it gets the right things
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next(); //keep going
});

//get the body
app.use(express.urlencoded({ extended: true }));

//routing
app.get("/products.js", function (request, response, next) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

//get the quantity data from the order form, then check it and 
app.post('/process_form', function (request, response, next) {
    var quantities = request.body["quantity"];
    // var quantity_available = 10;
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
            errors['available_' + i] = `We don't have ${(quantities[i])} ${products[i].name} available.`;
        }
    }
        // Check if quantity is selected
        if (!has_quantities) {
            errors['no_quantities'] = `Please select some items!`;
         }


    let qty_obj = { "quantity": JSON.stringify(request.body["quantity"]) };
    // console.log(Object.keys(errors));
    //ask if the object is empty or not
    if (Object.keys(errors).length == 0) {
        // remove from inventory quantities
        for(i in products){
        products[i].quantity_available -= Number(reqbody[`quantities${i}`]);
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

// route all other GET requests to files in public 
app.use(express.static('./public')); 

// start server
app.listen(8080, () => console.log(`listening on port 8080`));
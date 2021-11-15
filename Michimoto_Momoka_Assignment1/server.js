// referenced from Lab13 Ex4 and Assignment1 examples//
var products_array = require('./public/products.js');
var express = require('express');
var app = express();
var myParser = require("body-parser");

// monitor all requests
// checking to see if it gets the right things
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next(); //keep going
});

//share the data 
app.use(myParser.urlencoded({ extended: true }));
app.post('/process_form', function (request, response) {
    //process_form(request.body, response);
    response.send(request.body);
});

app.post('/process_form', function (request, response, next) {
    let brand = products[0]['brand'];
    let brand_price = products[0]['price'];

    console.log(request.body);
    var q = request.body['quantity_textbox'];//get the value
    if (typeof q != 'undefined') {
        // if idon't have value it's not gonna respose 
        if (isNonNegInt(q)) {
            products[0].total_sold += Number(q);
            response.send(`<h2>Thank you for purchasing ${q} ${brand}. Your total is \$${q * brand_price}!</h2> `);
        } else {
            response.send(`Errors: ${q} is not a quantity. Hit hte back button to fix.`)
        }
    } else {
        response.send(`Hey! You need to pick some stuff!`)
    }
    next();
});


// process purchase request (validate quantities, check quantity available)
// codes are from info_server_Ex5.js
function isNonNegInt(q, returnErrors = false) {
    errors = []; // assume no errors
    if (Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
    if (Number(q) != q) errors.push('Not a number!'); //check if value is a number
    if (q < 0) errors.push('Negative value!'); // Check if it is non-negative
    if (q > 10) errors.push('Invalid Values'); //Check if the number is less than 10
    if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer

    return returnErrors ? errors : (errors.length == 0);
}

// route all other GET requests to files in public 
app.use(express.static('./public'));
//anytime it gets GET request, it's going to go in to the public directory and look for the path you said.  

// start server
app.listen(8080, () => console.log(`listening on port 8080`));
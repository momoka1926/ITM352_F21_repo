var products_array = require('./public/products.js');
var express = require('express');
var app = express();

// Routing 

// monitor all requests
// checking to see if it gets the right things
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
});

//share the data 
app.use(express.urlencoded({ extended: true }));
app.post('/process_form', function (request, response) {
    //process_form(request.body, response);
    response.send(request.body);
});

// process purchase request (validate quantities, check quantity available)
// codes are from info_server_Ex5.js
function isNonNegInt(q, returnErrors = false) {
    errors = []; // assume no errors
    if (Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
    else {
        if (q < 0) errors.push('Negative value!'); // Check if it is non-negative
        if (q > 10) errors.push('Invalid Values'); //Check if the number is less than 10
        if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer
    };

    return returnErrors ? errors : (errors.length == 0);
}

// route all other GET requests to files in public 
app.use(express.static('./public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));
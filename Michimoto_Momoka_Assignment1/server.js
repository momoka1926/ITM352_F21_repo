var products_array = require('./products.json');
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
function isNonNegInt(q, returnErrors = false) {
    errors = []; // assume no errors
    if (q < 0) errors.push('Negative Values'); //Check if the number is negative value
    if (q > 10) errors.push('Invalid Values');
    //Check if the numbr is less than 10
    return returnErrors ? errors : (errors.length == 0);
}

// route all other GET requests to files in public 
app.use(express.static('./public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));
// referenced from Lab13 Ex4 and Assignment1 examples//

var data = require('./public/products.js');
var express = require('express');
var app = express();
var myParser = require("body-parser");
var fs = require('fs');
var products = data.products;

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

//provide micro-services
var products = require('./public/products.js');

app.get("./public/products.js", function (request, response, next) {
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`;
   response.send(products_str);
});

app.post('/process_form', function (request, response, next) {
    let POST = request.body; 
    console.log(request.body);

    if (typeof POST != 'undefined') {
        // check if it's validate data
        var hasvalidquantities= true; //assume whether the quantities textbox is true
        var haspurchase = false; //assume whether if it's not true
        for (i in products) {
            qty=POST[`quantity${i}`]
            hasvalidquantities = hasvalidquantities && isNonNegInt(qty); //check if it's not negative integer
            haspurchase = haspurchase || qty > 0; //check if it's grater than 0
        }
        // if all quantities are valid, then generate the invoice
         var qstring = querystring.stringify(POST);
         if (hasvalidquantities && haspurchase) {
            response.redirect("invoice.html?" + qstring);
        } else {
            response.redirect("products_display.html?" + qstring);
        } //stick
    }

});


// process purchase request (validate quantities, check quantity available)
// codes are referenced from info_server_Ex5.js
function isNonNegInt(q, returnErrors = false) {
    errors = []; // assume no errors
    if (Number(q) != q) errors.push('<font color="red">Not a number</font>'); // Check if string is a number value
    if (Number(q) != q) errors.push('<font color="red">Not a number</font>'); //check if value is a number
    if (q < 0) errors.push('<font color="red">Negative value!</font>'); // Check if it is non-negative
    if (q > 10) errors.push('<font color="red">Invalid Values</font>'); //Check if the number is less than 10
    if (parseInt(q) != q) errors.push('<font color="red">Not an integer</font>'); // Check if it is an integer

    return returnErrors ? errors : (errors.length == 0);
}

// route all other GET requests to files in public 
app.use(express.static('./public'));
//anytime it gets GET request, it's going to go in to the public directory and look for the path you said.  

// start server
app.listen(8080, () => console.log(`listening on port 8080`));


function process_quantitiy_form (POST, response){
    if(typeof POST['purchase_submit_button'] != 'undefined'){
        var contents = fs.readFileSync('./views/display_quanitities_template.view','utf8');
         receipt = '';
        for (i in products){
            let q = POST[`quantity_textbox${i}`];
            let model = products[i]['model'];
            let model_price = products[i]['price]'];
            if (isNonNegInt(q)) {
                receipt += eval('`' + contents + '`');
            } else{
                receipt += `<h3> <font color="red">${q} is not a valid quantity for ${model}! </h3>`;

            }
            response.send(receipt);
            response.end();
        }
    }
}



var attributes  =  "Momoka;20;20.5; -19.5";

var parts = attributes.split(';');

/*
for(part of parts) {
    console.log(`${part} isNonNegInt: ${isNonNegInt(part)}`);
}
*/

parts.forEeach((item,index) => {console.log(`part ${item} is ${(isNonNegInt(item)?'a':'not a')} quantity`);} ); 

function isNonNegInt(q, returnErrors = false){
    // Check if a string q is a non-neg integer.  If returnRrros is true, the arrayif errors is returned.  
    // Otrhes returns true if q is a non-neg int.
    errors = []; // assume no errors at first
    if(Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
    if(q < 0) errors.push('Negative value!'); // Check if it is non-negative
    if(parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer

    return returnErrors ? errors : (errors.length == 0);
}



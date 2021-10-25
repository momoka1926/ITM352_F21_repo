var coins =('Quarters: %d Dimes: %d Nickles: %d Pennies: %d');

amount = 73;

// Get the max number of quarters
quarters = parseInt (amount/25);

// Get the max number of dimes from leftpver
leftover = amount%25;
dimes = parseInt (leftover/10);

// Get the max number of nickles from leftover
leftover = amount%10;
nickles = parseInt (leftover/5);

// What's left
pennies = amount%5;

console.log(`We need ${quarters} quarters, ${dimes} dimes, ${nickles} nickles, and ${pennies} pennies.`);
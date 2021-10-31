var month = 1;
var day = 26;
var year = 2001;

step1 = 01;
step2 = parseInt(step1/4);
step3 = step1 + step2;
step5 = step3 + day;
step8 = step5;
step9 = step8 - 1; // not a leap year
step10 = step9 % 7;


console.log(step10);


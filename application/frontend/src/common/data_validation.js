//Performs regex test to check if parameter passed is a number (true if yes, false if no)
export function validateNumber(numberParam) {
    const regex = /(0|[1-9][0-9]*)/;
    return regex.test(numberParam);
}

//Performs regex test to check if parameter passed is pure letters only (true if yes, false if no)
export function validateName(nameParam) {
    const regex = /^[A-Za-z ]+$/;
    return regex.test(nameParam);
}

//Performs regex test to check if parameter passed is strong enough. Requirements:
//ONE LOWERCASE LETTER
//ONE UPPERCASE LETTER
//ONE DIGIT
//ONE SPECIAL CHARACTER
//6 CHARACTERS LONG
// export function validatePasswordStrength(passwordParam) {
//     const regex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,})/
//     return regex.test(passwordParam)
// }

//Performs regex test to check if the parameter passed is a valid email
export function validateEmail(emailParam) {
    //RFC 5322 Official Standard, source: https://emailregex.com/
    // eslint-disable-next-line
    const regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    return regex.test(emailParam)
}

export function validateRegistrationDetails(data) {
    //Pipeline data into variables
    const { username, forename, surname, email, password, passwordReentry, tncAgreed } = data;
    
    //Result array of response messages from validation
    let response = [];

    //Check if username isn't empty
    if (username === "") {
        response.push("Please enter your username!");
    }
    //Check if the forename is not valid
    if (!validateName(forename)) {
        response.push("Please enter your forename correctly!")
    }
    //Check if the surname is not valid
    if (!validateName(surname)) {
        response.push("Please enter your surname correctly!")
    }
    //Check if the email is not valid
    if (!validateEmail(email)) {
        response.push("Please enter an existing email address!")
    }
    //Password checking
    if (password !== "" && passwordReentry !== "" && password !== passwordReentry) {
        response.push("Passwords do not match!")
    }
    if (password === "") {
        response.push("Please enter a password!")
    } 
    if (password !== "" && passwordReentry === "") {
        response.push("Please re-enter your password!")
    }
    // if (password !== "" && passwordReentry !== "" && !validatePasswordStrength(password)) {
    //     response.push("Password must contain one upper & lowercase letter, one digit, one special character, 6 characters long!");
    // }
    //Check if they didn't agree with TnC
    if(tncAgreed === false) {
        response.push("You must agree to the Terms and Conditions!")
    }

    //return response array
    return response;
}
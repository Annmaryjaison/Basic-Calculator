const calculator = document.querySelector('.calculator');
const calculatorScreen = document.querySelector('.calculator-screen');
const buttons = document.querySelector('.calculator-buttons');

let currentInput = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;

function updateScreen() {
    calculatorScreen.value = currentInput;
}

function inputDigit(digit) {
    // If the screen currently shows "Error", clear it before inputting digits
    if (currentInput === "Error") {
        currentInput = digit;
        waitingForSecondOperand = false; // Reset state
    } else if (waitingForSecondOperand === true) {
        currentInput = digit;
        waitingForSecondOperand = false;
    } else {
        currentInput = currentInput === '0' ? digit : currentInput + digit;
    }
    updateScreen();
}

function inputDecimal(dot) {
    // If the screen currently shows "Error", clear it and start with "0."
    if (currentInput === "Error") {
        currentInput = '0.';
        waitingForSecondOperand = false; // Reset state
        updateScreen();
        return;
    }

    if (waitingForSecondOperand === true) {
        currentInput = '0.';
        waitingForSecondOperand = false;
        updateScreen();
        return;
    }

    if (!currentInput.includes(dot)) {
        currentInput += dot;
    }
    updateScreen();
}

function handleOperator(nextOperator) {
    // If the screen shows "Error", clear it and start a new operation
    if (currentInput === "Error") {
        firstOperand = null; // Clear previous state
        operator = null;
        waitingForSecondOperand = false;
        currentInput = '0'; // Reset display to 0
        updateScreen(); // Update screen to '0'
        return; // Prevent further processing with error state
    }

    const inputValue = parseFloat(currentInput);

    // If an operator is pressed consecutively, just update the operator
    if (operator && waitingForSecondOperand) {
        operator = nextOperator;
        return;
    }

    // If firstOperand is null, set the current input as the first operand
    if (firstOperand === null && !isNaN(inputValue)) {
        firstOperand = inputValue;
    } else if (operator) {
        const result = operate(firstOperand, inputValue, operator);

        // Check if the operation resulted in an error (e.g., division by zero)
        if (isNaN(result) && operator === '/') { // Specifically for division by zero
            currentInput = "Error";
            firstOperand = null; // Clear state to force reset
            operator = null;
            waitingForSecondOperand = false;
        } else {
            currentInput = String(result);
            firstOperand = result;
        }
    }

    waitingForSecondOperand = true;
    operator = nextOperator;
    updateScreen();
}

// Function to handle square root and square
function handleFunction(func) {
    // If the screen shows "Error", clear it and do nothing or reset
    if (currentInput === "Error") {
        resetCalculator(); // Full reset
        return;
    }

    let inputValue = parseFloat(currentInput);

    if (isNaN(inputValue)) {
        // If currentInput is not a valid number (e.g., just a dot or empty),
        // or if it was "Error" and handled above, do nothing or show an error
        currentInput = "Error"; // Or handle this more gracefully
        updateScreen();
        return;
    }

    let result;
    switch (func) {
        case 'sqrt':
            if (inputValue < 0) {
                result = "Error"; // Cannot find square root of negative number
            } else {
                result = Math.sqrt(inputValue);
            }
            break;
        case 'square':
            result = inputValue * inputValue; // Or Math.pow(inputValue, 2)
            break;
        default:
            return;
    }

    if (result === "Error") { // If sqrt resulted in error
        currentInput = "Error";
        firstOperand = null;
        operator = null;
        waitingForSecondOperand = false;
    } else {
        currentInput = String(result);
        firstOperand = parseFloat(currentInput);
        operator = null;
        waitingForSecondOperand = false;
    }
    updateScreen();
}

function operate(first, second, op) {
    switch (op) {
        case '+':
            return first + second;
        case '-':
            return first - second;
        case '*':
            return first * second;
        case '/':
            // Explicitly return NaN (Not a Number) for division by zero
            if (second === 0) {
                return NaN;
            }
            return first / second;
        default:
            return second;
    }
}

function resetCalculator() {
    currentInput = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    updateScreen();
}

buttons.addEventListener('click', (event) => {
    const { target } = event;

    if (!target.matches('button')) {
        return;
    }

    // If the screen shows "Error" and "AC" is not pressed, clear the error
    // before processing other button clicks.
    if (currentInput === "Error" && !target.classList.contains('clear')) {
        // This makes sure any new number or operator input clears the error state
        // The AC button is handled by resetCalculator
        if (target.classList.contains('number') || target.classList.contains('decimal')) {
             currentInput = target.value; // Start new input
             waitingForSecondOperand = false;
             firstOperand = null;
             operator = null;
             updateScreen();
             return;
        }
    }

    if (target.classList.contains('operator')) {
        handleOperator(target.value);
        return;
    }

    if (target.classList.contains('number')) {
        inputDigit(target.value);
        return;
    }

    if (target.classList.contains('decimal')) {
        inputDecimal(target.value);
        return;
    }

    if (target.classList.contains('clear')) {
        resetCalculator();
        return;
    }

    if (target.classList.contains('function')) {
        handleFunction(target.value);
        return;
    }
});

// Initial screen update
updateScreen();
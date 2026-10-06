const form = document.querySelector(".calculator form");
const display = document.querySelector('input[name="display"]');

if (!(form instanceof HTMLFormElement) || !(display instanceof HTMLInputElement)) {
    throw new Error("Calculator form or display is missing.");
}

function calculate(expression) {
    let position = 0;

    function skipWhitespace() {
        while (/\s/.test(expression[position] || "")) {
            position += 1;
        }
    }

    function parseExpression() {
        let result = parseTerm();
        skipWhitespace();

        while (expression[position] === "+" || expression[position] === "-") {
            const operator = expression[position];
            position += 1;
            const right = parseTerm();
            result = operator === "+" ? result + right : result - right;
            skipWhitespace();
        }

        return result;
    }

    function parseTerm() {
        let result = parseUnary();
        skipWhitespace();

        while (expression[position] === "*" || expression[position] === "/") {
            const operator = expression[position];
            position += 1;
            const right = parseUnary();

            if (operator === "/" && right === 0) {
                throw new RangeError("Cannot divide by zero.");
            }

            result = operator === "*" ? result * right : result / right;
            skipWhitespace();
        }

        return result;
    }

    function parseUnary() {
        skipWhitespace();

        if (expression[position] === "+" || expression[position] === "-") {
            const operator = expression[position];
            position += 1;
            const value = parseUnary();
            return operator === "-" ? -value : value;
        }

        return parseNumber();
    }

    function parseNumber() {
        skipWhitespace();
        const start = position;
        let hasDigits = false;

        while (/[0-9]/.test(expression[position] || "")) {
            position += 1;
            hasDigits = true;
        }

        if (expression[position] === ".") {
            position += 1;
            while (/[0-9]/.test(expression[position] || "")) {
                position += 1;
                hasDigits = true;
            }
        }

        if (!hasDigits) {
            throw new SyntaxError("Expected a number.");
        }

        return Number(expression.slice(start, position));
    }

    const result = parseExpression();
    skipWhitespace();

    if (position !== expression.length) {
        throw new SyntaxError("Unexpected character.");
    }
    if (!Number.isFinite(result)) {
        throw new RangeError("The result is too large.");
    }

    return result;
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
});

form.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLInputElement)) {
        return;
    }

    const { action, value } = event.target.dataset;

    if (action === "clear") {
        display.value = "";
    } else if (action === "delete") {
        display.value = display.value.slice(0, -1);
    } else if (action === "decimal") {
        display.value += ".";
    } else if (action === "equals") {
        try {
            display.value = String(calculate(display.value));
        } catch (error) {
            if (error instanceof SyntaxError || error instanceof RangeError) {
                display.value = "Error";
            } else {
                throw error;
            }
        }
    } else if (value) {
        if (display.value === "Error") {
            display.value = "";
        }
        display.value += value;
    }
});

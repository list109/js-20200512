/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
    switch (size) {
        case 0:
            return '';
        case undefined:
            return string;
        default:
            return getTrimedString();
    }

    function getTrimedString() {
        let currentNumber = 0;

        return [...string].reduce((prev, letter) => {
            if (prev[prev.length - 1] === letter) {
                return (++currentNumber < size) ? prev + letter : prev;
            }
            currentNumber = 0;
            return prev + letter;
        }, '')
    }
}

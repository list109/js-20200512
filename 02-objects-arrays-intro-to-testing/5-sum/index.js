/**
 * Sum - returns sum of arguments if they can be converted to a number
 * @param {number} n value
 * @returns {number | function}
 */
export function sum (n) {
    increase.toString = () => n || 0;
    
    function increase(newValue) {
        return sum(n + newValue);
    }
    
    return increase;
}

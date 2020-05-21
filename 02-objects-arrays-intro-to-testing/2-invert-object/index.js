/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
    return obj && Object.entries(obj).reduce((prev, [key, value]) => {
        prev[value] = key;
        return prev;
    }, {});
}

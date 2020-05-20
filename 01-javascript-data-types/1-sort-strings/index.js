/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    return arr.sort((a, b) => {
      let comparingResult = a.localeCompare(b, undefined, {
        caseFirst: 'upper',
      });
      switch (param) {
        case 'asc':
          return comparingResult;
        case 'desc':
          return -comparingResult;
      }
    });
  }



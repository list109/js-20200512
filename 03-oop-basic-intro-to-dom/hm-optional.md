Необходимо передать в функцию такие параметры, при вызове с которыми
функция возвращает булевское значение "true"

```javascript
    // a = true;
    function returnTrue0(a) {
        return a;
    }

    // a = 'true';
    function returnTrue1(a) {
      return typeof a !== 'object' && !Array.isArray(a) && a.length === 4;
    }

    // a = NaN;
    function returnTrue2(a) {
        return a !== a;
    }

    // a = {toString() {return 1}};
    // b = 1;
    // c = {toString() {return 1}};
    function returnTrue3(a, b, c) {
        return a && a == b && b == c && a != c;
    }

    // a = 2 ** 53 - 1
    function returnTrue4(a) {
        return (a++ !== a) && (a++ === a);
    }

    // a = {value, toString() {return 'value'}};
    function returnTrue5(a) {
        return a in a;
    }

    // a = [0]; a.toString = () => 0;
    function returnTrue6(a) {
        return a[a] == a;
    }

    // a = b = {value: 3, toString() {return this.value--}};
    function returnTrue7(a, b) {
        return a === b && 1/a < 1/b; 
    }
```

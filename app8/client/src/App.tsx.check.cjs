
const fs = require('fs');
const content = fs.readFileSync('/home/nopparus2/www/app8/client/src/App.tsx', 'utf8');
const lines = content.split('\n');

let braceLevel = 0;
let parenLevel = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let char of line) {
        if (char === '{') braceLevel++;
        if (char === '}') braceLevel--;
        if (char === '(') parenLevel++;
        if (char === ')') parenLevel--;
    }
    if (braceLevel < 0 || parenLevel < 0) {
        console.log(`Mismatch at line ${i + 1}: brace=${braceLevel}, paren=${parenLevel}`);
        break;
    }
}
console.log(`Final levels: brace=${braceLevel}, paren=${parenLevel}`);

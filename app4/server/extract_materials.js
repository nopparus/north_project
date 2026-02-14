const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../materials-db.ts');
const fileContent = fs.readFileSync(filePath, 'utf8');

// Regex to capture the array content
// Look for "export const ALL_MATERIALS: Material[] = [" and stop at "];"
const regex = /export const ALL_MATERIALS: Material\[\] = (\[([\s\S]*?)\]);/;
const match = fileContent.match(regex);

if (match && match[1]) {
    // We have the array string like "[ { ... }, ... ]"
    // The content is valid pseudo-JSON but keys aren't quoted? No, keys in TS are often unquoted { id: 1, ... }
    // We need to make it valid JSON. 
    // Simply replacing key: with "key": might work if keys are simple.
    let jsonString = match[1];

    // Replace keys { key: value } -> { "key": value }
    // This is tricky with regex. 
    // Let's try to evaluate it in a VM context if possible. 
    // Or just use eval() since unquoted object literals are valid JS.

    try {
        // Evaluate the string as JS code
        const data = eval(jsonString);
        fs.writeFileSync(path.join(__dirname, 'materials.json'), JSON.stringify(data, null, 2));
        console.log('Successfully extracted materials.json');
    } catch (e) {
        console.error('Eval failed:', e);
        // Fallback: simple regex replacement for common keys
        // keys: id, material_type, material_code, material_name, category, unit, unit_price, cable_unit_price, labor_unit_price, action_type, spec_brand, remark, symbol_group
        // values are numbers or "strings".
    }
} else {
    console.error('Could not find ALL_MATERIALS array');
}

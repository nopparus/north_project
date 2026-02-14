const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../materials-db.ts');
const fileContent = fs.readFileSync(filePath, 'utf8');

// Regex to capture the projects array
const regex = /export const SAMPLE_PROJECTS: SavedProject\[\] = (\[([\s\S]*?)\]);/;
const match = fileContent.match(regex);

if (match && match[1]) {
    // We have the array string like "[ { ... }, ... ]"
    // Unlike materials.json, the project struct has nested objects/arrays and enums (NodeType.EXCHANGE).
    // Eval might fail if NodeType is not defined.

    // We need to mock NodeType
    const NodeType = {
        EXCHANGE: 'EXCHANGE',
        CABINET: 'CABINET',
        STRAIGHT_JOINT: 'STRAIGHT_JOINT',
        BRANCH_JOINT: 'BRANCH_JOINT',
        CUSTOM: 'CUSTOM',
        SWITCH: 'SWITCH',
        MSAN: 'MSAN',
        OFCCC: 'OFCCC',
        G3: 'G3',
        WILINK: 'WILINK',
        AIS: 'AIS',
        TOT_POLE: 'TOT_POLE',
        LPE: 'LPE',
        MANHOLE: 'MANHOLE',
        PE: 'PE',
        DP: 'DP',
        CAB: 'CAB',
        RISER: 'RISER',
        SDP: 'SDP',
        ODP: 'ODP',
        SAM: 'SAM',
        EXCHANGE_COPPER: 'EXCHANGE_COPPER'
    };

    let jsonString = match[1];

    try {
        // Eval with NodeType in scope
        const data = eval(jsonString);
        fs.writeFileSync(path.join(__dirname, 'projects.json'), JSON.stringify(data, null, 2));
        console.log('Successfully extracted projects.json');
    } catch (e) {
        console.error('Eval failed:', e);
    }
} else {
    console.error('Could not find SAMPLE_PROJECTS array');
}

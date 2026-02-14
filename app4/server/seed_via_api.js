const axios = require('axios');
const fs = require('fs');
const path = require('path');

const materials = JSON.parse(fs.readFileSync(path.join(__dirname, 'materials.json'), 'utf8'));

axios.post('http://localhost:3000/api/materials/seed', materials)
    .then(response => {
        console.log('Seeding successful:', response.data);
    })
    .catch(error => {
        console.error('Seeding failed:', error.response ? error.response.data : error.message);
    });

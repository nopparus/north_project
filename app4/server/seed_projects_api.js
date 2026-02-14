const axios = require('axios');
const fs = require('fs');
const path = require('path');

const projects = JSON.parse(fs.readFileSync(path.join(__dirname, 'projects.json'), 'utf8'));

axios.post('http://localhost:3000/api/projects/seed', projects)
    .then(response => {
        console.log('Projects Seeding successful:', response.data);
    })
    .catch(error => {
        console.error('Projects Seeding failed:', error.response ? error.response.data : error.message);
    });

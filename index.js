// Back end setup
//Import from queries.js - db.getContacts functionality
const db = require('./queries.js');
const express = require('express'); 
// Turn on CORS
const cors = require('cors');
const app = express(); 
const port = 3030;

// Turn on CORS
app.use(cors());
// Middleware - Convert data to JSON w/ express body parser - needs to be above routes
app.use(express.json());

// Base URL
app.get('/', (request, response) => { response.json({ info: 'Node.js, Express and Postgres API'}) });

// Get router to app
app.get('/contacts', db.getContacts);

// Add user route
app.post('/contacts', db.addContact);

// Delete contact route
app.delete("/contact/:id", db.deleteContact);

// New GET route
app.get('/contact', db.getContact);

// Update contact route
app.put('/contacts', db.updateContact);

// App listening to port - check
app.listen(port, () => { console.log(`App running on port ${port}.`)});



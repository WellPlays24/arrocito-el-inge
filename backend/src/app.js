
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

app.use(cors()); // <-- IMPORTANTE

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

module.exports = app;

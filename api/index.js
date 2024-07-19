const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('../mongodb/connection');
const app = express();

app.use(bodyParser.json())

connectDB()

app.get('/', (req, res)=> res.send('EXPRESS on VERCEL'));


const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Delivery Issue API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

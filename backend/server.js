const express = require('express');
const dotenv = require('dotenv');
const routes = require('./routes'); 
const sequelize = require('./config/database');


dotenv.config();


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api', routes);


app.get('/', (req, res) => {
  res.send('API is running!');
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

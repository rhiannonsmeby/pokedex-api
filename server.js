/* eslint-disable no-console */
/* eslint-disable no-debugger */
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const POKEDEX = require('./pokedex.json');

const app = express();
const morganSetting = process.env.NODE_ENV === 'production';

app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req,res,next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({error: 'Unauthorized request'});
  }
  //move to the next middleware 
  next();
});

const validTypes = ['Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice', 'Normal', 'Poison', 'Psychic', 'Rock', 'Steel', 'Water'];

function handleGetTypes(req, res) {
  res.json(validTypes);
}

app.get('/types', handleGetTypes);

function handleGetPokemon(req, res) {
  let response = POKEDEX.pokemon;

  //filter our pokemon by name is query param is present
  if (req.query.name) {
    response = response.filter(pokemon =>
    //case insensitive searching
      pokemon.name.toLocaleLowerCase().includes(req.query.name.toLocaleLowerCase())
    );
  }
  if (req.query.type) {
    response = response.filter(pokemon => 
      pokemon.type.includes(req.query.type)
    );
  }
  res.json(response);
}

app.get('/pokemon', handleGetPokemon);

// 4 parameters in middleware, express knows to treat this as error handler
app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
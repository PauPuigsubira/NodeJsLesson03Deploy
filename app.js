const express = require('express')
const movies = require('./assets/movies.json')
const crypto = require('node:crypto')
const cors = require('cors')
const { validateMovie, validateMoviePartially } = require('./schemes/movies')

const PORT = process.env.PORT ?? 1234
const app = express()
// MiddleWare to access directly to request.body
app.use(express.json())

app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))

app.disable('x-powered-by')

app.get('/', (req, res) => {
  res.json({ message: 'Hola Mundo' })
})

app.get('/movies', (req, res) => {
/*
  const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:1234'
  ]
  const origin = req.header('origin')
  // res.header('Access-Control-Allow-Origin', '*')
  if (ACCEPTED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  }
*/
  const { genre } = req.query

  if (genre) {
    const filteredMovies = movies.filter(
      // movie => movie.genre.includes(genre)
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    if (filteredMovies.length > 0) return res.json(filteredMovies)
    return res.status(404).json({ message: `Not films found with this searching criteria genre ${genre}` })
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => { // Path-to-regexp
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)

  if (movie) return res.json(movie)

  res.status(404).json({ message: 'movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    // 400 - Bad Request
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(), // creates a native UUID v4
    ...req.body
  }
  // This won't be REST protocol because we are saving data in memory!!!
  movies.push(newMovie)
  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex < 0) return res.status(404).json({ message: 'Movie not found' })

  const result = validateMoviePartially(req.body)

  if (result.error) return res.status(423).json({ message: JSON.parse(result.error.message) })

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(movies[movieIndex])
})

app.options('/movies/:id', (req, res) => {
/*
  const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:1234'
  ]
  const origin = req.header('origin')
  // res.header('Access-Control-Allow-Origin', '*')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  }
  res.sendStatus(200)
*/
})

app.delete('/movies/:id', (req, res) => { // Path-to-regexp
/*
  const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:1234'
  ]
  const origin = req.header('origin')
  // res.header('Access-Control-Allow-Origin', '*')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    // res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  }
*/
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) return res.status(404).json({ message: 'Movie not found' })

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

app.listen(PORT, () => {
  console.log(`Server is listening at port http://localhost:${PORT}`)
})

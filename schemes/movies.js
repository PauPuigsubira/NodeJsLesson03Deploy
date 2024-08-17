const z = require('zod')

const movieScheme = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required'
  }),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 3),
  director: z.string({
    invalid_type_error: 'director is a string',
    required_error: 'Movie director is required'
  }),
  duration: z.number().int().positive(),
  poster: z.string().url({
    message: 'poster must be a valid URL'
  }),
  genre: z.array(
    z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']),
    {
      required_error: 'Movie genre is required',
      invalid_type_error: 'Movie genre must be an array o enum Genre'
    }
  ),
  rate: z.number().min(0).max(10).default(0)
})

function validateMovie (object) {
  return movieScheme.safeParse(object)
}

function validateMoviePartially (object) {
  return movieScheme.partial().safeParse(object)
}

module.exports = {
  validateMovie,
  validateMoviePartially
}

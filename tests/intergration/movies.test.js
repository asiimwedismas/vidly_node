const request = require('supertest');
const mongoose = require('mongoose');
const {Genre} = require('../../models/genre');
const {Movie} = require('../../models/movie');
const {User} = require('../../models/user');

let server;

const genreRomance = {_id: mongoose.Types.ObjectId(), name: 'Romance'};
const genreWestern = {_id: mongoose.Types.ObjectId(), name: 'Western'};
const genreAction = {_id: mongoose.Types.ObjectId(), name: 'Action'};

const movieTerminator = {
  _id: mongoose.Types.ObjectId(),
  title: 'Terminator',
  genre: genreAction,
  numberInStock: 1,
  dailyRentalRate: 100,
};
const movieNoteBook = {
  _id: mongoose.Types.ObjectId(),
  title: 'NoteBook',
  genre: genreRomance,
  numberInStock: 10,
  dailyRentalRate: 100,
};
const movieDjango = {
  _id: mongoose.Types.ObjectId(),
  title: 'Django',
  genre: genreWestern,
  numberInStock: 100,
  dailyRentalRate: 50,
};

let genres;
(async () => {
  genres = await Genre.collection.insertMany([
    genreAction,
    genreRomance,
    genreWestern,
  ]);
})();

describe('/api/movies', function() {
  beforeEach(() => {
    server = require('../../app');
  });

  afterEach(async () => {
    await Movie.collection.deleteMany({});
  });

  afterAll(async () => {
    await Genre.collection.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all movies', async () => {
      const movies = [
        movieTerminator,
        movieNoteBook,
        movieDjango,
      ];

      await Movie.collection.insertMany(movies);

      const res = await request(server).get('/api/movies');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(movies.length);
      expect(res.body.some(value => value.title === 'Terminator')).toBeTruthy();
      expect(res.body.some(value => value.title === 'NoteBook')).toBeTruthy();
      expect(res.body.some(value => value.title === 'Django')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return 404 when an invalid id is sent', async function() {
      const res = await request(server).get('/api/movies/1');

      expect(res.status).toBe(404);
    });

    it('should return 404 when valid id does not match a movie', async function() {
      const res = await request(server).get(`/api/movies/${mongoose.Types.ObjectId()}`);

      expect(res.status).toBe(404);
    });

    it('should return a movie when a valid movie id is sent', async function() {
      const terminator = await new Movie(movieTerminator).save();

      const res = await request(server).get(`/api/movies/${terminator._id}`);

      expect(res.body).toHaveProperty('_id', movieTerminator._id.toHexString());
      expect(res.body).toHaveProperty('title', movieTerminator.title);
    });
  });

  describe('POST /', () => {
    let movie, token;
    const run = async () => {
      return await request(server).post('/api/movies').set('x-auth-token', token).send(movie);
    };

    beforeEach(() => {
      token = new User({isAdmin: true}).generateAuthToken();
      movie = {
        title: 'Terminator',
        genreId: genreAction._id,
        numberInStock: 1,
        dailyRentalRate: 12,
      };

    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await run();

      expect(res.status).toBe(401);
    });

    it('should return 403 if client is not admin', async () => {
      token = new User({isAdmin: false}).generateAuthToken();

      const res = await run();

      expect(res.status).toBe(403);
    });

    it('should return 400 if title is less than 6 characters', async () => {
      movie.title = 'T';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if title is more than 50 characters', async () => {
      movie.title = 'Tttttsttttttttttttttttttttttttttttttttttttttttttttsssssss';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if numberInStock is not provided', async () => {
      delete movie.numberInStock;

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if dailyRentalRate is not provided', async () => {
      delete movie.dailyRentalRate;

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if provided genreId doesnt match a genre', async () => {
      movie.genreId = mongoose.Types.ObjectId();

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should save the movie if all required fields are provided', async () => {
      await run();

      const savedMovieInDb = await Movie.find({title: 'Terminator'});

      expect(savedMovieInDb[0].title).toBe("Terminator");
    });

    it('should return the saved movie', async () => {
      const res = await run();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', 'Terminator');
    });
  });

  describe('PUT /:id', () => {
    let movie, token, movieID = mongoose.Types.ObjectId();
    const run = async () => {
      return await request(server).put('/api/movies/' + movieID).set('x-auth-token', token).send(movie);
    };

    beforeEach(() => {
      token = new User({isAdmin: true}).generateAuthToken();
      movie = {
        title: 'Terminator',
        genreId: genreAction._id,
        numberInStock: 1,
        dailyRentalRate: 12,
      };
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await run();

      expect(res.status).toBe(401);
    });

    it('should return 403 if client is not admin', async () => {
      token = new User({isAdmin: false}).generateAuthToken();

      const res = await run();

      expect(res.status).toBe(403);
    });

    it('should return 400 if title is less than 6 characters', async () => {
      movie.title = 'T';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if title is more than 50 characters', async () => {
      movie.title = 'Tttttttttttttttttttttttttttttttttttttttttttttttttsssssss';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if numberInStock is not provided', async () => {
      delete movie.numberInStock;

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if dailyRentalRate is not provided', async () => {
      delete movie.dailyRentalRate;

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if provided genreId doesnt match a genre', async () => {
      movie.genreId = mongoose.Types.ObjectId();

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 404 if movie with id does not exist', async () => {
      // movie.genreId = mongoose.Types.ObjectId();

      const res = await run();

      expect(res.status).toBe(404);
    });

    it('should update the movie and return it if all required fields are provided', async () => {

      const actionMovie = await new Movie({
        title: 'Action movie',
        genre: genreAction,
        numberInStock: 1,
        dailyRentalRate: 12,
      }).save();

      movieID = actionMovie._id;
      movie.title = 'Action movie updated';
      movie.genreId = genreRomance._id;

      const res = await run();

      const updatedMovieInDb = await Movie.findById(movieID);

      expect(updatedMovieInDb.title).toBe('Action movie updated');

      expect(res.body).toHaveProperty('_id', movieID.toHexString());
      expect(res.body).toHaveProperty('title', 'Action movie updated');
      expect(res.body.genre._id).toBe(genreRomance._id.toHexString());
      expect(res.body.genre.name).toBe(genreRomance.name);
    });
  });
//
  describe('DELETE /:id', () => {
    let movieID;
    let movie;
    let token;

    const run = async () => {
      return await request(server).delete('/api/movies/' + movieID).set('x-auth-token', token).send();
    };

    beforeEach(async () => {
      token = new User({isAdmin: true}).generateAuthToken();
      movie = await new Movie(movieTerminator).save();
      movieID = movie._id;
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await run();

      expect(res.status).toBe(401);
    });

    it('should return 403 if client is not admin', async () => {
      token = new User({isAdmin: false}).generateAuthToken();

      const res = await run();

      expect(res.status).toBe(403);
    });

    it('should return 404 if id is invalid', async () => {
      movieID = 1;

      const res = await run();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no movie with the given id was found', async () => {
      movieID = mongoose.Types.ObjectId();

      const res = await run();

      expect(res.status).toBe(404);
    });

    it('should delete the movie if id is valid', async () => {
      await run();

      const movieInDB = await Movie.findById(movieID);

      expect(movieInDB).toBeFalsy();
    });

    it('should return the deleted movie', async () => {
      const res = await run();

      expect(res.body).toHaveProperty('_id', movie._id.toHexString());
      expect(res.body).toHaveProperty('title', 'Terminator');
    });
  });
});
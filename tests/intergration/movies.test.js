const request = require('supertest');
const mongoose = require('mongoose');
const {Genre} = require('../../models/genre');
const {Movie} = require('../../models/movie');

let server;

const genreRomance = {name: 'Romance'};
const genreWestern = {name: 'Western'};
const genreAction = {name: 'Action'};

const movieTerminator = {
  title: 'Terminator',
  genre: genreAction,
  numberInStock: 1,
  dailyRentalRate: 100,
};
const movieNoteBook = {
  title: 'NoteBook',
  genre: genreRomance,
  numberInStock: 10,
  dailyRentalRate: 500,
};
const movieDjango = {
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
    let movie;
    const run = async () => {
      return await request(server).post('/api/movies').send(movie);
    };

    beforeEach(() => {
      movie = {
        title: 'Terminator',
        genreId: genreAction._id,
        numberInStock:1,
        dailyRentalRate: 12
      };

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

    it('should save the movie if all required fields are provided', async () => {
      await run();

      const genre = await Movie.find({ title: 'Terminator' });

      expect(genre).not.toBeNull();
    });

    it('should return the saved movie', async () => {
      const res = await run();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', 'Terminator');
    });
  });

  describe('PUT /:id', () => {
    let movie;
    const run = async () => {
      return await request(server).post('/api/movies').send(movie);
    };

    beforeEach(() => {
      movie = {
        title: 'Terminator',
        genreId: genreAction._id,
        numberInStock:1,
        dailyRentalRate: 12
      };

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

    it('should update the movie if all required fields are provided', async () => {
      movie.title = 'TerminatorUpdated';
      movie.genreId = genreRomance._id;

      await run();

      const genre = await Movie.find({ title: 'TerminatorUpdated' });

      expect(genre).not.toBeNull();
    });

    it('should return the updated movie', async () => {
      movie.title = 'TerminatorUpdated';
      movie.genreId = genreRomance._id;
      const res = await run();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', 'TerminatorUpdated');
      expect(res.body.genre._id).toBe(genreRomance._id.toHexString());
      expect(res.body.genre.name).toBe(genreRomance.name);
    });
  });

  describe('DELETE /:id', () => {
    let movieID;
    let movie;

    const exec = async () => {
      return await request(server).delete('/api/movies/' + movieID).send();
    };

    beforeEach(async () => {
      movie = await new Movie(movieTerminator).save();
      movieID = movie._id;
    });

    it('should return 404 if id is invalid', async () => {
      movieID = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no movie with the given id was found', async () => {
      movieID = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should delete the movie if id is valid', async () => {
      await exec();

      const movieInDB = await Movie.findById(movieID);

      expect(movieInDB).toBeFalsy();
    });

    it('should return the deleted movie', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id', movie._id.toHexString());
      expect(res.body).toHaveProperty('title', "Terminator");
    });
  });
});
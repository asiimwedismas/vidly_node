const request = require('supertest');
const {Genre} = require('../../models/genre');
const mongoose = require('mongoose');
const {User} = require('../../models/user');

let server;

describe('/api/genres', () => {
  beforeEach(() => {
    server = require('../../app');
  });

  afterEach(async () => {
    await Genre.collection.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all genres', async () => {
      const genres = [
        {name: 'Romance'},
        {name: 'Western'},
      ];

      await Genre.collection.insertMany(genres);

      const res = await request(server).get('/api/genres');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(genres.length);
      expect(res.body.some(value => value.name === "Romance")).toBeTruthy();
      expect(res.body.some(value => value.name === "Western")).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return 404 when invalid id is passed', async () => {
      const res = await request(server).get('/api/genres/1');

      expect(res.status).toBe(404);
    });

    it('should return 404 when no genre with the given id exists', async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get('/api/genres/' + id);

      expect(res.status).toBe(404);
    });

    it('should return a genre if valid id is passed', async () => {
      const genre = new Genre({ name: 'Romance' });
      await genre.save();

      const res = await request(server).get('/api/genres/' + genre._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', genre.name);
    });
  });

  describe('POST /', () => {

    let genreName, token;
    const run = async () => {
      return await request(server)
      .post('/api/genres')
      .set('x-auth-token', token)
      .send({ name: genreName });
    }

    beforeEach(() => {
      genreName = 'Romance';
      token = new User().generateAuthToken();
    })

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await run();

      expect(res.status).toBe(401);
    });

    it('should return 400 if genre is less than 6 characters', async () => {
      genreName = 'name';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if genre is more than 16 characters', async () => {
      genreName = new Array(52).join('a');

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should save the genre if it is valid', async () => {
      await run();

      const genre = await Genre.find({ name: 'Romance' });

      expect(genre).not.toBeNull();
    });

    it('should return the genre if it is valid', async () => {
      const res = await run();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'Romance');
    });
  });

  describe('PUT /:id', () => {
    let newGenreName;
    let genre;
    let id;
    let token;

    const exec = async () => {
      return await request(server)
      .put('/api/genres/' + id)
      .set('x-auth-token', token)
      .send({ name: newGenreName });
    }

    beforeEach(async () => {
      genre = new Genre({ name: 'genre1' });
      await genre.save();

      id = genre._id;
      newGenreName = 'updatedGenreName';
      token = new User().generateAuthToken();
    })

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if genre is less than 5 characters', async () => {
      newGenreName = '1234';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if genre is more than 50 characters', async () => {
      newGenreName = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 404 if id is invalid', async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if genre with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should update the genre if input is valid', async () => {
      await exec();

      const updatedGenre = await Genre.findById(genre._id);

      expect(updatedGenre.name).toBe(newGenreName);
    });

    it('should return the updated genre if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', newGenreName);
    });
  });

  describe('DELETE /:id', () => {
    let genre;
    let id;
    let token;

    const exec = async () => {
      return await request(server)
      .delete('/api/genres/' + id)
      .set('x-auth-token', token)
      .send();
    }

    beforeEach(async () => {
      genre = new Genre({ name: 'genre1' });
      await genre.save();

      id = genre._id;
      token = new User({ isAdmin: true }).generateAuthToken();
    })

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 403 if the user is not an admin', async () => {
      token = new User({ isAdmin: false }).generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it('should return 404 if id is invalid', async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no genre with the given id was found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should delete the genre if input is valid', async () => {
      await exec();

      const genreInDb = await Genre.findById(id);

      expect(genreInDb).toBeNull();
    });

    it('should return the removed genre', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id', genre._id.toHexString());
      expect(res.body).toHaveProperty('name', genre.name);
    });
  });
});
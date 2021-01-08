const request = require('supertest');
const mongoose = require('mongoose');
const {Genre} = require('../../models/genre');
const {Movie} = require('../../models/movie');
const {Customer} = require('../../models/customer');
const {Rental} = require('../../models/rental');
const {User} = require('../../models/user');

let server;

const genreRomance = {_id: mongoose.Types.ObjectId(), name: 'Romance'};
const genreWestern = {_id: mongoose.Types.ObjectId(), name: 'Western'};
const genreAction = {_id: mongoose.Types.ObjectId(), name: 'Action'};

const movieTerminator = {
  _id: mongoose.Types.ObjectId(),
  title: 'Terminator',
  genre: genreAction,
  numberInStock: 12,
  dailyRentalRate: 100,
};

const outOfStockMovie = {
  _id: mongoose.Types.ObjectId(),
  title: 'Out of stock movie',
  genre: genreWestern,
  numberInStock: 0,
  dailyRentalRate: 50,
};

const customerDismas = {_id: mongoose.Types.ObjectId(), name: 'dismas3', phone: '01234564'};
const customerAsiimwe = {_id: mongoose.Types.ObjectId(), name: 'asiimwe3', phone: '06543214'};

let genres, movies, customers;

async function populateDb() {
  genres = await Genre.collection.insertMany([
    genreAction,
    genreRomance,
  ]);

  movies = await Movie.collection.insertMany([
    movieTerminator,
    outOfStockMovie,
  ]);

  customers = await Customer.collection.insertMany([
    customerAsiimwe,
    customerDismas,
  ]);
};

async function clearDb() {
  await Rental.collection.deleteMany({});
  await Customer.collection.deleteMany({});
  await Movie.collection.deleteMany({});
  await Genre.collection.deleteMany({});
}

describe('/api/movies', function() {
  beforeEach(async () => {
    server = require('../../app');
  });

  describe('GET /', () => {
    it('should return all rentals', async () => {

      const rental1 = {
        customer: {
          _id: customerAsiimwe._id,
          name: customerAsiimwe.name,
          phone: customerAsiimwe.phone,
        },
        movie: {
          _id: movieTerminator._id,
          title: movieTerminator.title,
          dailyRentalRate: movieTerminator.dailyRentalRate,
        },
      };
      const rental2 = {
        customer: {
          _id: customerDismas._id,
          name: customerDismas.name,
          phone: customerDismas.phone,
        },
        movie: {
          _id: movieTerminator._id,
          title: movieTerminator.title,
          dailyRentalRate: movieTerminator.dailyRentalRate,
        },
      };

      const rentals = [
        rental1,
        rental2,
      ];

      await Rental.collection.insertMany(rentals);

      const res = await request(server).get('/api/rentals');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(rentals.length);
      expect(res.body.some(value => value._id === rental1._id.toHexString())).toBeTruthy();
      expect(res.body.some(value => value._id === rental2._id.toHexString())).toBeTruthy();
    });
  });

  describe('GET /:id', function() {
    it('should return 404 if given rental id is not a valid mongoDb id', async function() {
      const res = await request(server).get('/api/rentals/1');

      expect(res.status).toBe(404);
    });

    it('should return 404 if no rental of given id exists', async function() {
      const validID = mongoose.Types.ObjectId();
      const res = await request(server).get(`/api/rentals/${validID}`);

      expect(res.status).toBe(404);
    });

    it('should return a rental for the given id', async function() {
      const newRental = await new Rental({customer: customerAsiimwe, movie: movieTerminator}).save();

      const res = await request(server).get(`/api/rentals/${newRental._id}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(newRental._id.toHexString());
    });
  });

  describe('POST /', function() {
    let movieId;
    let customerId;
    let token;

    const run = async () => {
      return await request(server).post('/api/rentals/').set('x-auth-token', token).send({customerId, movieId});
    };

    beforeEach(async () => {
      await populateDb();
      movieId = movieTerminator._id;
      customerId = customerAsiimwe._id;
      token = new User({isAdmin: true}).generateAuthToken();
    });

    afterEach(async () => {
      await clearDb();
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await run();

      expect(res.status).toBe(401);
    });

    it('should return 400 if customer is invalid', async function() {
      customerId = 1;
      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if movie is invalid', async function() {
      movieId = 1;
      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if Movie not in stock', async function() {
      movieId = outOfStockMovie._id;
      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should decrement rented movie', async function() {
      const beforeRentCount = movieTerminator.numberInStock;

      const res = await run();

      const terminatorInDb = await Movie.findById(movieTerminator._id);

      expect(terminatorInDb.numberInStock).toBe(beforeRentCount - 1);
    });

    it('should return a the created rental', async function() {
      const res = await run();

      expect(res.status).toBe(200);
      expect(res.body.customer._id).toBe(customerAsiimwe._id.toHexString());
      expect(res.body.movie._id).toBe(movieTerminator._id.toHexString());
    });

  });

});
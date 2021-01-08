const request = require('supertest');
const {Customer} = require('../../models/customer');
const {User} = require('../../models/user');
const mongoose = require('mongoose');

let server;

describe('/api/customers', function() {
  beforeEach(() => {
    server = require('../../app');
  });

  afterEach(async () => {
    await Customer.collection.deleteMany({});
  });

  describe('GET /', function() {
    it('should return all customers', async function() {
      const customers = [
        {name: 'asiimwe', phone: '077777777'},
        {name: 'dismas', phone: '0888888'},
        {name: 'ainebyona', phone: '09999999'},
      ];

      await Customer.collection.insertMany(customers);

      const res = await request(server).get(`/api/customers`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(customers.length);
      expect(res.body.some(customer => customer.name === 'asiimwe' && customer.phone === '077777777')).toBeTruthy();
      expect(res.body.some(customer => customer.name === 'dismas' && customer.phone === '0888888')).toBeTruthy();
      expect(res.body.some(customer => customer.name === 'ainebyona' && customer.phone === '09999999')).toBeTruthy();
    });
  });

  describe('GET /:id', function() {
    it('should return 404 when invalid id is passed', async function() {
      const res = await request(server).get(`/api/customers/1`);

      expect(res.status).toBe(404);
    });

    it('should return 404 when no customer with given id exists', async function() {
      const validID = mongoose.Types.ObjectId();
      const res = await request(server).get(`/api/customers/${validID}`);

      expect(res.status).toBe(404);
    });

    it('should return a customer when a valid id is given', async function() {
      const customer = new Customer({name: 'dismas', isGold: true, phone: '123456'});
      await customer.save();

      const res = await request(server).get(`/api/customers/${customer._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('phone', '123456');
      expect(res.body).toHaveProperty('name', 'dismas');
      expect(res.body).toHaveProperty('isGold', true);
    });

  });

  describe('POST /', function() {

    let customer = {};
    beforeEach(() => {
      customer = {
        name: 'dismas',
        phone: '12345678',
      };
    });

    const run = async () => {
      return await request(server).post('/api/customers').send(customer);
    };

    it('should return 400 if name is less than 6 characters', async () => {
      customer.name = 'a';
      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if name is more than 16 characters', async () => {
      customer.name = 'ajjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj';
      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if phone is less than 6 characters', async () => {
      customer.phone = '1';
      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if phone is more than 16 characters', async () => {
      customer.phone = '11111111111111111111111111111111';
      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should save the customer if it is valid', async () => {
      await run();

      const customer = await Customer.find({name: 'dismas', phone: '12345678'});
      expect(customer[0]).toBeTruthy();
    });

    it('should return the saved customer', async () => {
      const res = await run();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'dismas');
      expect(res.body).toHaveProperty('phone', '12345678');
    });
  });

  describe('PUT /:id', function() {

    let customerParamsID;
    let testCustomer;
    let token;

    beforeEach(() => {
      token = new User().generateAuthToken();
      customerParamsID = mongoose.Types.ObjectId();
      testCustomer = {
        name: 'dismas7',
        phone: '12345678',
      };
    });

    const run = async () => {
      return await request(server).
          put(`/api/customers/${customerParamsID}`).
          set('x-auth-token', token).
          send(testCustomer);
    };

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await run();

      expect(res.status).toBe(401);
    });

    it('should return 400 if name is less than 6 characters', async () => {
      testCustomer.name = 'a2';
      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if name is more than 16 characters', async () => {
      testCustomer.name = 'ajjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj';
      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if phone is less than 6 characters', async () => {
      testCustomer.phone = '1';
      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if phone is more than 16 characters', async () => {
      testCustomer.phone = '11111111111111111111111111111111';
      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 404 when invalid customer id is passed', async () => {
      customerParamsID = 1;
      const res = await run();

      expect(res.status).toBe(404);
    });

    it('should return 404 customer if doesnt exist', async () => {
      const res = await run();

      expect(res.status).toBe(404);
    });

    it('should update and return the customer if customer ID and update info are valid', async () => {

      let customerSaved = new Customer(testCustomer);
      customerSaved = await customerSaved.save();

      customerParamsID = customerSaved._id;
      testCustomer.name = 'name_updated';
      testCustomer.phone = 'phone_updated';
      testCustomer.isGold = true;

      const res = await run();

      const customerUpdated = await Customer.find({name: 'name_updated', phone: 'phone_updated', isGold: true});

      expect(customerUpdated[0]).toBeTruthy();
      expect(res.body).toHaveProperty('name', 'name_updated');
      expect(res.body).toHaveProperty('phone', 'phone_updated');
      expect(res.body).toHaveProperty('isGold', true);
    });
  });

  describe('DELETE /:id', function() {
    let customerID;
    let customer;
    let token;

    const run = async () => {
      return await request(server).delete('/api/customers/' + customerID).set('x-auth-token', token).send();
    };

    beforeEach(async () => {
      token = new User().generateAuthToken();
      customer = await new Customer({name: 'dismas', phone: '123456'}).save();
      customerID = customer._id;
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await run();

      expect(res.status).toBe(401);
    });

    it('should return 404 if id is invalid', async () => {
      customerID = 1;

      const res = await run();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no customer with the given id was found', async () => {
      customerID = mongoose.Types.ObjectId();

      const res = await run();

      expect(res.status).toBe(404);
    });

    it('should delete the customer if id is valid', async () => {
      await run();

      const customerInDB = await Customer.findById(customerID);

      expect(customerInDB).toBeNull();
    });

    it('should return the removed customer', async () => {
      const res = await run();

      expect(res.body).toHaveProperty('_id', customerID._id.toHexString());
      expect(res.body).toHaveProperty('name', 'dismas');
      expect(res.body).toHaveProperty('phone', '123456');
    });
  });

});
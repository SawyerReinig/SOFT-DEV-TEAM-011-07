// Imports the index.js file to be tested.
const server = require('../index'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

describe('Server!', () => {
    // Sample test case given to test / endpoint.
    it('Returns the default home page message', done => {
        chai
            .request(server)
            .get('/login')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.status).to.equals('success');
                assert.strictEqual(res.body.message, 'Welcome!');
                done();
            });
    });

    // ===========================================================================
    // TO-DO: Part A Login unit test case

    //We are checking POST /login API by passing the user info in the correct order. This test case should pass and return a status 200 along with a "Success" message.
    //Positive cases -->
    it('positive : /login', done => {
        chai
            .request(server)
            .post('/login')
            .send({ username: 'JohnDoe', password: 'johnstinkfart' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.message).to.equals('Success');
                done();
            });
    });
    //We are checking POST /login API by passing the user info in in incorrect manner (name cannot be an integer). This test case should pass and return a status 200 along with a "Invalid input" message.
    it('Negative : /login. Checking invalid name', done => {
        chai
            .request(server)
            .post('/login')
            .send({ username: 'null', password: '' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.message).to.equals('Invalid input');
                done();
            });
    });
    // now testing the /register API!!
    it('Returns the register page message', done => {
        chai
            .request(server)
            .get('/register')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.status).to.equals('success');
                assert.strictEqual(res.body.message, 'Register, or click the button to redirect to login!');
                done();
            });
    });
    it('Positive : /register. Checking valid register of account.', done => {
        chai
            .request(server)
            .post('/register')
            .send({ username: 'name1', password: 'pass1' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.message).to.equals('Registered successfully');
                done();
            });
    });
    it('Negative : /register. Checking invalid register', done => {
        chai
            .request(server)
            .post('/register')
            .send({ username: 'null', password: '' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.message).to.equals('Invalid input');
                done();
            });
    });
    // must make one for negative and one more positive

    //discover testing
    it('Returns the discover page message', done => {
        chai
            .request(server)
            .get('/discover')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.status).to.equals('success');
                assert.strictEqual(res.body.message, 'Find others to ride with!');
                done();
            });
    });
});
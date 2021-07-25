const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
let id;
suite('Functional Tests', function() {
  
  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({ title: 'Starship Troopers' })
        .end(function(err, res){
          id = res.body._id;
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'response should be an object');
          assert.equal(res.body.title, 'Starship Troopers');
          assert.property(res.body, '_id', 'response should contain an id');
          done();
        })
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({})
        .end(function(err, res){ 
          assert.equal(res.status, 200);
          assert.isString(res.text);
          assert.equal(res.text, 'missing required field title');
          done();
        });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
        .get('/api/books')
        .end(function(err, res){ 
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response is an array');
          assert.isObject(res.body[0], 'book is an object');
          assert.property(res.body[0], 'comments', 'comments field exists');
          assert.property(res.body[0], 'title', 'title field exists');
          assert.property(res.body[0], '_id', '_id field exists');
          assert.property(res.body[0], 'commentcount', 'commentcount field exists');
          done();
        })
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        //const badId = '5fd9efa40673d006a4863987';
        const badId = 'idthatdoesntexist';
        chai.request(server)
        .get('/api/books/' + badId)
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isString(res.text);
          assert.equal(res.text, 'no book exists');
          done();
        });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
        .get('/api/books/' + id)
        .end(function(err, res){ 
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, '_id');
          assert.property(res.body, 'comments');
          assert.property(res.body, 'commentcount');
          assert.property(res.body, 'title');
          assert.equal(res.body._id, id);
          assert.equal(res.body.title, 'Starship Troopers');
          done();
        });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
        .post('/api/books/' + id)
        .send({ comment: 'SciFi Classic' })
        .end(function(err, res){ 
          assert.equal(res.status, 200);
          assert.deepEqual(res.body.comments, ['SciFi Classic']);
          done();
        });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server)
        .post('/api/books/' + id)
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isString(res.text);
          assert.equal(res.text, 'missing required field comment');
          done();
        });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        const badId = '5fd9efa40673d006a4863987';
        chai.request(server)
        .post('/api/books/' + badId)
        .send({ comment: 'id does not exist' })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isString(res.text);
          assert.equal(res.text, 'no book exists');
          done();
        });
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai.request(server)
        .delete('/api/books/' + id)
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {});
          assert.isString(res.text);
          assert.equal(res.text, 'delete successful');
          done();
        });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        const badId = '5fd9efa40673d006a4863987';
        chai.request(server)
        .delete('/api/books/' + badId)
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isString(res.text);
          assert.equal(res.text, 'no book exists');
          done();
        });
      });

    });

  });

});

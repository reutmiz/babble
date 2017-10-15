'use strict';

let assert = require('assert');
let messages = require('../../server/messages-util');
let serverModule = require('../../server/main.js');
let chaiHttp = require('chai-http');
let chai = require('chai')
let expect = chai.expect;
let should = chai.should();

chai.use(chaiHttp);

describe('Message', function() {
  it('should load the messages module', function() {
    assert.notEqual(null, messages);
  });
  it('should be able to add a new message and return id', function() {
    let message = {message: '1'};
    let id = messages.addMessage(message);
    assert.notEqual(null, id);
  });
  it('should return new messages', function() {
    let all = messages.getMessages(0);
    let newMessage = {message: '2'};
    messages.addMessage(newMessage);
    let newMessages = messages.getMessages(all.length);
    assert.deepEqual(newMessages, [newMessage]);
  });
  it('should be able to delete a message', function() {
    let message = {message: '3'};
    let id = messages.addMessage(message);
    messages.deleteMessage(id);
    assert.equal(null, messages.getMessages(0).find(m => m.id === id));
  });
});

describe('My Server tests', function() {
  it('Should return error 404', function (done) {
    chai.request(serverModule.server)
      .get('/hello')
      .end(function (err, res) {
        expect(res).to.have.status(404);
        done();
      });
  });
  it('Should return error 400', function (done) {
    chai.request(serverModule.server)
      .get('/messages?counter=reut')
      .end(function (err, res) {
        expect(res).to.have.status(400);
        done();
      });
  });
  it('Should return error 405', function (done) {
    chai.request(serverModule.server)
      .post('/stats')
      .end(function (err, res) {
        expect(res).to.have.status(405);
        done();
      });
  });
  it('Should return error 204', function (done) {
    chai.request(serverModule.server)
      .options('/hello')
      .end(function (err, res) {
        expect(res).to.have.status(204);
        done();
      });
  });

  it('Should insert new user', function (done) {
    chai.request(serverModule.server)
      .get('/login')
      .send()
      .end(function (err, res) {
        expect(res).to.have.status(200);
        res.body.should.eql(true);
        done();
      });
  });
  it('Should remove user', function (done) {
    let bef = serverModule.numOfUsers;
    chai.request(serverModule.server)
      .get('/disconnect')
      .send()
      .end(function (err, res) {
        expect(res).to.have.status(200);
        res.body.should.eql(true);
        done();
      });
  });

});
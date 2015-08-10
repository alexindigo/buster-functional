var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  ;

buster.testCase('wait',
{
  // create new test object for each test
  setUp: common.setUp,

  tearDown: function()
  {
    // clean up _eventRoot
    delete this.testObject._eventRoot;
  },

  'Recursively calls itself after cooldown period': function()
  {
    var eventName   = 'Me event' + Math.random()
      , callback    = this.spy()
      , boundItself = {me: Math.random()}
      ;

    // set window object for the test
    this.testObject.window = {};

    // don't invoke setTimeout, just check it gets all we need
    this.stub(global, 'setTimeout');
    // no need to invoke real bind either
    this.stub(this.testObject.wait, 'bind').returns(boundItself);

    // invoke test subject
    this.testObject.wait(eventName, callback);

    // passes itself with bound arguments to setTimeout
    assert.calledWith(global.setTimeout, boundItself, this.testObject._cooldownPeriod);

    // Binds all the arguments to itself
    assert.calledWith(this.testObject.wait.bind, this.testObject, eventName, callback);
  },

  'When eventRoot exists passes callback as delayed callback': function()
  {
    var eventName = 'Me event' + Math.random()
      , callback  = this.spy()
      , boundItself = {me: Math.random()}
      ;

    // set window object for the test
    this.testObject._eventRoot = {one: this.spy()};

    // don't invoke setTimeout, just check it gets all we need
    this.stub(global, 'setTimeout');

    this.stub(this.testObject, '_delayedCallback');
    this.stub(this.testObject._delayedCallback, 'bind').returns(boundItself);

    // invoke test subject
    this.testObject.wait(eventName, callback);

    // waiting for the eventName
    assert.calledWith(this.testObject._eventRoot.one, eventName, boundItself);

    // passed callback to _delayedCallback
    assert.calledWith(this.testObject._delayedCallback.bind, this.testObject, callback);

    // shouldn't come to setTimeout
    refute.called(global.setTimeout);
  },

  'Works with once method': function()
  {
    var eventName = 'Me event' + Math.random()
      , callback  = this.spy()
      , boundItself = {me: Math.random()}
      ;

    // set window object for the test
    this.testObject._eventRoot = {once: this.spy()};

    this.stub(this.testObject, '_delayedCallback');
    this.stub(this.testObject._delayedCallback, 'bind').returns(boundItself);

    // invoke test subject
    this.testObject.wait(eventName, callback);

    // waiting for the eventName
    assert.calledWith(this.testObject._eventRoot.once, eventName, boundItself);
  }
});

var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  ;

buster.testCase('waitForVar',
{
  // create new test object for each test
  setUp: common.setUp,

  tearDown: function()
  {
    // clean up window object
    delete this.testObject.window;
  },

  'Recursively calls itself after cooldown period': function()
  {
    var variable    = 'Me variable' + Math.random()
      , callback    = this.spy()
      , boundItself = {me: Math.random()}
      ;

    // set window object for the test
    this.testObject.window = {};

    // don't invoke setTimeout, just check it gets all we need
    this.stub(global, 'setTimeout');
    // no need to invoke real bind either
    this.stub(this.testObject.waitForVar, 'bind').returns(boundItself);

    // invoke test subject
    this.testObject.waitForVar(variable, callback);

    // passes itself with bound arguments to setTimeout
    assert.calledWith(global.setTimeout, boundItself, this.testObject._cooldownPeriod);

    // Binds all the arguments to itself
    assert.calledWith(this.testObject.waitForVar.bind, this.testObject, variable, callback);
  },

  'When element is found passes callback as delayed callback': function()
  {
    var variable = 'Me variable' + Math.random()
      , callback = this.spy()
      ;

    // set window object for the test
    this.testObject.window = {};
    // should pass the check no matter of the value
    this.testObject.window[variable] = null;

    // don't invoke setTimeout, just check it gets all we need
    this.stub(global, 'setTimeout');

    this.stub(this.testObject, '_delayedCallback');

    // invoke test subject
    this.testObject.waitForVar(variable, callback);

    // shouldn't come to setTimeout
    refute.called(global.setTimeout);

    // passed callback to _delayedCallback
    assert.calledWith(this.testObject._delayedCallback, callback);
  }
});

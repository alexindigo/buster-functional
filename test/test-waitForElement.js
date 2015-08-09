var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  ;

buster.testCase('waitForElement',
{
  // create new test object for each test
  setUp: common.setUp,

  'Recursively calls itself after cooldown period': function()
  {
    var selector    = 'Me selector' + Math.random()
      , callback    = this.spy()
      , target      = {length: 0}
      , boundItself = {me: Math.random()}
      ;

    // don't invoke setTimeout, just check it gets all we need
    this.stub(global, 'setTimeout');
    // no need to invoke real bind either
    this.stub(this.testObject.waitForElement, 'bind').returns(boundItself);

    // pretend to be jQuery
    this.testObject.$.withArgs(selector).returns(target);

    // invoke test subject
    this.testObject.waitForElement(selector, callback);

    // passes itself with bound arguments to setTimeout
    assert.calledWith(global.setTimeout, boundItself, this.testObject._cooldownPeriod);

    // Binds all the arguments to itself
    assert.calledWith(this.testObject.waitForElement.bind, this.testObject, selector, callback);
  },

  'When element is found passes callback as delayed callback': function()
  {
    var selector = 'Me selector' + Math.random()
      , target   = {length: 1}
      , callback = this.spy()
      ;

    // don't invoke setTimeout, just check it gets all we need
    this.stub(global, 'setTimeout');

    this.stub(this.testObject, '_delayedCallback');

    // pretend to be jQuery
    this.testObject.$.withArgs(selector).returns(target);

    // invoke test subject
    this.testObject.waitForElement(selector, callback);

    // shouldn't come to setTimeout
    refute.called(global.setTimeout);

    // passed callback to _delayedCallback
    assert.calledWith(this.testObject._delayedCallback, callback);
  }
});

var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('waitForElementToContain',
{
  // create new test object for each test
  setUp: common.setUp,

  'Recursively calls itself after cooldown period': function()
  {
    var selector    = 'Me selector' + Math.random()
      , callback    = this.spy()
      , target      = {is: function() { return true; }, length: 0}
      , boundItself = {me: Math.random()}
      ;

    // don't invoke setTimeout, just check it gets all we need
    this.stub(global, 'setTimeout');
    // no need to invoke real bind either
    this.stub(this.testObject.waitForElementToContain, 'bind').returns(boundItself);

    // pretend to be jQuery
    this.testObject.$.withArgs(selector).returns(target);

    // invoke test subject
    this.testObject.waitForElementToContain(selector, callback);

    // passes itself with bound arguments to setTimeout
    assert.calledWith(global.setTimeout, boundItself, this.testObject._cooldownPeriod);

    // Binds all the arguments to itself
    assert.calledWith(this.testObject.waitForElementToContain.bind, this.testObject, target, callback);
  },


  'When element is present but empty, do recursive calls itself': function()
  {
    var selector = 'Me selector' + Math.random()
      , target   = {is: function() { return false; }, length: 0}
      , callback = this.spy()
      , boundItself = {me: Math.random()}
      ;

    // don't invoke setTimeout, just check it gets all we need
    this.stub(global, 'setTimeout');
    // no need to invoke real bind either
    this.stub(this.testObject.waitForElementToContain, 'bind').returns(boundItself);

    // pretend to be jQuery
    this.testObject.$.withArgs(selector).returns(target);

    // invoke test subject
    this.testObject.waitForElementToContain(selector, callback);

    // passes itself with bound arguments to setTimeout
    assert.calledWith(global.setTimeout, boundItself, this.testObject._cooldownPeriod);

    // Binds all the arguments to itself
    assert.calledWith(this.testObject.waitForElementToContain.bind, this.testObject, target, callback);
  },

  'When element is present & not empty passes callback as delayed callback': function()
  {
    var selector = 'Me selector' + Math.random()
      , target   = {is: function() { return false; }, length: 1}
      , callback = this.spy()
      ;

    // don't invoke setTimeout, just check it gets all we need
    this.stub(global, 'setTimeout');

    this.stub(this.testObject, '_delayedCallback');

    // pretend to be jQuery
    this.testObject.$.withArgs(selector).returns(target);

    // invoke test subject
    this.testObject.waitForElementToContain(selector, callback);

    // shouldn't come to setTimeout
    refute.called(global.setTimeout);

    // passed callback to _delayedCallback
    assert.calledWith(this.testObject._delayedCallback, callback);
  },

  'Be able to pass a target as selector': function()
  {
    var callback    = this.spy()
      , target      = {is: function() { return true; }, length: 0}
      , boundItself = {me: Math.random()}
      ;

    // don't invoke setTimeout, just check it gets all we need
    this.stub(global, 'setTimeout');
    
    // no need to invoke real bind either
    this.stub(this.testObject.waitForElementToContain, 'bind').returns(boundItself);

    // invoke test subject
    this.testObject.waitForElementToContain(target, callback);

    // passes itself with bound arguments to setTimeout
    assert.calledWith(global.setTimeout, boundItself, this.testObject._cooldownPeriod);

    // Binds all the arguments to itself
    assert.calledWith(this.testObject.waitForElementToContain.bind, this.testObject, target, callback);
  }


});

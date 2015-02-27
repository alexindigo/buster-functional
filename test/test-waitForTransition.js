var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('waitForTransition',
{
  // create new test object for each test
  setUp: common.setUp,

  'Attaches one time event listener on the target element': function()
  {
    var target = {one: this.spy(), on: this.spy()}
      , callback = this.spy()
      ;

    this.testObject.waitForTransition(target, callback);

    // listens once
    assert.calledWith(target.one, this.testObject._transitionEndEvents);
    refute.called(target.on);
  },

  'Passes callback as delayed callback': function()
  {
    var target = {one: this.spy()}
      , callback = this.spy()
      ;

    this.stub(this.testObject._delayedCallback, 'bind');

    // invoke test subject
    this.testObject.waitForTransition(target, callback);

    // bound callback as first argument to the _delayedCallback
    assert.calledWith(this.testObject._delayedCallback.bind, this.testObject, callback);
  },

  'Works with selectors beside jQuery object': function()
  {
    var selector = 'Me selector' + Math.random()
      , target = {one: this.spy()}
      , callback = this.spy()
      ;

    // pretend to be jQuery
    this.testObject.$.withArgs(selector).returns(target);

    // invoke test subject
    this.testObject.waitForTransition(selector, callback);

    // used selector to determine target
    assert.calledWith(this.testObject.$, selector);
    // used returned target for event listnening
    assert.called(target.one);
  }
});

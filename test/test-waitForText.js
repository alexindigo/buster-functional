var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('waitForText',
{
  // create new test object for each test
  setUp: common.setUp,

  'Recursively calls itself after cooldown period': function()
  {
    var target      = {text: this.spy()}
      , text        = 'sample text'
      , callback    = this.spy()
      , boundItself = {me: Math.random()}
      ;

    // don't invoke setTimeout, just check it gets all we need
    this.stub(global, 'setTimeout');
    // no need to invoke real bind either
    this.stub(this.testObject.waitForText, 'bind').returns(boundItself);

    // invoke test subject
    this.testObject.waitForText(target, text, callback);

    // checks if text exists for the target element
    assert.called(target.text);

    // passes itself with bound arguments to setTimeout
    assert.calledWith(global.setTimeout, boundItself, this.testObject._cooldownPeriod);

    // Binds all the arguments to itself
    assert.calledWith(this.testObject.waitForText.bind, this.testObject, target, text, callback);
  },

  'When text is found passes callback as delayed callback': function()
  {
    var text        = 'sample text'
      , target      = {text: this.stub().returns(text)}
      , callback    = this.spy()
      ;

    // don't invoke setTimeout, just check it gets all we need
    this.stub(global, 'setTimeout');

    this.stub(this.testObject, '_delayedCallback');

    // invoke test subject
    this.testObject.waitForText(target, text, callback);

    // shouldn't come to setTimeout
    refute.called(global.setTimeout);

    // passed callback to _delayedCallback
    assert.calledWith(this.testObject._delayedCallback, callback);
  },

  'Works with selectors beside jQuery object': function()
  {
    var selector = 'Me selector' + Math.random()
      , target   = {text: this.spy(), me: Math.random()}
      , text     = 'sample text'
      , callback = this.spy()
      , boundItself = {me: Math.random()}
      ;

    // don't invoke setTimeout, just check it gets all we need
    this.stub(global, 'setTimeout');
    // no need to invoke real bind either
    this.stub(this.testObject.waitForText, 'bind').returns(boundItself);

    // pretend to be jQuery
    this.testObject.$.withArgs(selector).returns(target);

    // invoke test subject
    this.testObject.waitForText(selector, text, callback);

    // used selector to determine target
    assert.calledWith(this.testObject.$, selector);

    // uses resolved target to get text of the element
    assert.called(target.text);

    // if selector is passed, reuses selector in future calls
    assert.calledWith(this.testObject.waitForText.bind, this.testObject, selector, text, callback);
  }
});

var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('_delayedCallback',
{
  // create new test object for each test
  setUp: common.setUp,

  'Not fails if no callback passed': function()
  {
    var result = this.testObject._delayedCallback();

    assert.equals(this.testObject, result);
  },

  'Calls callback after specified delay': function(done)
  {
    var isPreCheckCalled = false
      , delay = 100
      , callback = this.spy()
      ;

    this.testObject._delayedCallback(callback, delay);

    // check it won't be called before delay is expired
    setTimeout(function()
    {
      isPreCheckCalled = true;
      refute.called(callback);
    }, delay-10);

    setTimeout(function()
    {
      // make sure we did check before callingcallback
      assert.isTrue(isPreCheckCalled);
      assert.called(callback);
      // and be done
      done();
    }, delay);
  },

  'Calls callback after default delay, if no delay is provided': function(done)
  {
    var isPreCheckCalled = false
      , callback = this.spy()
      ;

    this.testObject._delayedCallback(callback);

    // check it won't be called before delay is expired
    setTimeout(function()
    {
      isPreCheckCalled = true;
      refute.called(callback);
    }, this.testObject.delay-1);

    setTimeout(function()
    {
      // make sure we did check before callingcallback
      assert.isTrue(isPreCheckCalled);
      assert.called(callback);
      // and be done
      done();
    }, this.testObject.delay);
  }
});

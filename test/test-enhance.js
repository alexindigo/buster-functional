var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('enhance',
{
  // create new test object for each test
  setUp: common.setUp,

  'Stores provided handler within object': function()
  {
    var handler = {prop: Math.random()};

    // should be difference between before and after
    refute.equals(this.testObject._enhanceHandler, handler);

    // invoke test subject
    this.testObject.enhance(handler);

    assert.equals(this.testObject._enhanceHandler, handler);
  }
});

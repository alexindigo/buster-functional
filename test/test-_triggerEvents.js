var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('_triggerEvents',
{
  // create new test object for each test
  setUp: common.createTestObject,

  'exists': function()
  {
    assert.isFunction(this.testObject._triggerEvents);
  }
});

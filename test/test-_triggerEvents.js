var buster = require('buster')
  , mixin  = require('../lib/test_case_mixin')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('_triggerEvents',
{
  // prepare for test
  setUp: function()
  {
    testObject = {};
    mixin(testObject);
  },

  'exists': function()
  {
    assert.isFunction(testObject._triggerEvents);
  }
});

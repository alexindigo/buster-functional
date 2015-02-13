var buster = require('buster')
  , mixin  = require('../lib/test_case_mixin')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('_trigger',
{
  // prepare for test
  setUp: function()
  {
    testObject = {};
    mixin(testObject);
  },

  'Exists': function()
  {
    assert.isFunction(testObject._trigger);
  },

  'triggers provided event on the target': function()
  {
    var target = {trigger: this.spy()}
      , event  = {prop: Math.random()}
      ;

    testObject._trigger(target, event);

    assert.calledWith(target.trigger, event);
  }
});

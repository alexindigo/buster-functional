var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('_trigger',
{
  // create new test object for each test
  setUp: common.createTestObject,

  'Exists': function()
  {
    assert.isFunction(this.testObject._trigger);
  },

  'triggers provided event on the target': function()
  {
    var target = {trigger: this.spy()}
      , event  = {prop: Math.random()}
      ;

    this.testObject._trigger(target, event);

    assert.calledWith(target.trigger, event);
  }
});

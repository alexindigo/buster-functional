var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  ;

buster.testCase('_createFocusOrBlurEvent',
{
  // create new test object for each test
  setUp: common.setUp,

  'Returns focus event type while triggering focus method on the object': function()
  {
    var event
      , type = 'focus'
      , target = common.createTargetElement.call(this)
      ;

    // invoke test subject
    event = this.testObject._createFocusOrBlurEvent(type, target);
    assert.equals(type, event);

    // focus method trigered on the target element
    assert.calledOnce(target.focus);
  },

  'Returns blur event type while triggering focus method on the object': function()
  {
    var event
      , type = 'blur'
      , target = common.createTargetElement.call(this)
      ;

    // invoke test subject
    event = this.testObject._createFocusOrBlurEvent(type, target);
    assert.equals(type, event);

    // focus method trigered on the target element
    assert.calledOnce(target.blur);
  }
});

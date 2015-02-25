var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  ;

buster.testCase('_createTouchEvent',
{
  // create new test object for each test
  setUp: common.setUp,

  'Creates touchstart event object': function()
  {
    var event
      , type = 'touchstart'
      , target = common.createTargetElement.call(this)
      , blankTouchEvent = common.blankTouchEvent(type)
      , blankTouchCoords = common.blankTouchCoords()
      ;

    // augment testObject with jQuery things
    event = this.testObject._createTouchEvent(type, target);
    assert.equals(common._jQuery_Event, event);

    // since no extend function is present check it's arguments
    assert.calledWith(this.testObject.$.extend, true, {}, blankTouchEvent, blankTouchCoords);
  },

  'Creates touchend event object': function()
  {
    var event
      , type = 'touchend'
      , target = common.createTargetElement.call(this)
      , blankTouchEvent = common.blankTouchEvent(type)
      , blankTouchCoords = common.blankTouchCoords()
      ;

    // augment testObject with jQuery things
    event = this.testObject._createTouchEvent(type, target);
    assert.equals(common._jQuery_Event, event);

    // since no extend function is present check it's arguments
    assert.calledWith(this.testObject.$.extend, true, {}, blankTouchEvent, {});
    // double check that coordinates not being passed for touchend
    refute.calledWith(this.testObject.$.extend, true, {}, blankTouchEvent, blankTouchCoords);
  }
});

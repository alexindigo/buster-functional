var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  ;

buster.testCase('_createMouseEvent',
{
  // create new test object for each test
  setUp: common.createTestObject,

  'Creates mousedown event object': function()
  {
    var event
      , type = 'mousedown'
      , target = common.createTargetElement.call(this)
      , blankMouseEvent = common.blankMouseEvent(type)
      ;

    // augment testObject with jQuery things
    event = this.testObject._createMouseEvent(type, target);
    assert.equals(common._jQuery_Event, event);

    // since no extend function is present check it's arguments
    assert.calledWith(this.testObject.$.extend, true, {}, blankMouseEvent);
    // check that nothing else was mixed in with the mouse event
    assert.equals(this.testObject.$.extend.getCall(0).args.length, 3);
  },

  'Creates mouseup event object': function()
  {
    var event
      , type = 'mouseup'
      , target = common.createTargetElement.call(this)
      , blankMouseEvent = common.blankMouseEvent(type)
      ;

    // augment testObject with jQuery things
    event = this.testObject._createMouseEvent(type, target);
    assert.equals(common._jQuery_Event, event);

    // since no extend function is present check it's arguments
    assert.calledWith(this.testObject.$.extend, true, {}, blankMouseEvent);
    // check that nothing else was mixed in with the mouse event
    assert.equals(this.testObject.$.extend.getCall(0).args.length, 3);
  }
});

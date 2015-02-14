var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  ;

buster.testCase('_createEvent',
{
  // create new test object for each test
  setUp: common.createTestObject,

  'Routes keydown event with provided extra': function()
  {
    var event
      , type = 'keydown'
      , char = 'k'
      ;

    // stub
    this.stub(this.testObject, '_createKeyEvent');

    // augment testObject with jQuery things
    this.testObject._createEvent(type, char);

    // since no extend function is present check it's arguments
    assert.calledWith(this.testObject._createKeyEvent, type, char);
  },

  'Routes touchstart event with provided extra': function()
  {
    var event
      , type = 'touchstart'
      , target = common.createTargetElement.call(this)
      ;

    // stub
    this.stub(this.testObject, '_createTouchEvent');

    // augment testObject with jQuery things
    this.testObject._createEvent(type, target);

    // since no extend function is present check it's arguments
    assert.calledWith(this.testObject._createTouchEvent, type, target);
  },

  'Routes mouseup event with provided extra': function()
  {
    var event
      , type = 'mouseup'
      , target = common.createTargetElement.call(this)
      ;

    // stub
    this.stub(this.testObject, '_createMouseEvent');

    // augment testObject with jQuery things
    this.testObject._createEvent(type, target);

    // since no extend function is present check it's arguments
    assert.calledWith(this.testObject._createMouseEvent, type, target);
  },

  'Routes click event with provided extra': function()
  {
    var event
      , type = 'click'
      , target = common.createTargetElement.call(this)
      ;

    // route click to the mouse event handler
    this.stub(this.testObject, '_createMouseEvent');

    // augment testObject with jQuery things
    this.testObject._createEvent(type, target);

    // since no extend function is present check it's arguments
    assert.calledWith(this.testObject._createMouseEvent, type, target);
  }
});

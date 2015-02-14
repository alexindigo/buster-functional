var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  ;

buster.testCase('_createTypeEvent',
{
  // create new test object for each test
  setUp: common.createTestObject,

  'Creates keydown event object with lowercase letter': function()
  {
    var event
      , type = 'keydown'
      , char = 'k'
      , blankTypeEvent = common.blankTypeEvent(type, char)
      ;

    // augment testObject with jQuery things
    event = this.testObject._createTypeEvent(type, char);
    assert.equals(common._jQuery_Event, event);

    // since no extend function is present check it's arguments
    assert.calledWith(this.testObject.$.Event, type, blankTypeEvent);
  },

  'Creates keypress event object with uppercase letter': function()
  {
    var event
      , type = 'keypress'
      , char = 'U'
      , blankTypeEvent = common.blankTypeEvent(type, char)
      ;

    // augment testObject with jQuery things
    event = this.testObject._createTypeEvent(type, char);
    assert.equals(common._jQuery_Event, event);

    // since no extend function is present check it's arguments
    assert.calledWith(this.testObject.$.Event, type, blankTypeEvent);
  }
});

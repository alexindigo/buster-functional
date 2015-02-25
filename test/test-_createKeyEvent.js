var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  ;

buster.testCase('_createKeyEvent',
{
  // create new test object for each test
  setUp: common.setUp,

  'Creates keydown event object with lowercase letter': function()
  {
    var event
      , type = 'keydown'
      , char = 'k'
      , blankKeyEvent = common.blankKeyEvent(type, char)
      ;

    // augment testObject with jQuery things
    event = this.testObject._createKeyEvent(type, char);
    assert.equals(common._jQuery_Event, event);

    // since no extend function is present check it's arguments
    assert.calledWith(this.testObject.$.Event, type, blankKeyEvent);
  },

  'Creates keypress event object with uppercase letter': function()
  {
    var event
      , type = 'keypress'
      , char = 'U'
      , blankKeyEvent = common.blankKeyEvent(type, char)
      ;

    // augment testObject with jQuery things
    event = this.testObject._createKeyEvent(type, char);
    assert.equals(common._jQuery_Event, event);

    // since no extend function is present check it's arguments
    assert.calledWith(this.testObject.$.Event, type, blankKeyEvent);
  }
});

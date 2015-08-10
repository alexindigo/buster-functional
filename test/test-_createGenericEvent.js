var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
//  , refute = buster.referee.refute
  ;

buster.testCase('_createGenericEvent',
{
  // create new test object for each test
  setUp: common.setUp,

  'Creates event object for the provided event type': function()
  {
    var event
      , type = 'focus'
      , eventObject = {me: Math.random()}
      ;

    // fake event creation
    this.testObject.$.Event.withArgs(type).returns(eventObject);

    // invoke test subject
    event = this.testObject._createGenericEvent(type);
    // passed event type into jQuery event
    assert.calledWith(this.testObject.$.Event, type);
    // returns event object
    assert.equals(event, eventObject);
  }
});

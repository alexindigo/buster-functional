var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('_setEventRoot',
{
  // create new test object for each test
  setUp: common.setUp,

  tearDown: function()
  {
    // clean up _eventRoot
    delete this.testObject._eventRoot;
  },

  'Changes _eventRoot': function()
  {
    var eventRoot = 'Me event root' + Math.random();

    // invoke test subject
    this.testObject._setEventRoot(eventRoot);

    // _eventRoot should be changed
    assert.equals(this.testObject._eventRoot, eventRoot);
  }
});

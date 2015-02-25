var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('unload',
{
  // create new test object for each test
  setUp: common.setUp,

  // clean up global mess
  tearDown: function()
  {
    delete global.document;
  },

  'Cleans up things on exit': function()
  {
    var callback = {me: Math.random()};

    // prepare global
    global.document = {cookie: '_UNMODIFIED_', body: {removeChild: this.spy()}};

    // prepare test subject
    this.testObject.iframe = {me: Math.random()};
    this.stub(this.testObject, '_delayedCallback');

    // invoke test subject
    this.testObject.unload(callback);

    // cookie was reset
    assert.equals(global.document.cookie, common.cookieExpired);
    // removed iframe
    assert.calledWith(global.document.body.removeChild, this.testObject.iframe);
    // passed provided callback asynchronously
    assert.calledWith(this.testObject._delayedCallback, callback);
  }
});

var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('load',
{
  // create new test object for each test
  setUp: common.createTestObject,

  // clean up global mess
  tearDown: function()
  {
    delete global.document;
    delete global.buster;
  },

  'Cleans up things on exit': function()
  {
    var uriPath = '/example/page'
      , callback = {me: Math.random()}
      ;

    // prepare global
    global.document = {cookie: '_UNMODIFIED_'};
    global.buster   = {env: {contextPath: common.busterContextPath}};

    // prepare test subject
    this.stub(this.testObject, '_loadInIframe');
    this.stub(this.testObject, '_delayedCallback');

    // invoke test subject
    this.testObject.load(uriPath, callback);

    // cookie was set
    assert.equals(global.document.cookie, common.cookieContextPath);
    // creating iframe with passed url
    assert.calledWith(this.testObject._loadInIframe, uriPath);
    // callback passed to the _loadInFrame
    assert.isFunction(this.testObject._loadInIframe.getCall(0).args[1]);
  }
});

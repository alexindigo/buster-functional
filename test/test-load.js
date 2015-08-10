var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
//  , refute = buster.referee.refute
  ;

buster.testCase('load',
{
  // create new test object for each test
  setUp: common.setUp,

  // clean up global mess
  tearDown: function()
  {
    delete global.document;
    delete global.buster;
  },

  'Creates iframe:':
  {
    setUp: function()
    {
      this._stubs = {};
      this._stubs.callback = {me: Math.random()};

      // prepare global
      global.document = {cookie: '_UNMODIFIED_'};
      global.buster   = {env: {contextPath: common.busterContextPath}};

      // prepare test subject
      this.stub(this.testObject, '_loadInIframe');

      // invoke test subject
      this.testObject.load(common.iframeUriPath, this._stubs.callback);
    },

    'Creates proxy cookie and invokes _loadInIframe': function()
    {
      // cookie was set
      assert.equals(global.document.cookie, common.cookieContextPath);
      // creating iframe with passed url
      assert.calledWith(this.testObject._loadInIframe, common.iframeUriPath);
      // callback passed to the _loadInFrame
      assert.isFunction(this.testObject._loadInIframe.getCall(0).args[1]);

    }
  }
});

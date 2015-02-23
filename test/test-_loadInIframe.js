var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('_loadInIframe',
{
  // create new test object for each test
  setUp: common.createTestObject,

  // clean up global mess
  tearDown: function()
  {
    delete global.document;
  },

  'Creates iframe object with requested source:':
  {
    setUp: function()
    {
      // prepare stubs
      this._stubs = {};

      this._stubs.iwin     = {me: 'pretends to be window object within iframe'};
      this._stubs.idoc     = {me: 'pretends to be document object within iframe'};
      this._stubs.iframe   = {contentWindow: this._stubs.iwin, contentDocument: this._stubs.idoc};
      this._stubs.callback = this.spy();

      // add jquery symbol
      this._stubs.iwin.$ = {me: 'pretends to be jQuery object within iframe'};

      // stub methods called within _loadInIframe
      this.stub(this.testObject, '_createIframe').returns(this._stubs.iframe);
      this.spy(this.testObject, '_enhanceHandler');

      // stub document object
      global.document = {body: {appendChild: this.spy()}};

      // run test subject
      this.testObject._loadInIframe(common.iframeUriPath, this._stubs.callback);
    },

    'Passes proper src to the _createIframe': function()
    {
      assert.calledWith(this.testObject._createIframe, common.iframeUriPath);
    },

    'Appends iframe to the document': function()
    {
      // invoke load handler
      this._stubs.iframe.onload();

      // check appened element
      assert.calledWith(global.document.body.appendChild, this._stubs.iframe);
    },

    'Tried _enhanceHandler with iframe window object': function()
    {
      // invoke load handler
      this._stubs.iframe.onload();

      assert.calledWith(this.testObject._enhanceHandler, this._stubs.iwin);
    },

    'Invokes provided callback with reference to iframe objects': function()
    {
      // invoke load handler
      this._stubs.iframe.onload();

      // got calback with created objects
      assert.calledWith(this._stubs.callback, this._stubs.iframe, this._stubs.iwin.$, this._stubs.iwin, this._stubs.idoc);
    },

    'Works in iframe.contentDocument-less environments': function()
    {
      // adjust environment to simulate
      this._stubs.iframe.contentWindow.document = this._stubs.idoc;
      delete this._stubs.iframe.contentDocument;

      // invoke load handler
      this._stubs.iframe.onload();

      // got calback with created objects
      assert.calledWith(this._stubs.callback, this._stubs.iframe, this._stubs.iwin.$, this._stubs.iwin, this._stubs.idoc);
    }
  }
});

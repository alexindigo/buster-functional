var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  ;

buster.testCase('_loadInIframe',
{
  // create new test object for each test
  setUp: common.setUp,

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

      this._stubs.$         = this.stub();
      this._stubs.window    = {me: 'pretends to be window object within iframe'};
      this._stubs.document  = {me: 'pretends to be document object within iframe'};
      this._stubs.$document = {me: 'pretends to be jQuery document object within iframe'};
      this._stubs.iframe    = {contentWindow: this._stubs.window, contentDocument: this._stubs.document};
      this._stubs.callback  = this.spy();

      // add jquery symbol
      this._stubs.window.$ = this._stubs.$;
      this._stubs.$.withArgs(this._stubs.document).returns(this._stubs.$document);

      // stub methods called within _loadInIframe
      this.stub(this.testObject, '_createIframe').returns(this._stubs.iframe);
      this.stub(this.testObject, '_setEventRoot').returns();
      this.spy(this.testObject, '_enhanceHandler');

      // run test subject
      this.testObject._loadInIframe(common.iframeUriPath, this._stubs.callback);
    },

    'Passes proper src to the _createIframe': function()
    {
      // assigns iframe to the test object
      assert.equals(this.testObject.iframe, this._stubs.iframe);

      assert.calledWith(this.testObject._createIframe, common.iframeUriPath);
    },

    'Tried _enhanceHandler with iframe window object': function()
    {
      // invoke load handler
      this._stubs.iframe.onload();

      // sets event root as well
      assert.calledWith(this._stubs.$, this._stubs.document);
      assert.calledWith(this.testObject._setEventRoot, this._stubs.$document);

      assert.calledWith(this.testObject._enhanceHandler, this._stubs.window);
    },

    'Invokes provided callback and adds reference to iframe objects': function()
    {
      refute.equals(this.testObject.window, this._stubs.window);
      refute.equals(this.testObject.document, this._stubs.document);
      refute.equals(this.testObject.$, this._stubs.$);

      // invoke load handler
      this._stubs.iframe.onload();

      assert.equals(this.testObject.window, this._stubs.window);
      assert.equals(this.testObject.document, this._stubs.document);
      assert.equals(this.testObject.$, this._stubs.$);

      // got calback with created objects
      assert.calledOnce(this._stubs.callback);
    },

    'Works in iframe.contentDocument-less environments': function()
    {
      // adjust environment to simulate
      this._stubs.iframe.contentWindow.document = this._stubs.document;
      delete this._stubs.iframe.contentDocument;

      refute.equals(this.testObject.document, this._stubs.document);

      // invoke load handler
      this._stubs.iframe.onload();

      assert.equals(this.testObject.document, this._stubs.document);
    },

    'Reuses already existing iframe': function()
    {
      // invoke load handler
      this._stubs.iframe.onload();

      // check for original values
      assert.equals(this.testObject.window, this._stubs.window);
      assert.equals(this.testObject.document, this._stubs.document);
      assert.equals(this.testObject.$, this._stubs.$);

      this._stubs.$        = this.spy();
      this._stubs.window   = {me: 'second time: pretends to be window object within iframe'};
      this._stubs.document = {me: 'second time: pretends to be document object within iframe'};

      this._stubs.iframe.contentWindow   = this._stubs.window;
      this._stubs.iframe.contentDocument = this._stubs.document;
      // update jquery symbol
      this._stubs.window.$ = this._stubs.$;

      // run test subject second time
      this.testObject._loadInIframe(common.iframeUriPath, this._stubs.callback);

      // shouldn't call _createIframe again
      assert.calledOnce(this.testObject._createIframe);

      // invoke load handler
      this._stubs.iframe.onload();

      // check for new values
      assert.equals(this.testObject.window, this._stubs.window);
      assert.equals(this.testObject.document, this._stubs.document);
      assert.equals(this.testObject.$, this._stubs.$);
    },

    'Handles the case of $ not defined':
    {
      setUp: function()
      {
        this._stubs.iframe.contentWindow = {$: undefined};
        this.testObject._loadInIframe(common.iframeUriPath, this._stubs.callback);
      },

      tearDown: function()
      {
        //restore the original stub
        this._stubs.iframe.contentWindow = this._stubs.window;
      },

      'Throws an exception if $ is not defined in the iframe': function()
      {
        assert.exception(function()
        {
          this._stubs.iframe.onload();
        }.bind(this), {message: 'The iframe was not loaded correctly, please double check that the url you requested is available in your test: '});
      }
    }
  }
});

var buster = require('buster')
  , mixin  = require('../lib/test_case_mixin')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('_loadInIframe',
{
  // prepare for test
  setUp: function()
  {
    testObject = {};
    mixin(testObject);
  },

  // clean up global mess
  tearDown: function()
  {
    delete global.document;
  },

  'Exists': function()
  {
    assert.isFunction(testObject._loadInIframe);
  },

  'Creates iframe object with requested source': function()
  {
    var src      = 'http://example.com'
      , iwin     = {me: 'pretends to be window object within iframe'}
      , idoc     = {me: 'pretends to be document object within iframe'}
      , iframe   = {contentWindow: iwin, contentDocument: idoc}
      , callback = this.spy()
      ;

    // add jquery symbol
    iwin.$ = {me: 'pretends to be jQuery object within iframe'};

    // stub methods called within _loadInIframe
    this.stub(testObject, '_createIframe').returns(iframe);
    this.spy(testObject, '_enhanceHandler');

    // stub document object
    global.document = {body: {appendChild: this.spy()}};

    // run test subject
    testObject._loadInIframe(src, callback);

    // check attach load handler
    assert.isFunction(iframe.onload);
    // check appened element
    assert.calledWith(global.document.body.appendChild, iframe);

    // invoke load handler
    iframe.onload();

    // tried _enhanceHandler
    assert.calledWith(testObject._enhanceHandler, iwin);

    // got calback with created objects
    assert.calledWith(callback, iframe, iwin.$, iwin, idoc);
  }
});

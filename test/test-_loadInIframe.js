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
    this.stub(this.testObject, '_createIframe').returns(iframe);
    this.spy(this.testObject, '_enhanceHandler');

    // stub document object
    global.document = {body: {appendChild: this.spy()}};

    // run test subject
    this.testObject._loadInIframe(src, callback);

    // check attach load handler
    assert.isFunction(iframe.onload);
    // check appened element
    assert.calledWith(global.document.body.appendChild, iframe);

    // invoke load handler
    iframe.onload();

    // tried _enhanceHandler
    assert.calledWith(this.testObject._enhanceHandler, iwin);

    // got calback with created objects
    assert.calledWith(callback, iframe, iwin.$, iwin, idoc);
  }
});

var buster = require('buster')
  , mixin  = require('../lib/test_case_mixin')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('_createIframe',
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
    assert.isFunction(testObject._createIframe);
  },

  'Creates iframe object with requested source': function()
  {
    var iframe, src = 'http://example.com';

    global.document = {createElement: this.stub().returns({style: {}})};

    iframe = testObject._createIframe(src);

    assert.calledWith(global.document.createElement, 'iframe');
    assert.equals(iframe.src, src);
    assert.equals(iframe.width, '100%');
    assert.equals(iframe.style.width, '100%');
    assert.equals(iframe.style.position, 'fixed');
  }
});

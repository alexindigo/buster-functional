var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('_createIframe',
{
  // create new test object for each test
  setUp: common.setUp,

  // clean up global mess
  tearDown: function()
  {
    delete global.document;
  },

  'Creates iframe object with requested source': function()
  {
    var iframe, src = 'http://example.com';

    global.document = {createElement: this.stub().returns({style: {}})};

    iframe = this.testObject._createIframe(src);

    assert.calledWith(global.document.createElement, 'iframe');
    assert.equals(iframe.src, src);
    assert.equals(iframe.width, '100%');
    assert.equals(iframe.style.width, '100%');
    assert.equals(iframe.style.position, 'fixed');
  }
});

var path   = require('path')
  , buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , loaderFile = '../lib/mixin_loader.js'
  , testObject
  ;

buster.testCase('Loader',
{
  // create new test object for each test
  setUp: function()
  {
    common.createStubBuster.call(this);

    // make it global as buster
    global.buster = this.stubBuster;

    // clean cache
    delete require.cache[path.join(__dirname, loaderFile)];
    // reload loader
    require(loaderFile);
  },

  'Attaches onCreate hanlder': function()
  {
    assert.calledOnce(this.stubBuster.testRunner.onCreate);
  }
});

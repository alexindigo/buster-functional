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
  },

  'Listens to the runner events:':
  {
    setUp: function()
    {
      // stub test runner object
      this.runner = {on: this.spy()};

      // stub global busterFunctionalMixin
      global.busterFunctionalMixin = {me: Math.random()};

      // provide runner object to the onCreate callback
      this.stubBuster.testRunner.onCreate.getCall(0).args[0](this.runner);
    },

    'Attaches test runner event listners': function()
    {
      // it assigns handler for several events
      assert.calledWith(this.runner.on, 'suite:start');
      assert.calledWith(this.runner.on, 'suite:end');
      assert.calledWith(this.runner.on, 'context:end');
      // attaches the mixin to the runner setup
      assert.calledWith(this.runner.on, 'test:setUp', global.busterFunctionalMixin);
    },

    'Resizes frames on suite:start': function()
    {
      var targetFrameset = {rows: '_UNMODIFIED_'}
        , stubGetElementsByTagName = this.stub()
        ;

      // prepare stub
      stubGetElementsByTagName.withArgs('frameset').returns([targetFrameset]);

      // traverse dom
      global.window = {top: {document: {getElementsByTagName: stubGetElementsByTagName}}};

      // first one is 'suite:start'
      this.runner.on.getCall(0).args[1]();

      // check frameset selection
      assert.calledWith(stubGetElementsByTagName, 'frameset');
      // top iframe set to 0
      assert.equals(targetFrameset.rows, '0,*');
    }
  }
});

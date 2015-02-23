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

  // clean up global mess
  tearDown: function()
  {
    delete global.buster;
    delete global.document;
    delete global.window;
    delete global.busterFunctionalMixin;
  },

  'Attaches onCreate hanlder': function()
  {
    assert.calledOnce(this.stubBuster.testRunner.onCreate);
  },

  'Listens to the runner events:':
  {
    setUp: function()
    {
      // fake framset object
      this.targetFrameset = {rows: '_UNMODIFIED_'};
      // stub DOM methods
      this.stubGetElementsByTagName = this.stub();
      // prepare stub
      this.stubGetElementsByTagName.withArgs('frameset').returns([this.targetFrameset]);

      // stub document.cookie
      this.document = {cookie: '_UNMODIFIED_'};

      // stub test runner object
      this.runner = {on: this.spy()};

      // expose local document
      global.document = this.document;

      // traverse dom
      global.window = {top: {document: {getElementsByTagName: this.stubGetElementsByTagName}}};

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
      // first one is 'suite:start'
      this.runner.on.getCall(0).args[1]();

      // check frameset selection
      assert.calledWith(this.stubGetElementsByTagName, 'frameset');
      // top iframe set to 0
      assert.equals(this.targetFrameset.rows, '0,*');
    },

    'Resizes frames on suite:end': function()
    {
      // second one is 'suite:end'
      this.runner.on.getCall(1).args[1]();

      // check frameset selection
      assert.calledWith(this.stubGetElementsByTagName, 'frameset');
      // top iframe set to 80px
      assert.equals(this.targetFrameset.rows, '80px,*');
    },

    'Cleans up buster_contextPath cookie on suite:end': function()
    {
      // second one is 'suite:end'
      this.runner.on.getCall(1).args[1]();

      // top iframe set to 80px
      assert.equals(this.document.cookie, 'buster_contextPath=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT');
    },

    'Cleans up buster_contextPath cookie on context:end': function()
    {
      // third one is 'context:end'
      this.runner.on.getCall(2).args[1]();

      // top iframe set to 80px
      assert.equals(this.document.cookie, 'buster_contextPath=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT');
    }
  }
});

var path   = require('path')
  , buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
//  , refute = buster.referee.refute
  , loaderFile = '../lib/mixin_loader.js'
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
      // fake runner.on()
      this._handlers = {};

      // fake framset object
      this.targetFrameset = {rows: '_UNMODIFIED_'};
      // stub DOM methods
      this.stubGetElementsByTagName = this.stub();
      // prepare stub
      this.stubGetElementsByTagName.withArgs('frameset').returns([this.targetFrameset]);

      // stub document.cookie
      this.document = {cookie: '_UNMODIFIED_'};

      // mock test runner object
      this.runner = {on: function(event, handler){ this._handlers[event] = handler; }.bind(this)};

      // expose local document
      global.document = this.document;

      // traverse dom
      global.window = {top: {document: {getElementsByTagName: this.stubGetElementsByTagName}}};

      // stub global busterFunctionalMixin
      global.busterFunctionalMixin = this.spy();

      // provide runner object to the onCreate callback
      this.stubBuster.testRunner.onCreate.getCall(0).callArgWith(0, this.runner);
    },

    'Attaches test runner event listners': function()
    {
      // it assigns handler for several events
      assert.isTrue('suite:start' in this._handlers);
      assert.isTrue('suite:end' in this._handlers);
      assert.isTrue('context:end' in this._handlers);
      // attaches the mixin to the runner setup
      assert.isTrue('test:setUp' in this._handlers);
    },

    'Calls mixin on test:setUp': function()
    {
      var testCase = {me: Math.random()};

      // invoke test subject
      this._handlers['test:setUp'](testCase);

      // functionalMixin
      assert.calledWith(global.busterFunctionalMixin, testCase);
    },

    'Resizes frames on suite:start': function()
    {
      // invoke test subject
      this._handlers['suite:start']();

      // check frameset selection
      assert.calledWith(this.stubGetElementsByTagName, 'frameset');
      // top iframe set to 0
      assert.equals(this.targetFrameset.rows, '0,*');
    },

    'Resizes frames on suite:end': function()
    {
      // invoke test subject
      this._handlers['suite:end']();

      // check frameset selection
      assert.calledWith(this.stubGetElementsByTagName, 'frameset');
      // top iframe set to 80px
      assert.equals(this.targetFrameset.rows, '80px,*');
    },

    'Cleans up buster_contextPath cookie on suite:end': function()
    {
      // invoke test subject
      this._handlers['suite:end']();

      // top iframe set to 80px
      assert.equals(this.document.cookie, common.cookieExpired);
    },

    'Cleans up buster_contextPath cookie on context:end': function()
    {
      // invoke test subject
      this._handlers['context:end']();

      // top iframe set to 80px
      assert.equals(this.document.cookie, common.cookieExpired);
    }
  }
});

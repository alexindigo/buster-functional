var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('_triggerEvents',
{
  // create new test object for each test
  setUp: common.setUp,

  'Creates and triggers events asynchronously': function(done)
  {
    var touchstartEvent = {me: 'touchstart event'}
      , touchendEvent = {me: 'touchend event'}
      , target = common.createTargetElement.call(this)
      ;

    // stub _createEvent
    this.stub(this.testObject, '_createEvent');
    this.testObject._createEvent.withArgs('touchstart').returns(touchstartEvent);
    this.testObject._createEvent.withArgs('touchend').returns(touchendEvent);
    // pretend event is triggered
    this.stub(this.testObject, '_trigger').returns(true);

    // invoke test subject
    this.testObject._triggerEvents(target, ['touchstart', 'touchend'], target, function()
    {
      // by now it should trigger boths events
      // runs with this.testObject context
      assert.calledTwice(this._trigger);
      assert.calledWith(this._trigger, target, touchstartEvent);
      assert.calledWith(this._trigger, target, touchendEvent);

      // account for all the assertions
      assert.equals(buster.referee.count, 7);
      // and done with the test
      done();
    });

    // first one invoke synchronously
    assert.calledOnceWith(this.testObject._createEvent, 'touchstart', target);

    // check there is no rush to go to the next event
    // and it waits expected amout of time
    setTimeout(function()
    {
      // still called only once
      assert.calledOnce(this.testObject._createEvent);
    }.bind(this), 0);

    // wait required amount of time
    setTimeout(function()
    {
      // ok, now it should be called twice
      assert.calledTwice(this.testObject._createEvent);
      assert.calledWith(this.testObject._createEvent, 'touchend', target);
    }.bind(this), this.testObject._interactionDelay);
  },

  'Respects stop propagation': function(done)
  {
    var touchstartEvent = {me: 'touchstart event', type: 'touchstart'}
      , touchendEvent = {me: 'touchend event', type: 'touchend'}
      , target = common.createTargetElement.call(this)
      ;

    // stub _createEvent
    this.stub(this.testObject, '_createEvent');
    this.testObject._createEvent.withArgs('touchstart').returns(touchstartEvent);
    this.testObject._createEvent.withArgs('touchend').returns(touchendEvent);
    // stop propagation after touchstart
    this.stub(this.testObject, '_trigger').withArgs(target, touchstartEvent).returns(false);

    // invoke test subject
    this.testObject._triggerEvents(target, ['touchstart', 'touchend'], target, function()
    {
      // it should trigger only first event
      // runs with this.testObject context
      assert.calledOnce(this._trigger);
      assert.calledWith(this._trigger, target, touchstartEvent);
      refute.calledWith(this._trigger, target, touchendEvent);
    });

    // first one invoke synchronously
    assert.calledOnceWith(this.testObject._createEvent, 'touchstart', target);

    // check there is no rush to go to the next event
    // and it waits expected amout of time
    setTimeout(function()
    {
      // still called only once
      assert.calledOnce(this.testObject._createEvent);
    }.bind(this), 0);

    // wait required amount of time
    setTimeout(function()
    {
      // still called only once
      // and it's not 'touchend'
      assert.calledOnce(this.testObject._createEvent);
      refute.calledWith(this.testObject._createEvent, 'touchend');

      // account for all the assertions
      assert.equals(buster.referee.count, 7);
      // and done with the test
      done();
    }.bind(this), this.testObject._interactionDelay);
  },

  'Supports sets of sync events': function(done)
  {
    var touchstartEvent = {me: 'touchstart event'}
      , touchendEvent   = {me: 'touchend event'}
      , mousedownEvent  = {me: 'mousedown event'}
      , mouseupEvent    = {me: 'mouseup event'}
      , clickEvent      = {me: 'click event'}
      , target          = common.createTargetElement.call(this)
      ;

    // stub _createEvent
    this.stub(this.testObject, '_createEvent');
    this.testObject._createEvent.withArgs('touchstart').returns(touchstartEvent);
    this.testObject._createEvent.withArgs('touchend').returns(touchendEvent);
    this.testObject._createEvent.withArgs('mousedown').returns(mousedownEvent);
    this.testObject._createEvent.withArgs('mouseup').returns(mouseupEvent);
    this.testObject._createEvent.withArgs('click').returns(clickEvent);
    // pretend event is triggered
    this.stub(this.testObject, '_trigger').returns(true);

    // invoke test subject
    this.testObject._triggerEvents(target, ['touchstart', ['touchend', 'mousedown', 'mouseup', 'click']], target, function()
    {
      // by now it should trigger boths events
      // runs with this.testObject context
      assert.calledWith(this._trigger, target, touchstartEvent);
      assert.calledWith(this._trigger, target, touchendEvent);
      assert.calledWith(this._trigger, target, mousedownEvent);
      assert.calledWith(this._trigger, target, mouseupEvent);
      assert.calledWith(this._trigger, target, clickEvent);

      // account for all the assertions
      assert.equals(buster.referee.count, 11);
      // and done with the test
      done();
    });

    // first one invoke synchronously
    assert.calledOnceWith(this.testObject._createEvent, 'touchstart', target);

    // check there is no rush to go to the next event
    // and it waits expected amout of time
    setTimeout(function()
    {
      // still called only once
      assert.calledOnce(this.testObject._createEvent);
    }.bind(this), 0);

    // wait required amount of time
    setTimeout(function()
    {
      // ok, now it should be called twice
      assert.calledWith(this.testObject._createEvent, 'touchend', target);
      assert.calledWith(this.testObject._createEvent, 'mousedown', target);
      assert.calledWith(this.testObject._createEvent, 'mouseup', target);
      assert.calledWith(this.testObject._createEvent, 'click', target);
    }.bind(this), this.testObject._interactionDelay);
  },

  'Executes custom functions passed with the events': function(done)
  {
    var keydownEvent  = {me: 'keydown event'}
      , keypressEvent = {me: 'keypress event'}
      , keyupEvent    = {me: 'keyup event'}
      , target        = common.createTargetElement.call(this)
      , char          = 'A'
      , changeValue   = this.spy()
      ;

    // stub _createEvent
    this.stub(this.testObject, '_createEvent');
    this.testObject._createEvent.withArgs('keydown').returns(keydownEvent);
    this.testObject._createEvent.withArgs('keypress').returns(keypressEvent);
    this.testObject._createEvent.withArgs('keyup').returns(keyupEvent);
    // pretend event is triggered
    this.stub(this.testObject, '_trigger').returns(true);

    // invoke test subject
    this.testObject._triggerEvents(target, [['keydown', 'keypress', changeValue], 'keyup'], char, function()
    {
      // by now it should trigger boths events
      // runs with this.testObject context
      assert.calledThrice(this._trigger);
      assert.calledWith(this._trigger, target, keydownEvent);
      assert.calledWith(this._trigger, target, keypressEvent);
      assert.calledWith(this._trigger, target, keyupEvent);

      // account for all the assertions
      assert.equals(buster.referee.count, 12);
      // and done with the test
      done();
    });

    // first two invoke synchronously
    assert.calledTwice(this.testObject._createEvent);
    assert.calledWith(this.testObject._createEvent, 'keydown', char);
    assert.calledWith(this.testObject._createEvent, 'keypress', char);

    // check custom function was called within sync sequence
    assert.calledOnce(changeValue);
    // and called with test context
    assert.calledOn(changeValue, this.testObject);

    // check there is no rush to go to the next event
    // and it waits expected amout of time
    setTimeout(function()
    {
      // still called only once
      assert.calledTwice(this.testObject._createEvent);
    }.bind(this), 0);

    // wait required amount of time
    setTimeout(function()
    {
      // ok, now it should be called twice
      assert.calledThrice(this.testObject._createEvent);
      assert.calledWith(this.testObject._createEvent, 'keyup', char);
    }.bind(this), this.testObject._interactionDelay);
  },

  'Supports custom event function as standalone async member': function(done)
  {
    var focusEvent  = {me: 'focus event'}
      , blurEvent   = {me: 'blur event'}
      , target      = common.createTargetElement.call(this)
      , updateField = this.spy()
      ;

    // need extra timeout for this test
    this.timeout = this.testObject._interactionDelay * 3;

    // stub _createEvent
    this.stub(this.testObject, '_createEvent');
    this.testObject._createEvent.withArgs('focus').returns(focusEvent);
    this.testObject._createEvent.withArgs('blur').returns(blurEvent);
    // pretend event is triggered
    this.stub(this.testObject, '_trigger').returns(true);

    // invoke test subject
    this.testObject._triggerEvents(target, ['focus', updateField, 'blur'], function()
    {
      // by now it should trigger boths events
      // runs with this.testObject context
      assert.calledTwice(this._trigger);
      assert.calledWith(this._trigger, target, focusEvent);
      assert.calledWith(this._trigger, target, blurEvent);

      // account for all the assertions
      assert.equals(buster.referee.count, 16);
      // and done with the test
      done();
    });

    // first event invoked synchronously
    assert.calledOnce(this.testObject._createEvent);
    assert.calledWithExactly(this.testObject._createEvent, 'focus');

    // shouldn't be called yet
    refute.called(updateField);

    // check there is no rush to go to the next event
    // and it waits expected amout of time
    setTimeout(function()
    {
      // createEvent still called only once
      assert.calledOnce(this.testObject._createEvent);
      // shouldn't be called yet still
      refute.called(updateField);
    }.bind(this), 0);

    // wait required amount of time
    setTimeout(function()
    {
      // createEvent still called only once
      assert.calledOnce(this.testObject._createEvent);

      // called only once
      assert.calledOnce(updateField);
      // and called with test context
      assert.calledOn(updateField, this.testObject);

      // check that it waits proper amount of time
      setTimeout(function()
      {
        // createEvent still called only once
        assert.calledOnce(this.testObject._createEvent);
        // no repeated calls of the custom function
        assert.calledOnce(updateField);
      }.bind(this), 0);

      // wait one more time for another iteration
      setTimeout(function()
      {
        // createEvent called second time
        assert.calledTwice(this.testObject._createEvent);
        // called with proper arguments as well
        assert.calledWithExactly(this.testObject._createEvent, 'blur');

        // still no repeated calls of the custom function
        assert.calledOnce(updateField);

      }.bind(this), this.testObject._interactionDelay);


    }.bind(this), this.testObject._interactionDelay);
  }
});

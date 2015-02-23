var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('_triggerEvents',
{
  // create new test object for each test
  setUp: common.createTestObject,

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

    // invoke test subject
    this.testObject._triggerEvents(target, ['touchstart', 'touchend'], target, function()
    {
      // by now it should trigger boths events
      assert.calledTwice(target.trigger);
      assert.calledWith(target.trigger, touchstartEvent);
      assert.calledWith(target.trigger, touchendEvent);

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

  'Respects defaultPrevented flag': function(done)
  {
    var touchstartEvent = {me: 'touchstart event'}
      , touchendEvent = {me: 'touchend event'}
      , target = common.createTargetElement.call(this)
      ;

    // set defaultPrevented to true on touchstartEvent
    touchstartEvent.defaultPrevented = true;

    // stub _createEvent
    this.stub(this.testObject, '_createEvent');
    this.testObject._createEvent.withArgs('touchstart').returns(touchstartEvent);
    this.testObject._createEvent.withArgs('touchend').returns(touchendEvent);

    // invoke test subject
    this.testObject._triggerEvents(target, ['touchstart', 'touchend'], target, function()
    {
      // it should trigger only first event
      assert.calledOnce(target.trigger);
      assert.calledWith(target.trigger, touchstartEvent);
      refute.calledWith(target.trigger, touchendEvent);
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

      // and done with the test
      done();
    }.bind(this), this.testObject._interactionDelay);
  },

  'Respects isDefaultPrevented function': function(done)
  {
    var touchstartEvent = {me: 'touchstart event'}
      , touchendEvent = {me: 'touchend event'}
      , target = common.createTargetElement.call(this)
      ;

    // set isDefaultPrevented on touchstartEvent to return true
    touchstartEvent.isDefaultPrevented = this.stub().returns(true);

    // stub _createEvent
    this.stub(this.testObject, '_createEvent');
    this.testObject._createEvent.withArgs('touchstart').returns(touchstartEvent);
    this.testObject._createEvent.withArgs('touchend').returns(touchendEvent);

    // invoke test subject
    this.testObject._triggerEvents(target, ['touchstart', 'touchend'], target, function()
    {
      // it should trigger only first event
      assert.calledOnce(target.trigger);
      assert.calledWith(target.trigger, touchstartEvent);
      refute.calledWith(target.trigger, touchendEvent);
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

      // and done with the test
      done();
    }.bind(this), this.testObject._interactionDelay);
  },

  'Continues flow when isDefaultPrevented exists but returns false': function(done)
  {
    var touchstartEvent = {me: 'touchstart event'}
      , touchendEvent = {me: 'touchend event'}
      , target = common.createTargetElement.call(this)
      ;

    // set isDefaultPrevented on touchstartEvent to return false
    touchstartEvent.isDefaultPrevented = this.stub().returns(false);

    // stub _createEvent
    this.stub(this.testObject, '_createEvent');
    this.testObject._createEvent.withArgs('touchstart').returns(touchstartEvent);
    this.testObject._createEvent.withArgs('touchend').returns(touchendEvent);

    // invoke test subject
    this.testObject._triggerEvents(target, ['touchstart', 'touchend'], target, function()
    {
      // by now it should trigger boths events
      assert.calledTwice(target.trigger);
      assert.calledWith(target.trigger, touchstartEvent);
      assert.calledWith(target.trigger, touchendEvent);

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
  }
});

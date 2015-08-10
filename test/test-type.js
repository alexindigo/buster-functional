var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  ;

buster.testCase('type',
{
  // create new test object for each test
  setUp: common.setUp,

  'Invokes _triggerEvents with list of events': function(done)
  {
    var eventsList = [['keydown', 'keypress', '[Function: addChar]', 'input'], 'keyup']
      , target     = common.createTargetElement.call(this)
      , text       = 'abc'
      , callback   = this.spy()
      ;

    // it takes longer than default timeout
    this.timeout = Math.max(250, this.testObject._delay*3);

    // just check if _triggerEvents being called
    this.stub(this.testObject, '_triggerEvents');

    // invoke test subject
    this.testObject.type(target, text, callback);

    // gets only first element of the list
    assert.called(target.first);

    // events don't get triggered right away
    setTimeout(function()
    {
      refute.called(this.testObject._triggerEvents);
    }.bind(this), 0);

    // only after proper timeout
    setTimeout(function()
    {
      // First it focuses on the target
      assert.calledWith(this.testObject._triggerEvents, target, ['focus']);

      // --- events for the first letter
      // trigger callback after focus
      this.testObject._triggerEvents.getCall(0).callArgOn(2, this.testObject);

      // triggers first char of the string
      assert.calledWithMatch(this.testObject._triggerEvents, target, common.matchEventsList.bind(this, eventsList), text[0]);

      // execute custom event function
      this.testObject._triggerEvents.getCall(1).args[1][0][2](target, text[0]);

      // trigger callback after first char
      this.testObject._triggerEvents.getCall(1).callArgOn(3, this.testObject);

      // triggers second char of the string
      assert.calledWithMatch(this.testObject._triggerEvents, target, common.matchEventsList.bind(this, eventsList), text[1]);

      // execute custom event function
      this.testObject._triggerEvents.getCall(2).args[1][0][2](target, text[1]);

      // trigger callback after second char
      this.testObject._triggerEvents.getCall(2).callArgOn(3, this.testObject);

      // triggers third char of the string
      assert.calledWithMatch(this.testObject._triggerEvents, target, common.matchEventsList.bind(this, eventsList), text[2]);

      // execute custom event function
      this.testObject._triggerEvents.getCall(3).args[1][0][2](target, text[2]);

      // trigger callback after third char
      this.testObject._triggerEvents.getCall(3).callArgOn(3, this.testObject);

      // still called only four times
      assert.equals(this.testObject._triggerEvents.callCount, 4);

      // and wait for final callback
      setTimeout(function()
      {
        // target's value shoud contain text
        assert.equals(target[0].value, text);
        // callback been called
        assert.calledOnce(callback);
        // and be done
        done();
      }.bind(this), this.testObject._delay);

    }.bind(this), this.testObject._delay);
  },

  'Works with selectors beside jQuery object': function(done)
  {
    var selector   = 'Me selector' + Math.random()
      , target     = common.createTargetElement.call(this)
      , text       = 'abc'
      , callback   = this.spy()
      ;

    // pretend to be jQuery
    this.testObject.$.withArgs(selector).returns(target);

    // just check if _triggerEvents being called
    this.stub(this.testObject, '_triggerEvents');

    // invoke test subject
    this.testObject.type(selector, text, callback);

    // resolves target from selector
    assert.calledWith(this.testObject.$, selector);

    // gets only first element of the list
    assert.called(target.first);

    // only after proper timeout
    setTimeout(function()
    {
      // Invoked _triggerEvents with resolved target
      assert.calledWith(this.testObject._triggerEvents, target, ['focus']);

      done();
    }.bind(this), this.testObject._delay);
  },

  'Supports all the event types': function(done)
  {
    var eventsList = [['keydown', 'keypress', '[Function: addChar]', 'input'], 'keyup']
      , target     = common.createTargetElement.call(this)
      , text       = 'abc'
      ;

    // increase timeout to accomodate async triggering
    this.timeout = Math.max(250, this.testObject._interactionDelay * text.length * (eventsList.length+1));

    // Don't go too deep
    this.stub(this.testObject, '_trigger');
    // return event type instead of full object
    this.stub(this.testObject, '_createEvent').returnsArg(0);

    // invoke test subject
    this.testObject.type(target, text, function()
    {
      // each event type triggered
      // callback ran within testObject context
      assert.calledWith(this._trigger, target, 'keydown');
      assert.calledWith(this._trigger, target, 'keypress');
      assert.calledWith(this._trigger, target, 'input');
      assert.calledWith(this._trigger, target, 'keyup');

      done();
    });
  }
});

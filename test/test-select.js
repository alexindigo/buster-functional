var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('select',
{
  // create new test object for each test
  setUp: common.setUp,

  'Invokes _triggerEvents with list of events': function(done)
  {
    var eventsList  = [['focus', 'focusin', 'DOMFocusIn'], ['[Function: selectOption]', 'input', 'change'], ['blur', 'focusout', 'DOMFocusOut']]
      , target      = common.createTargetElement.call(this)
      , option      = 'B'
      , optionIndex = 1
      , callback    = this.spy()
      ;

    // just check if _triggerEvents being called
    this.stub(this.testObject, '_triggerEvents');

    // invoke test subject
    this.testObject.select(target, option, callback);

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
      // Passed all the events to _triggerEvents
      assert.calledWithMatch(this.testObject._triggerEvents, target, common.matchEventsList.bind(this, eventsList));

      // execute custom event function
      this.testObject._triggerEvents.getCall(0).args[1][1][0](target);

      // trigger callback
      this.testObject._triggerEvents.getCall(0).callArgOn(2, this.testObject);

      // and wait for final callback
      setTimeout(function()
      {
        // target's value shoud contain text
        assert.equals(target[0].selectIndex, optionIndex);
        // callback been called
        assert.calledOnce(callback);
        // and be done
        done();
      }.bind(this), this.testObject._delay);

    }.bind(this), this.testObject._delay);
  },

  'Works with selectors beside jQuery object': function(done)
  {
    var eventsList  = [['focus', 'focusin', 'DOMFocusIn'], ['[Function: selectOption]', 'input', 'change'], ['blur', 'focusout', 'DOMFocusOut']]
      , selector   = 'Me selector' + Math.random()
      , target      = common.createTargetElement.call(this)
      , option      = 'B'
      , optionIndex = 1
      , callback    = this.spy()
      ;

    // pretend to be jQuery
    this.testObject.$.withArgs(selector).returns(target);

    // just check if _triggerEvents being called
    this.stub(this.testObject, '_triggerEvents');

    // invoke test subject
    this.testObject.select(selector, option, callback);

    // resolves target from selector
    assert.calledWith(this.testObject.$, selector);

    // gets only first element of the list
    assert.called(target.first);

    // only after proper timeout
    setTimeout(function()
    {
      // Passed all the events to _triggerEvents
      assert.calledWithMatch(this.testObject._triggerEvents, target, common.matchEventsList.bind(this, eventsList));

      done();
    }.bind(this), this.testObject._delay);
  },

  'Supports all the event types': function(done)
  {
    var eventsList  = [['focus', 'focusin', 'DOMFocusIn'], ['[Function: selectOption]', 'input', 'change'], ['blur', 'focusout', 'DOMFocusOut']]
      , target      = common.createTargetElement.call(this)
      , option      = 'B'
      ;

    // increase timeout to accomodate async triggering
    this.timeout = Math.max(250, this.testObject._interactionDelay * (eventsList.length+1));

    // Don't go too deep
    this.stub(this.testObject, '_trigger');
    // return event type instead of full object
    this.stub(this.testObject, '_createEvent').returnsArg(0);

    // invoke test subject
    this.testObject.select(target, option, function()
    {
      // each event type triggered
      // callback ran within testObject context
      assert.calledWith(this._trigger, target, 'focus');
      assert.calledWith(this._trigger, target, 'focusin');
      assert.calledWith(this._trigger, target, 'DOMFocusIn');
      assert.calledWith(this._trigger, target, 'input');
      assert.calledWith(this._trigger, target, 'change');
      assert.calledWith(this._trigger, target, 'blur');
      assert.calledWith(this._trigger, target, 'focusout');
      assert.calledWith(this._trigger, target, 'DOMFocusOut');

      done();
    });
  }
});

var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  ;

buster.testCase('checkbox',
{
  setUp: common.setUp,

  'Invokes _triggerEvents with list of events': function(done)
  {
    var eventsList = ['touchstart', ['touchend', 'mouseover', 'mousedown', 'focus', 'focusin', 'DOMFocusIn', 'mouseup', '[Function: selectCheckbox]', 'change', 'click'], ['mouseout', 'blur', 'focusout', 'DOMFocusOut']]
      , target     = common.createTargetElement.call(this)
      , callback = this.spy()
      ;

    // stub _triggerEvents
    this.stub(this.testObject, '_triggerEvents');

    // invoke test object
    this.testObject.checkbox(target, callback);

    // get only the first element of the list
    assert.called(target.first);

    // events don't get triggered right away
    setTimeout(function()
    {
      refute.called(this.testObject._triggerEvents);
    }.bind(this), 0);

    // only after proper timeout
    setTimeout(function()
    {
      // triggerEvents for selectCheckbox method
      this.testObject._triggerEvents.getCall(0).args[1][1][7](target);

      // triggerEvents for callback method
      this.testObject._triggerEvents.getCall(0).args[3]();

      // Invoked _triggerEvents
      assert.calledWithMatch(this.testObject._triggerEvents, target, common.matchEventsList.bind(this, eventsList));

      setTimeout(function()
      {
        // assert target checked is correctly set
        assert.equals(target[0].checked, true);

        // callback been called
        assert.calledOnce(callback);

        done();

      }.bind(this), this.testObject._delay);
    }.bind(this), this.testObject._delay);
  },

  'Works with selectors beside jQuery object': function(done)
  {
    var eventsList = ['touchstart', ['touchend', 'mouseover', 'mousedown', 'focus', 'focusin', 'DOMFocusIn', 'mouseup', '[Function: selectCheckbox]', 'change', 'click'], ['mouseout', 'blur', 'focusout', 'DOMFocusOut']]
      , selector   = 'Me selector' + Math.random()
      , target     = common.createTargetElement.call(this)
      , callback = this.spy()
      ;

    // pretend to be jQuery
    this.testObject.$.withArgs(selector).returns(target);

    // just check if _triggerEvents being called
    this.stub(this.testObject, '_triggerEvents');

    // invoke test subject
    this.testObject.checkbox(selector, callback);

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

  'Supports all event types': function(done)
  {
    var eventsList = ['touchstart', ['touchend', 'mouseover', 'mousedown', 'focus', 'focusin', 'DOMFocusIn', 'mouseup', '[Function: selectCheckbox]', 'change', 'click'], ['mouseout', 'blur', 'focusout', 'DOMFocusOut']]
      , target     = common.createTargetElement.call(this)
      ;

    // increase timeout to accomodate async triggering
    this.timeout = Math.max(250, this.testObject._interactionDelay * (eventsList.length+1));

    // Don't go too deep
    this.stub(this.testObject, '_trigger');

    // return event type instead of full object
    this.stub(this.testObject, '_createEvent').returnsArg(0);

    // invoke test subject
    this.testObject.checkbox(target, function()
    {
      // each event type triggered
      // callback ran within testObject context
      assert.calledWith(this._trigger, target, 'touchstart');
      assert.calledWith(this._trigger, target, 'touchend');
      assert.calledWith(this._trigger, target, 'mouseover');
      assert.calledWith(this._trigger, target, 'mousedown');
      assert.calledWith(this._trigger, target, 'focus');
      assert.calledWith(this._trigger, target, 'focusin');
      assert.calledWith(this._trigger, target, 'DOMFocusIn');
      assert.calledWith(this._trigger, target, 'mouseup');
      assert.calledWith(this._trigger, target, 'change');
      assert.calledWith(this._trigger, target, 'click');
      assert.calledWith(this._trigger, target, 'mouseout');
      assert.calledWith(this._trigger, target, 'blur');
      assert.calledWith(this._trigger, target, 'focusout');
      assert.calledWith(this._trigger, target, 'DOMFocusOut');

      done();
    });
  }
});

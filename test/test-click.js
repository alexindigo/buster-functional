var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  ;

buster.testCase('click',
{
  // create new test object for each test
  setUp: common.setUp,

  'Invokes _triggerEvents with list of events': function(done)
  {
    var eventsList = [['mouseenter', 'mouseover', 'mousemove'], 'mousemove', ['mousedown', 'focus', 'focusin', 'DOMFocusIn'], ['mouseup', 'click']]
      , target     = common.createTargetElement.call(this)
      , callback   = this.spy()
      ;

    // just check if _triggerEvents being called
    this.stub(this.testObject, '_triggerEvents');

    // invoke test subject
    this.testObject.click(target, callback);

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
      // Invoked _triggerEvents
      assert.calledWith(this.testObject._triggerEvents, target, eventsList, target, callback);

      done();
    }.bind(this), this.testObject._delay);
  },

  'Works with selectors beside jQuery object': function(done)
  {
    var eventsList = [['mouseenter', 'mouseover', 'mousemove'], 'mousemove', ['mousedown', 'focus', 'focusin', 'DOMFocusIn'], ['mouseup', 'click']]
      , selector   = 'Me selector' + Math.random()
      , target     = common.createTargetElement.call(this)
      , callback   = this.spy()
      ;

    // pretend to be jQuery
    this.testObject.$.withArgs(selector).returns(target);

    // just check if _triggerEvents being called
    this.stub(this.testObject, '_triggerEvents');

    // invoke test subject
    this.testObject.click(selector, callback);

    // resolves target from selector
    assert.calledWith(this.testObject.$, selector);

    // gets only first element of the list
    assert.called(target.first);

    // only after proper timeout
    setTimeout(function()
    {
      // Invoked _triggerEvents with resolved target
      assert.calledWith(this.testObject._triggerEvents, target, eventsList, target, callback);

      done();
    }.bind(this), this.testObject._delay);
  },

  'Supports all the event types': function(done)
  {
    var eventsList = [['mouseenter', 'mouseover', 'mousemove'], 'mousemove', ['mousedown', 'focus', 'focusin', 'DOMFocusIn'], ['mouseup', 'click']]
      , target     = common.createTargetElement.call(this)
      ;

    // increase timeout to accomodate async triggering
    this.timeout = Math.max(250, this.testObject._interactionDelay * (eventsList.length+1));

    // Don't go too deep
    this.stub(this.testObject, '_trigger');
    // return event type instead of full object
    this.stub(this.testObject, '_createEvent').returnsArg(0);

    // invoke test subject
    this.testObject.click(target, function()
    {
      // each event type triggered
      // callback ran within testObject context
      assert.calledWith(this._trigger, target, 'mouseenter');
      assert.calledWith(this._trigger, target, 'mouseover');
      assert.calledWith(this._trigger, target, 'mousemove');
      assert.calledWith(this._trigger, target, 'mousedown');
      assert.calledWith(this._trigger, target, 'focus');
      assert.calledWith(this._trigger, target, 'focusin');
      assert.calledWith(this._trigger, target, 'DOMFocusIn');
      assert.calledWith(this._trigger, target, 'mouseup');
      assert.calledWith(this._trigger, target, 'click');

      done();
    });
  }
});

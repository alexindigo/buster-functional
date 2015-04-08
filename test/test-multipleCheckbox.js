var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('multiple checkbox',
  {
    setUp: common.setUp,

    'Invokes _triggerEvents with list of events': function(done)
    {
      var eventsList = ['touchstart', ['touchend', 'mouseover', 'mousedown', 'focus', 'focusin', 'DOMFocusIn', 'mouseup', '[Function: selectCheckbox]', 'change', 'click'], ['mouseout', 'blur', 'focusout', 'DOMFocusOut']]
        , targetOne = common.createTargetElement.call(this)
        , targetTwo = common.createTargetElement.call(this)
        , target = []
        , callback = this.spy()
        ;

      target.push(targetOne, targetTwo);
      // assert number of targets are two
      assert.equals(target.length, 2);

      // First iteration return target.first as targetOne
      target.first = this.stub().returns(targetOne);

      // stub _triggerEvents
      this.stub(this.testObject, '_triggerEvents');
      this.testObject.multipleCheckbox(target, callback);

      // events don't get triggered right away
      setTimeout(function()
      {
        refute.called(this.testObject._triggerEvents);
      }.bind(this), 0);

      // only after proper timeout
      setTimeout(function()
      {
        // First focus on the first checkbox target
        assert.calledWith(this.testObject._triggerEvents, target.first(), ['focus']);

        // select multiple checkbox callback is called
        this.testObject._triggerEvents.getCall(0).callArgOn(3, this.testObject);

        //execute custom checkbox method
        // target value updates to true
        this.testObject._triggerEvents.getCall(1).args[1][1][7](targetOne);

        // Invoked _triggerEvents
        assert.calledWithMatch(this.testObject._triggerEvents, target.first(), common.matchEventsList.bind(this, eventsList));

        // Second iteration return target.first as targetTwo
        target.first = this.stub().returns(targetTwo);

        // next multipleCheckbox recursive method is called
        this.testObject._triggerEvents.getCall(1).callArgOn(3, this.testObject);

        //execute custom checkbox method
        // target value updates to false
        this.testObject._triggerEvents.getCall(2).args[1][1][7](targetTwo);

        // Invoked _triggerEvents
        assert.calledWithMatch(this.testObject._triggerEvents, target.first(), common.matchEventsList.bind(this, eventsList));

        // Second iteration return target.first as targetTwo
        target.first = this.stub().returns([]);

        // next multipleCheckbox recursive method is called
        this.testObject._triggerEvents.getCall(2).callArgOn(3, this.testObject);

        // still called only four times
        assert.equals(this.testObject._triggerEvents.callCount, 3);

        setTimeout(function()
        {
          // assert target checked is correctly set
          assert.equals(targetOne[0].checked, true);
          assert.equals(targetTwo[0].checked, true);

          // callback been called
          assert.calledOnce(callback);
          done();
        }.bind(this), this.testObject._delay);
      }.bind(this), this.testObject._delay);
    },

    'Works with selectors beside jQuery object': function(done)
    {
      var selector   = 'Me selector' + Math.random()
        , target     = common.createTargetElement.call(this)
        , callback = this.spy()
        ;

      // pretend to be jQuery
      this.testObject.$.withArgs(selector).returns(target);

      // just check if _triggerEvents being called
      this.stub(this.testObject, '_triggerEvents');

      // invoke test subject
      this.testObject.multipleCheckbox(selector, callback);

      // resolves target from selector
      assert.calledWith(this.testObject.$, selector);

      // only after proper timeout
      setTimeout(function()
      {
        // Passed all the events to _triggerEvents
        assert.calledWith(this.testObject._triggerEvents, target.first(), ['focus']);

        done();
      }.bind(this), this.testObject._delay);
    },

    'Supports all event types': function(done)
    {
      var eventsList  = ['touchstart', ['touchend', 'mouseover', 'mousedown', 'focus', 'focusin', 'DOMFocusIn', 'mouseup', '[Function: selectCheckbox]', 'change', 'click'], ['mouseout', 'blur', 'focusout', 'DOMFocusOut']]
        , innerTarget = common.createTargetElement.call(this)
        , target = [innerTarget, []]
        ;

      // assert number of targets are two
      assert.equals(target.length, 2);

      target.first = this.stub();
      target.first.onSecondCall().returns(innerTarget);
      target.first.onThirdCall().returns([]);
      target.first.returns(innerTarget);

      // increase timeout to accomodate async triggering
      this.timeout = Math.max(250, this.testObject._interactionDelay * (eventsList.length+1) * target.length);

      // Don't go too deep
      this.stub(this.testObject, '_trigger');

      // return event type instead of full object
      this.stub(this.testObject, '_createEvent').returnsArg(0);

      // invoke test subject
      this.testObject.multipleCheckbox(target, function()
      {
        // each event type triggered
        // callback ran within testObject context
        assert.calledWith(this._trigger, innerTarget, 'touchstart');
        assert.calledWith(this._trigger, innerTarget, 'touchend');
        assert.calledWith(this._trigger, innerTarget, 'mouseover');
        assert.calledWith(this._trigger, innerTarget, 'mousedown');
        assert.calledWith(this._trigger, innerTarget, 'focus');
        assert.calledWith(this._trigger, innerTarget, 'focusin');
        assert.calledWith(this._trigger, innerTarget, 'DOMFocusIn');
        assert.calledWith(this._trigger, innerTarget, 'mouseup');
        assert.calledWith(this._trigger, innerTarget, 'change');
        assert.calledWith(this._trigger, innerTarget, 'click');
        assert.calledWith(this._trigger, innerTarget, 'mouseout');
        assert.calledWith(this._trigger, innerTarget, 'blur');
        assert.calledWith(this._trigger, innerTarget, 'focusout');
        assert.calledWith(this._trigger, innerTarget, 'DOMFocusOut');

        done();
      });
    }
  });
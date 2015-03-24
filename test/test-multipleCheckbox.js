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
        , target     = common.createTargetElement.call(this)
        , callback = this.spy()
        ;

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

        // Invoked _triggerEvents
        assert.calledWithMatch(this.testObject._triggerEvents, target, common.matchEventsList.bind(this, eventsList));

        //execute custom checkbox method
        // target value updates to true
        this.testObject._triggerEvents.getCall(1).args[1][1][7](target);

        // assert target callback
        assert.equals(target[0].checked, true);

        // next multipleCheckbox recursive method is called
        this.testObject._triggerEvents.getCall(1).callArgOn(3, this.testObject);

        // Invoked _triggerEvents
        assert.calledWithMatch(this.testObject._triggerEvents, target, common.matchEventsList.bind(this, eventsList));

        //execute custom checkbox method
        // target value updates to false
        this.testObject._triggerEvents.getCall(2).args[1][1][7](target);

        // assert target callback
        assert.equals(target[0].checked, false);

        // set target length to 0, to exit recursive call and execute callback
        target.length = 0;

        // next multipleCheckbox recursive method is called
        this.testObject._triggerEvents.getCall(2).callArgOn(3, this.testObject);

        // Invoked _triggerEvents
        assert.calledWithMatch(this.testObject._triggerEvents, target, common.matchEventsList.bind(this, eventsList));

        setTimeout(function()
        {
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
    }
  });
var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  ;

buster.testCase('_trigger',
{
  // create new test object for each test
  setUp: common.setUp,

  'Triggers provided event on the target': function()
  {
    var target = {trigger: this.spy()}
      , event  = {prop: Math.random()}
      , result
      ;

    // invoke test subject
    result = this.testObject._trigger(target, event);

    // triggers event on the target
    assert.calledWith(target.trigger, event);

    // it went all the way through
    assert.isTrue(result);
  },

  'Respects defaultPrevented flag': function()
  {
    var target = {trigger: this.spy()}
      , event  = {prop: Math.random(), defaultPrevented: true}
      , result
      ;

    // invoke test subject
    result = this.testObject._trigger(target, event);

    // triggers event on the target
    assert.calledWith(target.trigger, event);

    // Stops event propagation
    assert.isFalse(result);
  },

  'Respects isDefaultPrevented method': function()
  {
    var target = {trigger: this.spy()}
      , event  = {prop: Math.random(), isDefaultPrevented: this.stub()}
      , result
      ;

    // stop propagation
    event.isDefaultPrevented.returns(true);

    // invoke test subject
    result = this.testObject._trigger(target, event);

    // triggers event on the target
    assert.calledWith(target.trigger, event);

    // Stops event propagation
    assert.isFalse(result);
  },

  'Respects result from isDefaultPrevented method': function()
  {
    var target = {trigger: this.spy()}
      , event  = {prop: Math.random(), isDefaultPrevented: this.stub()}
      , result
      ;

    // isDefaultPrevented exists but returns false
    event.isDefaultPrevented.returns(false);

    // invoke test subject
    result = this.testObject._trigger(target, event);

    // triggers event on the target
    assert.calledWith(target.trigger, event);

    // Goes all the way
    assert.isTrue(result);
  },

  'Triggers event method on the target': function()
  {
    var target = {trigger: this.spy(), focus: this.stub()}
      , event  = {type: 'focus', prop: Math.random()}
      , expectedResult = Math.random()
      , result
      ;

    // isDefaultPrevented exists but returns false
    target.focus.returns(expectedResult);

    // invoke test subject
    result = this.testObject._trigger(target, event);

    // triggers event on the target
    assert.calledWith(target.trigger, event);

    // triggers event method on the target
    assert.called(target.focus);

    // result passed from the target's event method
    assert.equals(expectedResult, result);
  },

  'Triggers event handler method on the target': function()
  {
    var target = {trigger: this.spy(), onclick: this.stub()}
      , event  = {type: 'click', prop: Math.random()}
      , expectedResult = Math.random()
      , result
      ;

    // isDefaultPrevented exists but returns false
    target.onclick.returns(expectedResult);

    // invoke test subject
    result = this.testObject._trigger(target, event);

    // triggers event on the target
    assert.calledWith(target.trigger, event);

    // triggers event handler method on the target
    assert.called(target.onclick);

    // result passed from the target's event method
    assert.equals(expectedResult, result);
  },

  'Chooses event method over event handler method': function()
  {
    var target = {trigger: this.spy(), click: this.stub(), onclick: this.stub()}
      , event  = {type: 'click', prop: Math.random()}
      , expectedResult = Math.random()
      , result
      ;

    // isDefaultPrevented exists but returns false
    target.click.returns(expectedResult);
    target.onclick.returns(null);

    // invoke test subject
    result = this.testObject._trigger(target, event);

    // triggers event on the target
    assert.calledWith(target.trigger, event);

    // triggers event method on the target
    assert.called(target.click);
    // but not event handler method
    refute.called(target.onclick);

    // result passed from the target's event method
    assert.equals(expectedResult, result);
  }
});

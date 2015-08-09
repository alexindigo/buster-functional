var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  ;

buster.testCase('_once',
{
  // create new test object for each test
  setUp: common.setUp,

  'Executes passed function only once': function()
  {
    var oneTimer
      , oneTimerResult
      , result   = {me: Math.random()}
      , callback = this.stub().returns(result)
      ;

    // invoke test subject
    oneTimer = this.testObject._once(callback);

    // Not yet to call the original function
    refute.called(callback);

    // invoke oneTimer
    oneTimerResult = oneTimer();

    // check result
    assert.equals(oneTimerResult, result);

    // check original function
    assert.calledOnce(callback);

    // do it again
    oneTimerResult = oneTimer();

    // same result again
    assert.equals(oneTimerResult, result);

    // check original function
    assert.calledOnce(callback);
  },

  'Executes passed function within current context': function()
  {
    var oneTimer
      , context  = {id: Math.random()}
      , callback = this.stub()
      ;

    // invoke test subject
    oneTimer = this.testObject._once(callback);

    // execute one timer within context
    oneTimer.call(context);

    // check for the context
    assert.calledOn(callback, context);
  },

  'Passes arguments to the original function': function()
  {
    var oneTimer
      , arg1     = {id: Math.random()}
      , arg2     = {id: Math.random()}
      , callback = this.stub()
      ;

    // invoke test subject
    oneTimer = this.testObject._once(callback);

    // execute one timer within context
    oneTimer(arg1, arg2);

    // check for the context
    assert.calledWithExactly(callback, arg1, arg2);
  }
});

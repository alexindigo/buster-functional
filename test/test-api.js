var buster = require('buster')
  , common = require('./common')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('Framework',
{
  // create new test object for each test
  setUp: common.setUp,

  'All public methods return itself': function()
  {
    var method;

    for (method in this.testObject)
    {
      // get only methods that start with a letter, otherwise it's not a public method
      if (!method.match(/^[a-z]/) || !this.testObject.hasOwnProperty(method) || typeof this.testObject[method] != 'function')
      {
        continue;
      }

      refute.isNull(this.testObject[method].toString().match(/return this;[\s\S]*?\}$/));
    }
  }
});

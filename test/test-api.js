var buster = require('buster')
  , mixin  = require('../lib/test_case_mixin')
  , assert = buster.referee.assert
  , refute = buster.referee.refute
  , testObject
  ;

buster.testCase('Framework',
{
  // prepare for test
  setUp: function()
  {
    testObject = {};
    mixin(testObject);
  },

  'All public methods return itself': function()
  {
    var method;

    for (method in testObject)
    {
      // skip not own methods and "private" ones
      if (method[0] == '_' || !testObject.hasOwnProperty(method) || typeof testObject[method] != 'function')
      {
        continue;
      }

      refute.isNull(testObject[method].toString().match(/return this;[\s\S]*?\}$/));
    }
  }
});

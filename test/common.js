// common helpers
var buster = require('buster')
  , mixin = require('../lib/functional_mixin')
  ;

var inlineValues =
{
  busterContextPath: '/example/context/path/'
};

var common =
{
  // exposing object stubs for testing purposes
  _jQuery: {me: 'JQuery list of selected elements'},
  _jQuery_Event: {me: 'jQuery Event object'},
  _jQuery_extend: {me: 'Extended object'},

  // exposing stub data as well
  _returns_offset: {left: 50, top: 80},
  _returns_width: 120,
  _returns_height: 60,

  // pre calculate values

  // center point of an element
  _targetX: function() { return common._returns_offset.left + (common._returns_width/2); },
  _targetY: function() { return common._returns_offset.top + (common._returns_height/2); },

  // example uri path
  iframeUriPath: '/example/page',

  // example buster_contextPath
  busterContextPath: inlineValues.busterContextPath,

  // cookies
  cookieExpired: 'buster_contextPath=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT',
  cookieContextPath: 'buster_contextPath='+inlineValues.busterContextPath+';path=/',

  // generic setup for all the tests
  setUp: function()
  {
    // reset assertion counter
    buster.referee.count = 0;

    // init test object
    common.createTestObject.call(this);
  },

  createStubBuster: function()
  {
    this.stubBuster = {testRunner: {}};

    this.stubBuster.testRunner.onCreate = this.stub();
  },

  // expected to called within test context
  createTestObject: function()
  {
    this.testObject = {testCase: {}};

    // apply mixin
    mixin(this.testObject);

    // get reference to the testCase
    this.testObject = this.testObject.testCase;

    this.testObject.$ = this.stub().returns(common._jQuery);
    this.testObject.$.Event = this.stub().returns(common._jQuery_Event);
    this.testObject.$.extend = this.stub().returns(common._jQuery_extend);
  },

  // expected to called within test context
  createTargetElement: function()
  {
    var target = [{value: '', checked: false, selectedIndex: 0, options: [{value: 'a', text: 'A'}, {value: 'b', text: 'B'}, {value: 'c', text: 'C'}]}];

    target.offset = this.stub().returns(common._returns_offset);
    target.width  = this.stub().returns(common._returns_width);
    target.height = this.stub().returns(common._returns_height);

    target.trigger = this.stub();

    // event methods
    target.blur  = this.stub();
    target.focus = this.stub();

    target.first = this.stub().returns(target);

    return target;
  },

  // --- custom (sinon) matchers

  // compares passed events list with expected set
  // uses '[Function: functionName]' to indicate custom event function
  matchEventsList: function(expected, value)
  {
    var i;

    for (i=0; i<expected.length; i++)
    {
      // string (including magic string)
      if (typeof expected[i] == 'string')
      {
        if (expected[i].match(/^\[Function\: /))
        {
          // unsuccessfully expected function
          if (typeof value[i] != 'function' || expected[i] != '[Function: '+value[i].name+']') return false;
        }
        else
        {
          // expected event name doesn't match
          if (expected[i] !== value[i]) return false;
        }
      }
      // or object (sub array)
      else
      {
        // same but sub array
        if (!common.matchEventsList(expected[i], value[i])) return false;
      }
    }

    // everything is fine
    return true;
  },

  // --- common pieces of the event object composition

  blankTouchEvent: function(type)
  {
    return {
      type: type,
      pageX: 0,
      pageY: 0,
      which: 0,
      touches: []
    };
  },

  blankTouchCoords: function()
  {
    return {
      touches:
      [
        {
          clientX: common._targetX(),
          clientY: common._targetY(),
          pageX: common._targetX(),
          pageY: common._targetY()
        }
      ]
    };
  },

  blankMouseEvent: function(type)
  {
    return {
      type: type,
      clientX: common._targetX(),
      clientY: common._targetY(),
      pageX: common._targetX(),
      pageY: common._targetY(),
      x: common._targetX(),
      y: common._targetY(),
      movementX: 0,
      movementY: 0,
      which: 1
    };
  },

  // creates key object to be used for event object creation tests
  blankKeyEvent: function(type, char)
  {
    var charCode = (type == 'keypress' ? char.charCodeAt(0) : 0)
      , key      = char.toUpperCase()
      , keyCode  = key.charCodeAt(0)
      ;

    return {
      altKey: false,
      charCode: charCode,
      ctrlKey: false,
      keyCode: keyCode,
      metaKey: false,
      originalEvent:
      {
        altKey: false,
        charCode: charCode,
        ctrlKey: false,
        keyCode: keyCode,
        keyIdentifier: 'U+00'+keyCode.toString(16),
        metaKey: false,
        shiftKey: false,
        type: type,
        which: charCode || keyCode
      },
      type: type,
      which: charCode || keyCode
    };
  }

};

module.exports = common;

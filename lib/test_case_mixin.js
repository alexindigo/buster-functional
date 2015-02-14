/**
 * Mixin for Buster's testCase object.
 * Accepts testCase object and augments it
 * with functional testing helpers
 */

function busterFunctionalMixin(testCase, options)
{
  // no function
  function noop(){};

  // options are optional :)
  options = options || {};

  // Increase default timeout for the web
  // 60 seconds should be enough
  testCase.timeout = options.timeout || 60000;

  // Delay all the callbacks by specified amount
  // mostly used for visualization
  testCase.delay = options.delay || 50;

  // Cooldown period, default pausng time for
  // reccurent waiting procedures
  testCase._cooldownPeriod = options.cooldown_period || 100;

  // Interaction delay is a separate thing
  // to keep distance in time between "sub" events
  // like typing (keydown, keyup) and touchng (touchstart, touchend)
  testCase._interactionDelay = options.interaction_delay || 100;

  // Default enhance handler is empty function
  // could be overwritten via .enhance method
  // accepts window object of the iframe being tested
  testCase._enhanceHandler = noop;

  // transitionEnd multiname, allow to adjust
  testCase._transitionEndEvents = 'transitionend webkitTransitionEnd transitionEnd';

  // Cleans up after page tests
  testCase.unload = function busterFunctionalMixin_unload(callback)
  {
    // clean up leftovers
    document.cookie = 'buster_contextPath=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.body.removeChild(this.iframe);

    this._delayedCallback(callback);

    return this;
  };

  // Loads page via buster-proxy
  testCase.load = function busterFunctionalMixin_load(uriPath, callback)
  {
    // set contextPath cookie
    // TODO: Workaround for buster-proxy,
    // should be gone when buster-proxy allows unprefixed requests
    document.cookie = 'buster_contextPath='+buster.env.contextPath+';path=/';

    this._loadInIframe.call(this, uriPath, function(iframe, $, window, document)
    {
      this._waitForApp(window, function(App)
      {
        // Add shortcuts to most used objects
        this.iframe   = iframe;
        this.$        = $;
        this.window   = window;
        this.document = document;
        this.App      = App;

        // done here
        this._delayedCallback(callback);
      });

    }.bind(this));

    return this;
  };

  // Enhances in-iframe window object, for custom per test/suite cases
  // Stores handler function until in-iframe window object is available
  testCase.enhance = function busterFunctionalMixin_enhance(handler)
  {
    this._enhanceHandler = handler;
    return this;
  };

  // -- Private methods

  // Delayes callback function
  testCase._delayedCallback = function functional_mixin__delayedCallback(callback, delay)
  {
    if (typeof callback != 'function') return this;

    setTimeout(callback.bind(this), delay || this.delay);
    return this;
  };

  // Triggers series of events
  // accepts target (as jquery object)
  // and list of events (grouped for single tick execution)
  // followed by final callback function
  // Extra parameteres will passed to the specific events
  // but callback is always last one
  testCase._triggerEvents = function busterFunctionalMixin__triggerEvents(target, events, callback)
  {
    var i, extras, event, eventObject;

    // rest are the extras
    extras = Array.prototype.slice.call(arguments, 2, -1);
    // callback is the last one
    callback = arguments[arguments.length-1];

    // get first event name and built proper event object out of it
    event = events.shift();

    // eventName could be a string or group of events triggered within same tick
    event = typeof event == 'string' ? [event] : event;

    // loop through event group and trigger them
    for (i=0; i<event.length; i++)
    {
      switch(event) {
        case 'focus':
          this.focus(target);
          break;
        case 'blur':
          this.blur(target);
          break;
        default:
          // detect key- events from touch- events
          // TODO: Add support for mouse- events
          eventObject = this[event[i].match(/^key/) ? '_createTypeEvent' : '_createTouchEvent'].apply(this, [event[i]].concat(extras));
          // trigger event on target
          target.trigger(eventObject);
          break;
      }

      // respect .preventDefault() calls
      if (eventObject.defaultPrevented || (typeof eventObject.isDefaultPrevented == 'function' && eventObject.isDefaultPrevented()))
      {
        // terminate here
        this._delayedCallback(callback);
        return;
      }

      // TODO: Make it more generic
      // and support custom after-events
      // but for now just add chars after key press
      if (event[i] == 'keypress')
      {
        // for triggerings key events, first extra is char
        target[0].value = target[0].value + extras[0];
      }
    }

    // finished with the current tick,
    // come back later and trigger rest of the events
    // or if no events left proceed with callback
    if (events.length)
    {
      setTimeout(this._triggerEvents.bind.apply(this._triggerEvents, [this].concat([target], [events], extras, callback)), this._interactionDelay);
      return;
    }

    // nothing left, proceed with callback
    this._delayedCallback(callback);
  };

  // Triggers provided event object on the target element
  // For now just simple abstraction
  testCase._trigger = function busterFunctionalMixin__trigger(target, event)
  {
    target.trigger(event);
    return this;
  };

  // Creates event object, chooses the right event specific factory for the event type
  testCase._createEvent = function busterFunctionalMixin__createEvent(type, extra)
  {
    return this;
  };

  // Creates touch event like real boyz (browsers) do
  testCase._createTouchEvent = function busterFunctionalMixin__createTouchEvent(type, target)
  {
    var eventData  = {}
      , targetX    = target.offset().left + (target.width()/2)
      , targetY    = target.offset().top + (target.height()/2)
      , touchEvent =
        {
          type: type,
          pageX: 0,
          pageY: 0,
          which: 0,
          touches: []
        }
        // event specific data
      , touchStart =
        {
          touches:
          [
            {clientX: targetX, clientY: targetY, pageX: targetX, pageY: targetY}
          ]
        }
      ;

    // untangle result event object
    eventData = this.$.extend(true, {}, touchEvent, type == 'touchstart' ? touchStart : {});

    return this.$.Event(type, eventData);
  };

  // Creates mouse event like real boyz (browsers) do
  testCase._createMouseEvent = function busterFunctionalMixin__createMouseEvent(type, target)
  {
    var eventData
      , targetX    = target.offset().left + (target.width()/2)
      , targetY    = target.offset().top + (target.height()/2)
      , mouseEvent =
        {
          type: type,
          clientX: targetX,
          clientY: targetY,
          pageX: targetX,
          pageY: targetY,
          x: targetX,
          y: targetY,
          movementX: 0,
          movementY: 0,
          which: 1
        }
      ;

    // untangle result event object
    eventData = this.$.extend(true, {}, mouseEvent);

    return this.$.Event(type, eventData);
  };

  // Creates type event to mimic real user behavior
  // TODO: Support modifiers
  testCase._createTypeEvent = function busterFunctionalMixin__createTypeEvent(type, char)
  {
    // key codes are always uppercase
    var charCode = (type == 'keypress' ? char.charCodeAt(0) : 0)
      , key      = char.toUpperCase()
      , keyCode  = key.charCodeAt(0)
      , keyEvent =
        {
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

    return this.$.Event(type, keyEvent);
  };

  // Creates new iframe and makes it fill in all available space
  testCase._createIframe = function busterFunctionalMixin__createIframe(src)
  {
    var iframe = document.createElement('iframe');

    iframe.src            = src;
    // make it nice
    iframe.width          = '100%';
    iframe.height         = '100%';
    iframe.vspace         = '0';
    iframe.hspace         = '0';
    iframe.scrolling      = 'yes';
    iframe.marginWidth    = '0';
    iframe.marginHeight   = '0';
    iframe.frameBorder    = '0';
    // make it even better
    iframe.style.border   = '0';
    iframe.style.width    = '100%';
    iframe.style.height   = '100%';
    iframe.style.top      = '0px';
    iframe.style.left     = '0px';
    iframe.style.position = 'fixed';

    return iframe;
  };

  // Loads requested page in new iframe
  // and attaches it to the body
  testCase._loadInIframe = function busterFunctionalMixin__loadInIframe(src, callback)
  {
    var iwin, idoc, iframe = this._createIframe(src);

    // wait for it to load
    iframe.onload = function()
    {
      // get reference to iframe internals
      iwin = iframe.contentWindow;
      idoc = iframe.contentDocument || iframe.contentWindow.document;

      // get jQuery reference
      i$ = iwin.$;

      // adjust window object with custom handler
      this._enhanceHandler.call(this, iwin);

      // return gathered data
      callback(iframe, i$, iwin, idoc);
    }.bind(this);

    document.body.appendChild(iframe);
  };
}

// allow to use it with CommonJS environment (for testing)
if (typeof module == 'object' && module.exports)
{
  module.exports = busterFunctionalMixin;
}

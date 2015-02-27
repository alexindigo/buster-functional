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

    // make sure loading loop is completely done
    this._loadInIframe.call(this, uriPath, this._delayedCallback.bind(this, callback));

    return this;
  };

  // Enhances in-iframe window object, for custom per test/suite cases
  // Stores handler function until in-iframe window object is available
  testCase.enhance = function busterFunctionalMixin_enhance(handler)
  {
    this._enhanceHandler = handler;
    return this;
  };

  // Waits for the events triggered on the root object
  testCase.wait = function busterFunctionalMixin_wait(eventName, callback)
  {
    // if eventRoot is not set, wait for it
    if (this._eventRoot)
    {
      // allow for both jQuery and Backbone
      this._eventRoot[this._eventRoot.one ? 'one' : 'once'](eventName, this._delayedCallback.bind(this, callback));
      return this;
    }

    // no luck, we'll wait
    setTimeout(this.wait.bind(this, eventName, callback), this._cooldownPeriod);

    return this;
  };

  // Waits for target element to finish css transition
  testCase.waitForTransition = function busterFunctionalMixin_waitForTransition(target, callback)
  {
    target = typeof target == 'string' ? this.$(target) : target;

    // make it "double" async to prevent competing with app's event handlers
    target.one(this._transitionEndEvents, this._delayedCallback.bind(this, callback));

    return this;
  };

  // Waits for target element to contain specified text
  testCase.waitForText = function busterFunctionalMixin_waitForText(selector, text, callback)
  {
    var targetText
        // css selector is most useful way to check for elements in the future
        // in some case it should works with resolved jQuery objects too
      , target = typeof selector == 'string' ? this.$(selector) : selector
      ;

    // check if target element contains text
    // if not, wait a bit and check again, until end of times
    if ((targetText = target.text()) && targetText.indexOf(text) != -1)
    {
      // and it's async
      this._delayedCallback(callback);
      return this;
    }

    // no luck, we'll wait
    setTimeout(this.waitForText.bind(this, selector, text, callback), this._cooldownPeriod);

    return this;
  };

  // Waits for target element to be on the page
  testCase.waitForElement = function busterFunctionalMixin_waitForElement(selector, callback)
  {
    // check if target element exists
    if (this.$(selector).length)
    {
      // and it's async
      this._delayedCallback(callback);
      return this;
    }

    // no luck, try later
    setTimeout(this.waitForElement.bind(this, selector, callback), this._cooldownPeriod);

    return this;
  };

  // Waits for varibable to be defined
  testCase.waitForVar = function busterFunctionalMixin_waitForVar(variable, callback)
  {
    // check if target element exists
    if (variable in this.window)
    {
      // and it's async
      this._delayedCallback(callback);
      return this;
    }

    // no luck, try later
    setTimeout(this.waitForVar.bind(this, variable, callback), this._cooldownPeriod);

    return this;
  };

  // -- Not public methods

  // Sets event root object
  testCase._setEventRoot = function functional_mixin__setEventRoot(root)
  {
    this._eventRoot = root;
    return this;
  };

  // Executes passed function only once
  testCase._once = function functional_mixin__once(fn)
  {
    var oneTimer = function()
    {
      if (oneTimer.called) return oneTimer.result;
      oneTimer.called = true;
      return oneTimer.result = fn.apply(this, arguments);
    };

    oneTimer.called = false;

    return oneTimer;
  };

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
    var i
      , extras
      , event
      , customResult
      , eventObject = {}
      ;

    // rest are the extras
    extras = Array.prototype.slice.call(arguments, 2, -1);
    // callback is the last one
    callback = arguments[arguments.length-1];

    // get first event name and built proper event object out of it
    event = events.shift();

    // eventName could be a string or group of events triggered within same tick
    event = typeof event == 'object' ? event : [event];

    // loop through event group and trigger them
    for (i=0; i<event.length; i++)
    {
      // invoke custom functions if passed
      if (typeof event[i] == 'function')
      {
        // call it with current target and extra parameters
        customResult = event[i].apply(this, [target].concat(extras));
      }
      else
      {
        // create event (object) based on the event type
        eventObject = this._createEvent.apply(this, [event[i]].concat(extras));
        // and trigger event on target
        target.trigger(eventObject);
      }

      // respect .preventDefault() calls or if custom event function return false
      if (customResult === false || eventObject.defaultPrevented || (typeof eventObject.isDefaultPrevented == 'function' && eventObject.isDefaultPrevented()))
      {
        // terminate here
        this._delayedCallback(callback);
        return;
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
    var handler;

    // call specific method to create an event
    switch((type.match(/^(?:key|touch|mouse|click|focus|blur)/) || [])[0])
    {
      case 'focus':
      case 'blur':
        handler = '_createFocusOrBlurEvent';
        break;

      case 'touch':
        handler = '_createTouchEvent';
        break;

      case 'click':
      case 'mouse':
        handler = '_createMouseEvent';
        break;

      case 'key':
        handler = '_createKeyEvent';
        break;

      default:
        throw new Error('Unsupported event type: ' + type);
    }

    return this[handler].apply(this, arguments);
  };

  // Creates focus or blur event
  // Looks unusual, but there is thing when you need to call it twice
  // to make it work, not sure why is that, but all the tests showed
  // that this is the way to do it
  // Probably related to this bug http://bugs.jquery.com/ticket/6705
  testCase._createFocusOrBlurEvent = function busterFunctionalMixin__createFocusOrBlurEvent(type, target)
  {
    // trigger it here once and allow normal process to finish the job
    target[type]();

    return type;
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

  // Creates key event to mimic real user behavior
  // TODO: Support modifiers
  testCase._createKeyEvent = function busterFunctionalMixin__createKeyEvent(type, char)
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

    // add it to the document
    document.body.appendChild(iframe);

    return iframe;
  };

  // Loads requested page in new iframe
  // and attaches it to the body
  testCase._loadInIframe = function busterFunctionalMixin__loadInIframe(src, callback)
  {
    // allow callback to be executed only once
    callback = this._once(callback);

    // create new iframe if one doesn't exists
    if (!this.iframe)
    {
      this.iframe = this._createIframe(src);
    }
    // or reuse existing one
    else
    {
      this.iframe.src = src;
    }

    // wait for it to load
    this.iframe.onload = function()
    {
      // Add shortcuts to most used objects
      this.window   = this.iframe.contentWindow;
      this.document = this.iframe.contentDocument || this.iframe.contentWindow.document;
      this.$        = this.window.$;

      this._setEventRoot($(this.document));

      // adjust window object with custom handler
      this._enhanceHandler.call(this, this.window);

      // return gathered data
      callback.call(this);
    }.bind(this);
  };
}

// allow to use it with CommonJS environment (for testing)
if (typeof module == 'object' && module.exports)
{
  module.exports = busterFunctionalMixin;
}

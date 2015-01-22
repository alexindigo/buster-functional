// Expects Buster to be on the page

// Don't pollute global namespace
(function(buster, options)
{
  // no function
  function noop(){};

  // Creates new iframe and makes it fill in all available space
  function createIframe(src)
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
  }

  // Loads requested page in new iframe
  // and attaches it to the body
  function loadInIframe(src, callback)
  {
    var iwin, idoc, iframe = createIframe(src);

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
  }

  // Hook into testRunner
  buster.testRunner.onCreate(function(runner)
  {
    // hide frames, to all for the full page experience
    runner.on('suite:start', function()
    {
      window.top.document.getElementsByTagName('frameset')[0].rows='0,*';
    });
    runner.on('suite:end', function(results)
    {
      // last resort to clean up cookies
      document.cookie = 'buster_contextPath=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.top.document.getElementsByTagName('frameset')[0].rows='80px,*';
    });

    runner.on('context:end', function(results)
    {
      // clean up any leftovers
      document.cookie = 'buster_contextPath=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });

    // add functional test helpers to the mix
    runner.on('test:setUp', function(test)
    {
      // Increase default timeout for the web
      // 60 seconds should be enough
      test.testCase.timeout = options.timeout || 60000;

      // Delay all the callbacks by specified amount
      // mostly used for visualization
      test.testCase.delay = options.delay || 100;

      // Cooldown period, default pausng time for
      // reccurent waiting procedures
      test.testCase._cooldownPeriod = options.cooldown_period || 100;

      // Interaction delay is a separate thing
      // to keep distance in time between "sub" events
      // like typing (keydown, keyup) and touchng (touchstart, touchend)
      test.testCase._interactionDelay = options.interaction_delay || 100;

      // Default enhance handler is empty function
      // could be overwritten via .enhance method
      // accepts window object of the iframe being tested
      test.testCase._enhanceHandler = noop;

      // transitionEnd multiname, allow to adjust
      test.testCase._transitionEndEvents = 'transitionend webkitTransitionEnd transitionEnd';

      // Cleans up after page tests
      test.testCase.unload = function functional_mixin_unload(callback)
      {
        // clean up leftovers
        document.cookie = 'buster_contextPath=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.body.removeChild(this.iframe);

        this._delayedCallback(callback);

        return this;
      };

      // Loads page via buster-proxy
      test.testCase.load = function functional_mixin_load(uriPath, callback)
      {
        // set contextPath cookie
        // TODO: Workaround for buster-proxy,
        // should be gone when buster-proxy allows unprefixed requests
        document.cookie = 'buster_contextPath='+buster.env.contextPath+';path=/';

        loadInIframe.call(this, uriPath, function(iframe, $, window, document)
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
      test.testCase.enhance = function functional_mixin_enhance(handler)
      {
        this._enhanceHandler = handler;
        return this;
      }

      // Waits for the provided events triggered on the App object
      test.testCase.wait = function functional_mixin_wait(eventName, callback)
      {
        var delay;

        // if no event provided, just make it async
        if (typeof eventName == 'function')
        {
          // second argument could be delay number
          delay = typeof callback == 'number' ? callback : null;
          callback = eventName;
          this._delayedCallback(callback, delay);
        }
        else
        {
          // when App is ready for it's events
          this._whenAppReady(function()
          {
            // make "double" async to prevent competing with app's event handlers
            this.App.once(eventName, this._delayedCallback.bind(this, callback));
          });
        }

        return this;
      };

      // Triggers touch on the element
      test.testCase.touch = function functional_mixin_touch(target, callback)
      {
        // get first element of the selection
        target = (typeof target == 'string' ? this.$(target) : target).first();

        // make it all async, to allow some time for event handlers to hook in
        // and keep them in more reabable flow in the test
        setTimeout(function()
        {
          // first touchstart
          target.trigger(this._createTouchEvent('touchstart', target));
          setTimeout(function()
          {
            // then touchend after reasonable amout of time
            target.trigger(this._createTouchEvent('touchend', target));

            // and emulate desktop browser events
            // because mobile browsers do
            setTimeout(function()
            {
              target.trigger(this._createTouchEvent('mousedown', target));
              target.trigger(this._createTouchEvent('mouseup', target));
              target.trigger(this._createTouchEvent('mouseclick', target));

              // allow all the app handlers to do their job
              setTimeout(this._delayedCallback.bind(this, callback), this._interactionDelay);

            }.bind(this), this._interactionDelay);

          }.bind(this), this._interactionDelay);
        }.bind(this), this.delay);

        return this;
      };

      // Types into input field
      test.testCase.type = function functional_mixin_type(target, text, callback)
      {
        var chars  = (text || '').split('');

        // get first element of the selection
        target = (typeof target == 'string' ? this.$(target) : target).first();

        // enters chars one by one
        function enterChar()
        {
          var char = chars.shift();

          // still have something to type
          if (char)
          {
            // follow standard event sequence
            target.trigger(this._createTypeEvent('keydown', char));

            // after keydown follows keypress
            target.trigger(this._createTypeEvent('keypress', char));

            // update target
            target[0].value = target[0].value + char;

            // after keypress follows keyup
            setTimeout(function()
            {
              target.trigger(this._createTypeEvent('keyup', char));

              // after keyup proceed to the next char
              setTimeout(enterChar.bind(this), this._interactionDelay);

            }.bind(this), this._interactionDelay);
          }
          else
          {
            // be done after that
            setTimeout(this._delayedCallback.bind(this, callback), this._interactionDelay);
          }
        };

        // make it all async, to allow some time for event handlers to hook in
        // and keep them in more reabable flow in the test
        setTimeout(function()
        {
          // start with focus event
          this.focus(target);

          setTimeout(enterChar.bind(this), this._interactionDelay);
        }.bind(this), this.delay);

        return this;
      }

      // Waits for target element to finish css transition
      test.testCase.waitForCss = function functional_mixin_waitForCss(target, callback)
      {
        target = typeof target == 'string' ? this.$(target) : target;

        // make "double" async to prevent competing with app's event handlers
        target.one(this._transitionEndEvents, this._delayedCallback.bind(this, callback));

        return this;
      }

      // Waits for target element to contain specified text
      test.testCase.waitForText = function functional_mixin_waitForText(selector, text, callback)
      {
        var targetText
            // css selector is mot useful way to check for elements in teh future
            // but it work with resolved jQuery objects too
          , target = typeof selector == 'string' ? this.$(selector) : selector
          ;

        // check if target element contains text
        // if not, wait a bit and check again
        // until end of times
        if ((targetText = target.text()) && targetText.indexOf(text) != -1)
        {
          // and it's async
          this._delayedCallback(callback.call(this));
          return this;
        }

        // no luck, we'll wait
        setTimeout(this.waitForText.bind(this, selector, text, callback), this._cooldownPeriod);

        return this;
      }

      // [sync] Triggers focus on the element
      test.testCase.focus = function functional_mixin_focus(target)
      {
        // accept selector or resolved jquery object
        target = typeof target == 'string' ? this.$(target) : target;

        // WTF? Probably related to this bug
        // http://bugs.jquery.com/ticket/6705
        target.focus().trigger('focus');

        return this;
      };

      // [sync] Triggers blur on the element
      test.testCase.blur = function functional_mixin_blur(target)
      {
        // accept selector or resolved jquery object
        target = typeof target == 'string' ? this.$(target) : target;

        // after all chars entered trigger change
        // TODO: Need to check if value has actually changed
        target.trigger('change');

        // trigger blur after change
        // WTF? Probably related to this bug
        // http://bugs.jquery.com/ticket/6705
        target.blur().trigger('blur');

        return this;
      };

      // --- Not public methods

      // Creates touch event like real boyz (browsers) do
      test.testCase._createTouchEvent = function functional_mixin__createTypeEvent(type, target)
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
            // event specific data
          , touchStart =
            {
              touches:
              [
                {clientX: targetX, clientY: targetY, pageX: targetX, pageY: targetY}
              ]
            }
          ;

        // different event bases for touch and mouse events
        if (type.match(/^touch/))
        {
          eventData[type] = this.$.extend(true, {}, touchEvent, type == 'touchstart' ? touchStart : {});
        }
        else
        {
          eventData[type] = this.$.extend(true, {}, mouseEvent);
        }

        return this.$.Event(type, eventData[type]);
      };


      // Creates type event to mimic real user behavior
      // TODO: Support modifiers
      test.testCase._createTypeEvent = function functional_mixin__createTypeEvent(type, char)
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
      }

      // Delayes callback function
      test.testCase._delayedCallback = function functional_mixin__delayedCallback(callback, delay)
      {
        if (typeof callback != 'function') return this;

        setTimeout(callback.bind(this), delay || this.delay);
        return this;
      };

      // Queues stuff before App is ready
      test.testCase._whenAppReady = function functional_mixin__whenAppReady(callback)
      {
        if (this.App)
        {
          (callback || noop).call(this);
          return this;
        }

        // add to queue + create queue if it doesn't exists
        (this._queue || (this._queue = [])).push(callback);
        return this;
      };

      // Processes queued callbacks
      test.testCase._processQueue = function functional_mixin__processQueue()
      {
        var cb;

        while (cb = (this._queue || []).shift())
        {
          cb.call(this);
        }

        return this;
      };

      // wait till app is here
      test.testCase._waitForApp = function functional_mixin__waitForApp(root, callback)
      {
        // if no App try later
        if (!root.App)
        {
          // no need another timeout here
          // since test suite will take care of it
          setTimeout(this._waitForApp.bind(this, root, callback), this._cooldownPeriod);
          return this;
        }

        // App is ready
        this._delayedCallback(callback.call(this, root.App));

        // done with the callback, process the queue
        this._processQueue();

        return this;
      };

    });
  });
})(buster);

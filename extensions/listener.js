/**
 *  listener -> Helper
 *
 *  Listens for events being triggered and allows them to be triggered. This is
 *  the primary way of modules talking to one another.
 **/
app.addHelper('listener', function (app) {

    'use strict';

    var $a = app.getHelper('array'),
        $c = app.getHelper('class'),

        events = {},

        Context = $c.create($a.Context, {

            execute: function () {

                var handler = this.handler;

                if (handler && typeof handler.handler === 'function') {
                    handler.handler.apply(handler.context, this.args);
                }

            }

        });

    // Accesses events for all listeners.
    //function getEvents() {
    //    return app.access('events') || {};
    //}

    // Sets the events for all listeners.
    //function setEvents(events) {
    //    app.store('events', events);
    //}

    return {

        /**
         *  listener.listen(event, handler[, context])
         *  - event (String): Name of the event.
         *  - handler (Function): Handler to execute when the event fires.
         *  - context (Object): Context for the handler.
         *
         *  Binds a `handler` to listen for the given `event`.
         *
         *      listener.listen('event-name', function (info) {
         *          console.log(this);
         *      }, this);
         *
         *  When executing, the handler is passed an `info` argument. The
         *  argument is an object with a `name` property containing the name of
         *  the event and any data passed to the event in a `data` property.
         **/
        listen: function (event, handler, context) {

            var evt = events[event];

            if (!evt) {
                evt = events[event] = [];
            }

            evt.push({
                context: context,
                handler: handler
            });

            setEvents(events);

        },

        /**
         *  listener.unlisten(event, handler)
         *  - event (String): Name of the event.
         *  - handler (Function): Handler to remove.
         *
         *  Removes the given `handler` from the event. When the event fires,
         *  the `handler` will no longer execute.
         **/
        unlisten: function (event, handler) {

            var evt = events[event] || [],
                i   = 0,
                il  = evt.length;

            while (i < il) {

                if (evt[i].handler === handler) {
                    evt.splice(i, 1);
                }

                i += 1;

            }

            setEvents(events);

        },

        /**
         *  listener.notify(event[, data])
         *  - event (String): Event to trigger.
         *  - data (Object): Optional data to pass to bound handlers.
         *
         *  Triggers the event. The handlers bound to the event may be passed
         *  additional data.
         **/
        notify: function (event, data) {

            var arg     = {name: event},
                context = new Context(
                    events[event] || [],
                    null,
                    data ? $o.extend(arg, {data: data}) : arg
                );

            context.run();
            context.free();

        }
        /*notify: function (event, data) {

            var events = getEvents(),
                evt    = events[event] || [],
                arg    = {name: event};

            if (data) {
                arg.data = data;
            }

            evt.forEach(function (evt) {
                evt.handler.call(evt.context, arg);
            });

        }*/

    };

});
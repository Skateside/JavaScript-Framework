/* Basic form */

var eventList = {};

function getEvent(name) {

    if (!eventList[name]) {
        eventList[name] = [];
    }

    return eventList[name];

}

function getEventIndex(name, handler) {
    return getEvent(name).indexOf(handler);
}

function subscribe(name, handler) {

    if (getEventIndex(name, handler) < 0) {
        getEvent(name).push(handler);
    }

}

function unsubscribe(name, handler) {

    var index = getEventIndex(name, handler);

    if (index > -1) {
        getEvent(name).splice(index, 1);
    }

}

function trigger(name, data) {

    getEvent(name).forEach(function (handler) {
        handler(data);
    });

}

/* Advanced form */

function triggerError(message, type) {

    var types = {
        '*': Error,
        'range': RangeError,
        'reference': ReferenceError,
        'type': TypeError
    };

    var lowerType = typeof type === 'string'
        ? type.toLowerCase()
        : '*';
    var Constructor = types[lowerType] || types['*'];

    throw new Constructor(message);

}

util.Object.looksLike = function (object, description) {

    'use strict';

    var matches = !!object;

    if (object) {

        Object.keys(description).some(function (name) {

            if (typeof object[name] !== description[name]) {
                matches = false;
            }

            return matches === false;

        });

    }

    return matches;

};

function makeEventList() {

    'use strict';

    var list = {};
    var events = [];

    function each(func) {

        events.some(function (event, i) {
            return func(event, i) !== false;
        });

    }

    function getIndex(handler) {

        var index = -1;

        each(function (event, i) {

            if (event.handler === handler) {
                index = i;
            }

            return index === -1;

        });

        return index;

    }

    function add(hander, context) {

        if (getIndex(handler) < 0) {

            events.push({
                handler,
                context
            });

        }

        return list;

    }

    function remove(handler) {

        var index = getIndex(handler);
        var exists = index > -1;

        if (exists) {
            events.splice(index, 1);
        }

        return exists;

    }

    Object.assign(list, {
        add,
        remove,
        each
    });

    return Object.freeze(list);

}

function makeEventManager() {

    'use strict';

    var manager = {};
    var list = {};

    function get(name) {

        if (!list[name]) {
            list[name] = makeEventList();
        }

        return list[name];

    }

    Object.assign(manager, {
        get
    });

    return Object.freeze(manager);

}

function makeEventArgument(name, data) {

    'use strict';

    var arg = {};
    var internalIsStopped = false;

    function stop() {
        internalIsStopped = true;
    }

    function isStopped() {
        return internalIsStopped;
    }

    if (typeof name !== 'string') {
        triggerError('Event name must be a string', 'type');
    }

    Object.assign(arg, {
        timestamp: Data.now(),
        name,
        stop,
        isStopped
    });

    if (data) {
        arg.data = data;
    }

    return Object.freeze(arg);

}

function makeEventInterface() {

    'use strict';

    var inter = {};
    var manager = makeEventManger();

    function looksFamiliar(obj) {

        return util.Object.looksLike(obj, {
            name: 'string',
            stop: 'function',
            isStopped: 'function'
        });

    }

    function get(name) {

        var event;

        if (typeof name === 'string') {
            event = manager.get(name);
        } else if (looksFamiliar(name)) {
            event = manager.get(name.name);
        }

        if (!event) {
            triggerError('Expected string or eventArgument', 'type');
        }

        return event;

    }

    function create(name, data) {
        return makeEventArgument(name, data);
    }

    function getEventArgument(name, data) {

        var arg;

        if (typeof name === 'string') {
            arg = create(name, data);
        } else if (looksFamiliar(name)) {
            arg = name;
        }

        if (!arg) {
            triggerError('Expected string or eventArgument', 'type');
        }

        return arg;

    }

    function on(name, handler, context) {
        get(name).add(handler, context);
    }

    function off(name, handler) {
        get(name).remove(handler);
    }

    function emit(name, data) {

        var arg = getEventArgument(name, data);

        get(name).each(function (event) {

            event.handler.call(event.context, arg);

            return !arg.isStopped();

        });

    }

    Object.assign(inter, {
        create,
        on,
        off,
        emit
    });

    return Object.freeze(inter);

}

/* Demonstration of advanced form */

WEBSITE.events = makeEventInterface();

WEBSITE.events.on('async-start', function (e) {
    //doSomething();
});

var event = WEBSITE.events.create('my-new-event');
WEBSITE.events.emit(event);
if (!event.isStopped()) {
    //doSomethingBecauseEventWasntStopped()
}

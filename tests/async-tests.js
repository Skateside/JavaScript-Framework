function forIn(object, handler, context) {

    var prop = '',
        owns = Object.prototype.hasOwnProperty.bind(object);

    for (prop in object) {
        if (owns(prop)) {
            handler.call(context, prop, object[prop]);
        }
    }

}

function extend(source) {

    var args = Array.prototype.slice.call(arguments, 1),

        addToSource = function (prop, value) {
            source[prop] = value;
        };

    args.forEach(function (extra) {
        forIn(extra, addToSource);
    });

    return source;

}

function createClass(Base, proto) {

    var Class = function () {
        return this.init.apply(this, arguments);
    };

    if (!proto) {
        proto = Base;
        Base = Object;
    }

    Class.prototype = Object.create(Base.prototype);

    extend(Class.prototype, proto);

    return Class;

}


var AsyncManager = function () {
    return this.init.apply(this, arguments);
};

['pending', 'resolved', 'rejected'].forEach(function (state) {

    Object.defineProperty(AsyncManager, state.toUpperCase(), {
        configurable: false,
        enumerable:   true,
        value:        state,
        writable:     false
    });

});

AsyncManager.prototype = {

    init: function (async, context) {

        this.callbacks = [];
        this.state = AsyncManager.PENDING;

        if (typeof async === 'function') {

            async.call(context, {
                reject:  this.setState.bind(this, AsyncManager.REJECTED),
                resolve: this.setState.bind(this, AsyncManager.RESOLVED),
            });

        } else {
            this.setState(AsyncManager.RESOLVED);
        }

    },

    setState: function (state) {

        var pending  = AsyncManager.PENDING,
            resolved = AsyncManager.RESOLVED,
            rejected = AsyncManager.REJECTED,

        if (this.state === pending &&
                (state === resolved || state === rejected)) {

            this.state = state;
            this.execute();

        }

    },

    execute: function () {

        this.callbacks.forEach(function (callback) {

            if (callback.type === this.state) {
                callback.handler.call(callback.context);
            }

        }, this);

    },

    add: function (state, handler, context) {

        if (state === this.state) {
            handler.call(context);
        } else if (state === AsyncManager.PENDING) {

            this.callbacks.push({
                handler: handler,
                context: context,
                type:    state
            });

        }

    },

    getState: function () {
        return this.state;
    }

};

var Promise = function () {
    return this.init.apply(this, arguments);
};

Promise.prototype = {

    init: function (async, context) {

        var manager = new AsyncManager(async, context);

        this.done = manager.add.bind(manager, AsyncManager.RESOLVED);
        this.fail = manager.add.bind(manager, AsyncManager.REJECTED);

        this.getState = manager.getState.bind(manager);

    },

    always: function (handler, context) {

        this.done(handler, context);
        this.fail(handler, context);

    }

};


var test = new Test();

test.group('$a - Arrays', function () {

    test.perform('$a.chunk', function (assert) {

        it.should('work', function (assert) {
            assert.isTrue(true);
        });

    });

});

test.group('$f - Functions', function () {

    var $f = app.getHelper('function');

    test.perform('$f.debounce', function (it) {

        var count = 0,
            inc = function () {
                count += 1;
            },
            debounced = $f.debounce(inc, 100);

        


    });

});

test.perform('$f.throttle', function (it) {



});

test.endGroup();

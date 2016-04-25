// Drink Queue Manager
//
var lodash = require("lodash");

var activityTimeout = 60000; // Overall maximum active drink timeout

var DrinkQueue = function()
{
    var self = this;

    this.drinkOrders = [
        // { sessionId: "xxx", name: "xxx", drink: { name: "xxx", recipe: [0,0,0,0] } },
    ];

    this.listeners = {
        // sessionId: { timeoutObj: xxxx, callback: cb },
    }

    this.activeDrinkSessionId = null;
    this.activeDrinkExpireTime = null;
    this.activeDrinkTimer = null;
}

// This is our mechanism for timing-out the top-most drink in the queue (and for being able to report
// time remaining before timeout).
//
DrinkQueue.prototype.updateActiveDrink = function()
{
    var self = this;

    var newActiveDrinkSessionId = (this.drinkOrders.length > 0) ? this.drinkOrders[0].sessionId : null;
    if (newActiveDrinkSessionId != this.activeDrinkSessionId)
    {
        if (this.activeDrinkSessionId)
        {
            clearTimeout(this.activeDrinkTimer);
            this.activeDrinkTimer = null;
        }
        if (newActiveDrinkSessionId)
        {
            this.activeDrinkExpireTime = (new Date().getTime() + activityTimeout) / 1000;
            this.activeDrinkTimer = setTimeout(function()
            {
                // Active drink reached overall timeout
                //
                var sessionId = self.activeDrinkSessionId;
                self.activeDrinkSessionId = null;
                self.activeDrinkExpireTime = null;
                self.activeDrinkTimer = null;

                if (self.drinkOrders[0].state != "pouring")
                {
                    // If we're pouring, we don't want to remove the active drink even if it has expired (the pour process can
                    // be relied upon to remove the drink when the pour is completed, whether successfully or cancelled).
                    //
                    self.removeDrinkOrder(sessionId);
                }
            }, 
            activityTimeout); // Overall timeout
        }
        this.activeDrinkSessionId = newActiveDrinkSessionId;
    }
}

DrinkQueue.prototype.callAndRemoveListener = function(sessionId, result)
{
    if (this.listeners[sessionId])
    {
        if (result != "timeout")
        {
            clearTimeout(this.listeners[sessionId].timeoutObj);
        }
        var callback = this.listeners[sessionId].callback;
        delete this.listeners[sessionId];

        callback(null, result);
    }
}

DrinkQueue.prototype.notifyListeners = function()
{
    var sessionIds = lodash.keys(this.listeners);

    for (var i = 0; i < sessionIds.length; i++)
    {
        var cb = this.listeners[sessionIds[i]].callback;
        this.callAndRemoveListener(sessionIds[i], "update");
    }
};

// Public interface below here

DrinkQueue.prototype.getActiveOrderTimeRemaining = function() 
{
    return this.activeDrinkExpireTime - (new Date().getTime() / 1000); 
};

DrinkQueue.prototype.getAllDrinkOrders = function() 
{
    return this.drinkOrders;
};

DrinkQueue.prototype.getCount = function() 
{
    return this.drinkOrders.length;
};

DrinkQueue.prototype.getPosition = function(sessionId) 
{
    // This is a "1-based" position, where 0 indicates not in list
    return lodash.findIndex(this.drinkOrders, { sessionId: sessionId }) + 1;
};

DrinkQueue.prototype.setDrinkOrder = function(sessionId, drinkOrder) 
{
    var existingDrink = lodash.find(this.drinkOrders, { sessionId: sessionId });
    if (existingDrink)
    {
        // Update existing drink order details
        existingDrink.name = drinkOrder.name;
        existingDrink.drink = drinkOrder.drink;
    }
    else
    {
        // Add new drink order and update listeners
        drinkOrder.sessionId = sessionId;
        this.drinkOrders.push(drinkOrder); // Add to end
        if (this.drinkOrders.length == 1)
        {
            console.log("New active drink (drink added to empty queue)");
            this.updateActiveDrink();
        }
        this.notifyListeners();
    }
};

DrinkQueue.prototype.getDrinkOrder = function(sessionId) 
{
    return lodash.find(this.drinkOrders, { sessionId: sessionId });
};

DrinkQueue.prototype.removeDrinkOrder = function(sessionId)
{
    var pos = lodash.findIndex(this.drinkOrders, { sessionId: sessionId });
    if (pos >= 0)
    {
        this.drinkOrders.splice(pos, 1);
        if (pos == 0)
        {
            console.log("New active drink (old active drink removed)")
            this.updateActiveDrink();
        }
    }
    this.notifyListeners();
};

DrinkQueue.prototype.setStatusListener = function(sessionId, timeout, callback)
{
    // Call back when status changes for drink order corresponding to session, or when timeout expires
    //
    var self = this;
    this.listeners[sessionId] = 
    { 
        timeoutObj: setTimeout(function(){ self.callAndRemoveListener(sessionId, "timeout") }, timeout), 
        callback: callback 
    };
};

DrinkQueue.prototype.clearStatusListener = function(sessionId)
{
    // If someone is waiting on the listener, it still needs to get called (with an indication that it was cleared)
    //
    this.callAndRemoveListener(sessionId, "cleared");
};

// Singleton
var drinkQueue = new DrinkQueue();

exports.getDrinkQueue = function() { return drinkQueue };

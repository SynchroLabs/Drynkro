// Drynkro main page
//
var imgCloud = Synchro.getResourceUrl("cocktail.png");
var DrinkQueue = require('./lib/drink-queue');

exports.View =
{
    title: "Drynkro",
    elements: 
    [
        { control: "stackpanel", width: "480", height: "*", contents: [
            { control: "border", border: "Red", horizontalAlignment: "Center", borderThickness: 10, cornerRadius: 15, padding: { top: 15, bottom: 15, left: 50, right: 50 }, margin: { top: 10, bottom: 25 }, background: "Blue", contents: [
                { control: "image", width: 150, height: 150, resource: imgCloud },
            ]},

            { control: "stackpanel", orientation: "Vertical", width: 480, contents: [
                { control: "stackpanel", orientation: "Horizontal", horizontalAlignment: "Center", contents: [
                    { control: "button", caption: "{buttonCap}", icon: "local_drink", binding: "order" },
                    { control: "button", caption: "Cancel Order", icon: "clear", binding: "cancelOrder", visibility: "{position}" },
                ] },
            ] },

            { control: "stackpanel", orientation: "Horizontal", contents: [
                { control: "text", value: "Drink List", font: { bold: true }, visibility: "{count}" },
                { control: "text", value: " - You are #{position} of {count}", font: { bold: true }, visibility: "{position}" },
            ] },

            { control: "listview", select: "None", width: "*", height: "*", binding: "drinkOrders", visibility: "{count}", itemTemplate:
                { control: "text", value: "eval('Drink #' + ({$index} + 1) + ' - ' + {drink.name} + ' for ' + {name})", font: { bold: "eval({$root.position} == ({$index} + 1))" } },
            },
        ] }
    ]
}

function updateViewModel(viewModel, drinkQueue, sessionId)
{
    viewModel.count = drinkQueue.getCount();
    viewModel.drinkOrders = drinkQueue.getAllDrinkOrders();
    viewModel.position = drinkQueue.getPosition(sessionId);
    viewModel.buttonCap = (viewModel.position == 0) ? "Order a Drynk..." : "Modify Order...";
}

exports.InitializeViewModel = function (context, session)
{
    var drinkQueue = DrinkQueue.getDrinkQueue();
    var sessionId = Synchro.getSessionId(context);

    var viewModel = { position: 0 };
    updateViewModel(viewModel, drinkQueue, sessionId);
    return viewModel;
}

exports.LoadViewModel = function * (context, session, viewModel)
{    
    var drinkQueue = DrinkQueue.getDrinkQueue();
    var sessionId = Synchro.getSessionId(context);

    updateViewModel(viewModel, drinkQueue, sessionId);

    while (Synchro.isActiveInstance(context) && (viewModel.position != 1)) // termination condition - you're up (position == 1)
    {
        yield Synchro.interimUpdateAwaitable(context);

        var status = yield Synchro.yieldAwaitable(context, function(callback){ drinkQueue.setStatusListener(sessionId, 1000, callback) });
        if (status == "update") // status is one of "update", "timeout", or "cleared"
        {
            updateViewModel(viewModel, drinkQueue, sessionId);
        }
        else if (status == "cleared")
        {
            // Listener was explicitly cleared (typically in preparation to navigate away)
            break;
        }
    }

    if (viewModel.position == 1)
    {
        // We're up!  Go pour the drink
        Synchro.pushAndNavigateTo(context, "order");
    }
}

exports.Commands = 
{
    order: function(context, session, viewModel, params)
    {
        // Stop listening before navigating away...
        var drinkQueue = DrinkQueue.getDrinkQueue();
        var sessionId = Synchro.getSessionId(context);
        drinkQueue.clearStatusListener(sessionId);

        return Synchro.pushAndNavigateTo(context, "order");
    },

    cancelOrder: function(context, session, viewModel, params)
    {
        var drinkQueue = DrinkQueue.getDrinkQueue();
        var sessionId = Synchro.getSessionId(context);
        drinkQueue.removeDrinkOrder(sessionId);
        updateViewModel(viewModel, drinkQueue, sessionId);
    },
}


exports.OnBack = function(context, session, viewModel)
{
    // Stop listening before navigating away...
    var drinkQueue = DrinkQueue.getDrinkQueue();
    var sessionId = Synchro.getSessionId(context);
    drinkQueue.clearStatusListener(sessionId);

    return false; // Nav not handled
}

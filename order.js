// Order a drink...
//
var lodash = require("lodash");
var DrinkQueue = require('./lib/drink-queue');
var Pourer = require('./lib/pour');

var liquor = "Vodka"; // Default - wil be updated from app config below

var recipes = // recipe: [liquor, cran, sour, orange]
{
    "Vodka": 
    [
        { name: "Cape Cod", recipe: [2, 6, 0, 0]},
        { name: "Cran Codder", recipe: [2, 5, 1, 0]},
        { name: "Cranberry Toad", recipe: [2, 5, 0, 1]},
        { name: "Key West Screwdriver", recipe: [2, 0, 1, 5]},
        { name: "Madras", recipe: [2, 3, 0, 3]},
        { name: "Party Punch", recipe: [2, 2, 2, 2]},
        { name: "Pink Lemonade", recipe: [2, 1, 5, 0]},
        { name: "Ruby Punch", recipe: [2, 4, 1, 1]},
        { name: "Russian Rita", recipe: [2, 0, 5, 1]},
        { name: "Screwdriver", recipe: [2, 0, 0, 6]},
        { name: "Sour Berry", recipe: [2, 3, 3, 0]},
        { name: "Sucker Punch", recipe: [2, 1, 4, 1]},
        { name: "Sunset Punch", recipe: [2, 1, 1, 4]},
        { name: "Sweet-tart", recipe: [2, 0, 3, 0]},
        { name: "Vodka Shot", recipe: [1, 0, 0, 0]},
        { name: "Vodka Sunburst", recipe: [2, 1, 0, 5]},
        { name: "Mix Your Own...", custom: true, recipe: [0, 0, 0, 0]}
    ],
    "Tequila": 
    [ 
        { name: "Boat Punch", recipe: [2, 2, 2, 2]},
        { name: "Cactus Punch", recipe: [2, 4, 1, 1]},
        { name: "Cran Rita", recipe: [2, 1, 5, 0]},
        { name: "Cran-Aid", recipe: [2, 5, 0, 1]},
        { name: "Knockout Punch", recipe: [2, 1, 4, 1]},
        { name: "Margarita", recipe: [2, 0, 5, 1]},
        { name: "Orange Worm", recipe: [2, 0, 1, 5]},
        { name: "Prickly Madras", recipe: [2, 3, 0, 3]},
        { name: "South of the Border Screwdriver", recipe: [2, 0, 0, 6]},
        { name: "Souther Breeze", recipe: [2, 1, 1, 4]},
        { name: "Spicy Cran", recipe: [2, 3, 3, 0]},
        { name: "Tequila", recipe: [1, 0, 0, 0]},
        { name: "Tequila Bite", recipe: [2, 6, 0, 0]},
        { name: "Tequila Sour", recipe: [2, 0, 6, 0]},
        { name: "Tequila Sunburst", recipe: [2, 1, 0, 5]},
        { name: "Tropical Rita", recipe: [2, 0, 3, 3]},
        { name: "Wild Thing", recipe: [2, 5, 1, 0]},
        { name: "Mix Your Own...", custom: true, recipe: [0, 0, 0, 0]}
    ],
    "Rum": 
    [ 
        { name: "Bermuda Triangle", recipe: [2, 5, 0, 1]},
        { name: "Caribbean Screwdriver", recipe: [2, 0, 0, 6]},
        { name: "Cranberry Kiss", recipe: [2, 5, 1, 0]},
        { name: "Hurricane", recipe: [2, 3, 0, 3]},
        { name: "Hurricane Punch", recipe: [2, 1, 1, 4]},
        { name: "Marina Punch", recipe: [2, 1, 4, 1]},
        { name: "My Pleasure", recipe: [2, 6, 0, 0]},
        { name: "Orange Plunge", recipe: [2, 0, 1, 5]},
        { name: "Picnic Punch", recipe: [2, 4, 1, 1]},
        { name: "Plankwalk", recipe: [2, 1, 5, 0]},
        { name: "Rum", recipe: [1, 0, 0, 0]},
        { name: "Rum Punch", recipe: [2, 2, 2, 2]},
        { name: "Rum Sour", recipe: [2, 0, 6, 0]},
        { name: "Rum Stone Sour", recipe: [2, 0, 5, 1]},
        { name: "Rum Sunburst", recipe: [2, 1, 0, 5]},
        { name: "Suntwist", recipe: [2, 0, 3, 3]},
        { name: "Tangy Cran", recipe: [2, 3, 3, 0]},
        { name: "Mix Your Own...", custom: true, recipe: [0, 0, 0, 0]}
    ]
};

exports.View =
{
    title: "Drynk Order",
    elements: 
    [
        { control: "stackpanel", width: "465", contents: [

            { control: "text", value: "{title}", font: { size: 14, bold: true }, horizontalAlignment: "Center" },
            { control: "text", value: "Order expires in {secondsToStartPour} seconds", horizontalAlignment: "Center", visibility: "eval({state} == 'pending')" },

            { control: "stackpanel", orientation: "Horizontal", contents: [
                { control: "text", style: "col1Style", value: "Your Name", fontsize: 10, verticalAlignment: "Center" },
                { control: "edit", style: "col2Style", placeholder: "enter your name", binding: "username", verticalAlignment: "Center" },
            ] },

            { control: "stackpanel", orientation: "Horizontal", contents: [
                { control: "text", style: "col1Style", value: "Your Drink", fontsize: 10, verticalAlignment: "Center" },
                { control: "picker", style: "col2Style", margin: { bottom: 10 }, binding: { items: "drinkList", itemContent: "{name}", selection: "selectedDrink", selectionItem: "$data" } },
            ] },

            { control: "stackpanel", orientation: "Horizontal", contents: [
                { control: "text", style: "col1Style", value: "{liquor}", fontsize: 10, verticalAlignment: "Center" },
                { control: "slider", style: "col2Style", minimum: 0, maximum: 2, binding: "customRecipe[0]", verticalAlignment: "Center", visibility: "{selectedDrink.custom}" },
                { control: "progressbar", style: "col2Style", minimum: 0, maximum: 2, value: "{selectedDrink.recipe[0]}", verticalAlignment: "Center", visibility: "{!selectedDrink.custom}" },
            ] },
            { control: "stackpanel", orientation: "Horizontal", contents: [
                { control: "text", style: "col1Style", value: "Cranberry", fontsize: 10, verticalAlignment: "Center" },
                { control: "slider", style: "col2Style", minimum: 0, maximum: 6, binding: "customRecipe[1]", verticalAlignment: "Center", visibility: "{selectedDrink.custom}" },
                { control: "progressbar", style: "col2Style", minimum: 0, maximum: 6, value: "{selectedDrink.recipe[1]}", verticalAlignment: "Center", visibility: "{!selectedDrink.custom}" },
            ] },
            { control: "stackpanel", orientation: "Horizontal", contents: [
                { control: "text", style: "col1Style", value: "Sour Mix", fontsize: 10, verticalAlignment: "Center" },
                { control: "slider", style: "col2Style", minimum: 0, maximum: 6, binding: "customRecipe[2]", verticalAlignment: "Center", visibility: "{selectedDrink.custom}" },
                { control: "progressbar", style: "col2Style", minimum: 0, maximum: 6, value: "{selectedDrink.recipe[2]}", verticalAlignment: "Center", visibility: "{!selectedDrink.custom}" },
            ] },
            { control: "stackpanel", orientation: "Horizontal", contents: [
                { control: "text", style: "col1Style", value: "Orange", fontsize: 10, verticalAlignment: "Center"},
                { control: "slider", style: "col2Style", minimum: 0, maximum: 6, binding: "customRecipe[3]", verticalAlignment: "Center", visibility: "{selectedDrink.custom}" },
                { control: "progressbar", style: "col2Style", minimum: 0, maximum: 6, value: "{selectedDrink.recipe[3]}", verticalAlignment: "Center", visibility: "{!selectedDrink.custom}" },
            ] },

            { control: "stackpanel", orientation: "Horizontal", contents: [
                { control: "text", style: "col1Style", value: "Nickname", fontsize: 10, verticalAlignment: "Center", visibility: "{selectedDrink.custom}" },
                { control: "edit", style: "col2Style", binding: "customDrinkName", verticalAlignment: "Center", visibility: "{selectedDrink.custom}" },
            ] },

            { control: "stackpanel", orientation: "Vertical", width: "*", contents: [
                { control: "stackpanel", orientation: "Horizontal", horizontalAlignment: "Center", contents: [
                    { control: "button", caption: "{buttonCap}", icon: "local_drink", binding: "order", visibility: "eval({state} == 'ordering')" },
                    { control: "button", caption: "Start Pouring", icon: "play_arrow", binding: "startPouring", visibility: "eval({state} == 'pending')" },
                    { control: "button", caption: "Cancel Order", icon: "clear", binding: "cancelDrink", visibility: "eval({orderInQueue} && ({state} != 'pouring'))" }, // Also need cancel order in "ordering" if drink in queue
                    { control: "button", caption: "Stop Pouring", icon: "stop", binding: "stopPouring", visibility: "eval({state} == 'pouring')" },
                ] },
            ] },

        ] }
    ]
}

function getDrinkOrder(viewModel)
{
    var drinkOrder = { name: viewModel.username || "Unknown" };
    drinkOrder.drink = viewModel.selectedDrink.custom ? { name: viewModel.customDrinkName, custom: true, recipe: viewModel.customRecipe } : viewModel.selectedDrink;
    return drinkOrder;
}

function moveToPendingState(viewModel)
{
    viewModel.state = "pending";
    viewModel.title = "You're Up - Pour Away!";
}

function endPourWithMessage(context, viewModel, title, message)
{
    viewModel.state = "complete";
    viewModel.title = title;
    var messageBox = 
    {
        title: "Drinkro",
        message: message,
        options: [ { label: "Ok", command: "endPour" } ]
    }
    return Synchro.showMessage(context, messageBox);
}

exports.InitializeViewModel = function (context, session, params)
{
    liquor = Synchro.getConfig(context, "LIQUOR") || liquor;

    var viewModel =
    {
        col1Style: { width: 150 },
        col2Style: { width: 295, margin: {right: 0} },
        liquor: liquor,
        drinkList: recipes[liquor],
        selectedDrink: recipes[liquor][0],
        customDrinkName: "Custom Mix",
        customRecipe: [2, 2, 2, 2],
        username: "",
        title: "Select Your Drink",
        buttonCap: "Place Order...",
        orderInQueue: false,
        state: "ordering", // "pending", "pouring", "complete"
        secondsToStartPour: null
    }

    var drinkQueue = DrinkQueue.getDrinkQueue();
    var sessionId = Synchro.getSessionId(context);
    var drinkOrder = drinkQueue.getDrinkOrder(sessionId)

    if (drinkOrder)
    {
        viewModel.orderInQueue = true;
        if (drinkOrder.drink.custom)
        {
            viewModel.selectedDrink = lodash.find(recipes[liquor], { name: "Mix Your Own..." });
            viewModel.customDrinkName = drinkOrder.drink.name;
            viewModel.customRecipe = drinkOrder.drink.recipe;
        }
        else
        {
            viewModel.selectedDrink = lodash.find(recipes[liquor], { name: drinkOrder.drink.name });
        }
        viewModel.username = drinkOrder.name;
        viewModel.buttonCap = "Update Order..."

        if (drinkQueue.getPosition(sessionId) == 1)
        {
            // We're up now, go to pouring states
            moveToPendingState(viewModel);
        }
    }

    return viewModel;
}

// This isn't really a traditional post-init async loader. We're using this as our async status checking
// loop mechanism (LoadViewModel will run until we get to state "complete", meaning we're exiting).
//
exports.LoadViewModel = function * (context, session, viewModel)
{    
    var drinkQueue = DrinkQueue.getDrinkQueue();
    var sessionId = Synchro.getSessionId(context);

    while (Synchro.isActiveInstance(context) && (viewModel.state != "complete"))
    {
        yield Synchro.interimUpdateAwaitable(context);
        yield Synchro.yieldAwaitable(context, function(callback){ setTimeout(callback, 1000) });

        var pos = drinkQueue.getPosition(sessionId);
        if (viewModel.state == "ordering")
        {
            if (pos == 1)
            {
                // We are now the top drink.  Move to "pending".  This happens when we're on the "order" page looking
                // at or modifying details of a previously ordered drink, and while doing that, that drink becomes active.
                //
                viewModel.secondsToStartPour = Math.round(drinkQueue.getActiveOrderTimeRemaining());
                moveToPendingState(viewModel);
            }
        }
        else if (viewModel.state == "pending")
        {
            if (pos == 0)
            {
                // Drink expired before pouring began
                //
                endPourWithMessage(context, viewModel, "Drynk Expired!", "Your drink order has expired");
            }
            else
            {
                // Update time remaining for display
                viewModel.secondsToStartPour = Math.round(drinkQueue.getActiveOrderTimeRemaining());
            }
        }
    }
}

exports.Commands = 
{
    order: function(context, session, viewModel, params)
    {
        var drinkQueue = DrinkQueue.getDrinkQueue();
        var sessionId = Synchro.getSessionId(context);
        var drinkOrder = getDrinkOrder(viewModel);

        drinkQueue.setDrinkOrder(sessionId, drinkOrder);
        viewModel.orderInQueue = true;

        if (drinkQueue.getPosition(sessionId) == 1)
        {
            // We're up now, go to pouring states
            moveToPendingState(viewModel);
        }
        else
        {
            // Back to main to wait for our turn...
            Synchro.popTo(context, "main");
        }
    },

    startPouring: function * (context, session, viewModel, params)
    {
        var drinkQueue = DrinkQueue.getDrinkQueue();
        var sessionId = Synchro.getSessionId(context);
        var drinkOrder = getDrinkOrder(viewModel);

        if (drinkQueue.getPosition(sessionId) == 0)
        {
            endPourWithMessage(context, viewModel, "Drynk Expired!", "Your drink order has expired");
            return;
        }

        // Prevent drink queue timing this drink out while pouring...
        drinkOrder.state = "pouring";
        drinkQueue.setDrinkOrder(sessionId, drinkOrder);

        viewModel.state = "pouring";
        viewModel.title = "Your Drynk is Pouring!";
        yield Synchro.interimUpdateAwaitable(context);

        var pourer = Pourer.getPourer();
        var poured = yield Synchro.yieldAwaitable(context, function(callback) 
        {
            pourer.pourDrink(drinkOrder.drink.recipe, callback)
        });

        drinkQueue.removeDrinkOrder(sessionId);

        if (poured)
        {
            endPourWithMessage(context, viewModel, "Pour Complete!", "Your drink has been poured");
        }
        else
        {
            endPourWithMessage(context, viewModel, "Pour Cancelled!", "Your drink pour was cancelled mid-stream!");
        }
    },

    cancelDrink: function(context, session, viewModel, params)
    {
        var drinkQueue = DrinkQueue.getDrinkQueue();
        var sessionId = Synchro.getSessionId(context);
        drinkQueue.removeDrinkOrder(sessionId);

        endPourWithMessage(context, viewModel, "Drink Order Cancelled!", "Drink order was cancelled");
    },

    stopPouring: function(context, session, viewModel, params)
    {
        var pourer = Pourer.getPourer();
        pourer.stopPouring();
    },

    endPour: function(context, session, viewModel, params)
    {
        Synchro.popTo(context, "main");
    },
}

// Pour the drink!
//
var Pourer = function()
{
    this.pouring = false;
    this.clientCallback;
    this.timeoutObj;
}

Pourer.prototype.callCallback = function(success)
{
    var theCallback = this.clientCallback;
    this.clientCallback = null;
    this.timeoutObj = null;
    this.pouring = false;
    theCallback(null, success);
}

// Public interface starts here

Pourer.prototype.pourDrink = function(recipe, callback) // recipe is array of [liquor, cran, sour, orange] in ounces
{
    var self = this;
    this.clientCallback = callback

    // Total of mixers should equal 6 oz.  Custom drinks may have up to 6 ounces of *each* mixer, so we do some
    // math to scale them down as needed.
    //
    var mixer = recipe[1] + recipe[2] + recipe[3];
    if (mixer > 6)
    {
        recipe[1] *= 6/mixer;
        recipe[2] *= 6/mixer;
        recipe[3] *= 6/mixer;
    }

    // !!! Pretend to pour drink for 5 seconds
    //
    console.log("Pouring drink:", recipe);
    this.pouring = true;
    this.timeoutObj = setTimeout(function(){ self.callCallback(true) }, 5000);
}

Pourer.prototype.stopPouring = function()
{
    if (this.pouring)
    {
        console.log("Cancelling pour");
        clearTimeout(this.timeoutObj);
        this.callCallback(false);
    }
}

// Singleton
var pourer = new Pourer();

exports.getPourer = function() { return pourer };

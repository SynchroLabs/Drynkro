var fs = require("fs");

// Pour the drink!
//

var GpioController = function(gpios)
{
    this.gpios = gpios;
    this.initGpios();
}

GpioController.prototype.setGpio = function(gpio)
{
    gpioPath = "/sys/class/gpio/gpio" + gpio.gpio;
    value = gpio.on ? "1" : "0";
    
    fs.appendFileSync(gpioPath + "/value", value);
    console.log("Set gpio " + gpioPath + " to " + value);
}

GpioController.prototype.initGpio = function(gpio)
{
    gpioPath = "/sys/class/gpio/gpio" + gpio.gpio;

    // Make sure the pin is exported and ready to go

    if (!fs.existsSync(gpioPath))
    {
        fs.appendFileSync('/sys/class/gpio/export', gpio.gpio);
        // !!! This succeeds, but I think there is some amount of the OS jerking
        // around to expose the GPIO through the filesystem and then set the
        // owner and group. The bottom line is that the write to /direction
        // below will fail with:
        //
        // EACCES: permission denied, open '/sys/class/gpio/gpio10/direction'
    }
    
    fs.appendFileSync(gpioPath + "/direction", "out");

    this.setGpio(gpio);
}

GpioController.prototype.initGpios = function()
{
    for (index = 0, len = this.gpios.length; index < len; ++index)
    {
        this.initGpio(this.gpios[index]);
    }
}

GpioController.prototype.playSequence = function(sequence, callback)
{
    this.stopSequence();
    
    this.sequence = sequence;
    this.sequenceIndex = 0;
    this.callback = callback;
    
    this.playNextElement();
}

GpioController.prototype.stopSequence = function()
{
    if (this.currentTimer)
    {
        clearTimeout(this.currentTimer);
        this.currentTimer = null;
        this.setGpioState(0);
    }

    if (this.callback)
    {
        this.callback(false);
        this.callback = null;
    }
}

GpioController.prototype.playNextElement = function()
{
    this.currentTimer = null;
    
    if (this.sequenceIndex < this.sequence.length)
    {
        this.setGpioState(this.sequence[this.sequenceIndex]);
        this.sequenceIndex++;
    }

    if (this.sequenceIndex < this.sequence.length)
    {
        var foo = this;
        this.currentTimer = setTimeout(function() { foo.playNextElement(); }, this.sequence[this.sequenceIndex]);
        this.sequenceIndex++;
    }
    else
    {
        // Sequence is done, tell the callback (if any)
        if (this.callback)
        {
            this.callback(true);
            this.callback = null;
        }
    }
}

GpioController.prototype.setGpioState = function(gpiosToSet)
{
    var mask = 1;
    for (var counter = 0;counter < this.gpios.length;++counter)
    {
        this.gpios[counter].on = (gpiosToSet & mask);
        this.setGpio(this.gpios[counter]);
        console.log("setGpioState " + JSON.stringify(this.gpios[counter]));
        mask <<= 1;
    }
}

var Pourer = function()
{
    this.clientCallback;
    this.gpioController = new GpioController([
        { caption: "Motor 3 Vodka", gpio: "22", on: false  },
        { caption: "Motor 2 Cranberry", gpio: "27", on: false  },
        { caption: "Motor 4 Sour", gpio: "10", on: false  },
        { caption: "Motor 1 Orange Juice", gpio: "17", on: false },
        ]);
}

Pourer.prototype.callCallback = function(success)
{
    var theCallback = this.clientCallback;
    this.clientCallback = null;
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

    console.log("Pouring drink:", recipe);
    
    var maxCounter = recipe.length;
    var sequence = [];
    
    for (var counter = 0;counter < maxCounter;++counter)
    {
        sequence.push(1 << counter);
        sequence.push(recipe[counter] * 24000);
    }
    sequence.push(0);
    sequence.push(0);

    // [1, 1000, 2, 1000, 4, 1000, 8, 1000, 0, 0]
    this.gpioController.playSequence(sequence, function(param) { self.callCallback(param); });
}

Pourer.prototype.stopPouring = function()
{
    this.gpioController.stopSequence();
}

// Singleton
var pourer = new Pourer();

exports.getPourer = function() { return pourer };

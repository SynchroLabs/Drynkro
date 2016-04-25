# Drynkro - Synchro Drink Robot app

This app is intended to be installed into a [Synchro Server](https://synchro.io) environment using the [Synchro Command Line Interface](https://www.npmjs.com/package/synchro) tool.  

## Installing Synchro Drynkro

To install in your Synchro Server environment using the Synchro CLI:
```
$ synchro install https://github.com/SynchroLabs/Drynkro/archive/master.zip
```

Alternatively, you may use Git to install this app and keep it up to date.  To do that, you will want to clone Drynkro (this repo) into the `synchro-apps` directory in your Synchro installation, then install Synchro Drynkro into your configuration using the Synchro CLI:

```
$ synchro add Drynkro drynkro
```

## Configuring Synchro Drynkro

Before running Synchro Server with this app, you should provide the app configuration setting `LIQUOR`, which may contain one of: Vodka, Rum, Tequila.  If not provided, Vodka will be used. 

The easiest way to set this value is to add it to the Synchro Server `config.json` file after installing the Synchro Drynkro app into your local configuration (as described in the previous section):

```
{
  "APPS": {
    ... other apps ...
    "drynkro": {
      "container": "drynkro",
      "LIQUOR": ">>>PUT YOUR LIQUOR HERE<<<"
    }
  }
}
```

## Updating Synchro Drynkro

If you installed this app using `synchro install`, then you may update it (getting the most recent version) at any time by doing:

```
$ synchro install -u drynkro
```

Of course if you installed by cloning the repo, then you will use Git to update as appropriate.

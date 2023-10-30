# Gama Server Linker

## Introduction

This code creates a server that can connect to Gama Server and allows players to play to a Gama modelized game.
This server can monitor every connection. Thanks to the latter, Gama model doesn't need to manage connections with the players, it simply needs to implement in the simulation the commands of what a player can do and indicate which outputs need to be retrieved at each simulation cycle.
An example is already implemented in the code. In this one, hearts are represented by dots that can move within a zone. The player interface can visualize this moving point.

## Installation and launching

The server requires NodeJs. If you don't have, please install it [here](https://nodejs.org/).
To install the server:
- Download the code,
- Open a command line and type in the current folder: ```npm install``` to install all the packages required,
- Type: ```npm start```to start the server.
The server is now launched

You will also need to load Gama Server, for more information see this [documentation](https://gama-platform.org/wiki/HeadlessServer). You can start Gama Server before or after the middleware server.

### Monitor page

Go to [localhost:8000/monitor](http:localhost:8000/monitor)
There is also the page settings which allows you to change the ports and the model file loaded by Gama Server. You can also change these settings before launching the middleware server by going to settings.json

### Player page

Go to [localhost:8000/player](http:localhost:8000/player)
When a player connects, you will see it on the monitor page and you can add it on the gama simulation when it is launched.

## Operating details

You can see below the schema of the operation of the server. The server magages the several connections and authenticate the players to Gama.

![Operating schema](https://github.com/leonsi7/gama-server-middleware/assets/104212258/1b5cd07b-3726-4b06-badc-aa8bfa7fa146)![Blank diagram(1)](https://github.com/leonsi7/gama-server-middleware/assets/104212258/7a551296-5b7c-4dd6-aed8-7a12d9600af1)


## Create your own game
First, you will have to create a new model based on the example model1.gaml
You will need to create a webpage based on player.html.
If you want to add player's instructions, you will also need to add code in player_server.js, server_model.js and gama_server.js. To understand how this code works, I created an UML diagram to show you the structure of the code.

![Pseudo UML Diagram](https://github.com/leonsi7/gama-server-middleware/assets/104212258/a2c351ab-8964-4a5e-b06d-8fdb2ca6be0b)

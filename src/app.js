//Imports
const express = require('express');
const fs = require('fs');

// Default values
const DEFAULT_APP_PORT = 80;

class App {
    constructor(server_model) {
        this.server_model = server_model;
        this.app_port = this.server_model.json_settings.app_port != undefined ? server_model.json_settings.app_port : DEFAULT_APP_PORT;
        
        const app = express();
        app.set('view engine', 'ejs');
        app.use(express.static('views'));

        app.get('/monitor', (req, res) => {
          res.sendFile('monitor.html', { root: 'views/monitor' });
        });
        
        app.get('/settings', (req, res) => {
          res.sendFile('settings.html', { root: 'views/settings' });
        });
        
        app.get('/player', (req, res) => {
          res.sendFile('player.html', { root: 'views/player' });
        });

        //Some getters

        app.get('/getWsMonitorPort', (req, res) => {
          res.json({ "monitor_ws_port" : server_model.json_settings.monitor_ws_port });
        });

        app.get('/getWsGamePort', (req, res) => {
          res.json({ "player_ws_port" : server_model.json_settings.player_ws_port });
        });
        
        app.get('/favicon.ico', (req, res) => {
          res.sendFile('favicon.ico', { root: 'views/public' });
        });

        app.listen(this.app_port, () => {
            console.log(`Listening on port ${this.app_port}`)
        });
    }
}

module.exports = App;
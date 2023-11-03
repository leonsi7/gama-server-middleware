//Imports
const express = require('express');
const fs = require('fs');

// Default values
const DEFAULT_APP_PORT = 80;

class App {
    constructor(server_model) {
        this.server_model = server_model;
        this.app_port = this.server_model.json_settings.app_port != undefined ? server_model.json_settings.app_port : DEFAULT_APP_PORT;
        
        this.app = express();
        this.app.set('view engine', 'ejs');
        this.app.use(express.static('views'));

        this.app.get('/monitor', (req, res) => {
          res.sendFile('monitor.html', { root: 'views/monitor' });
        });

        this.app.get('/flow_displayer', (req, res) => {
          res.sendFile('flow_displayer.html', { root: 'views/flow_displayer' });
        });
        
        this.app.get('/settings', (req, res) => {
          res.sendFile('settings.html', { root: 'views/settings' });
        });

        
        this.app.get('/player', (req, res) => {
          if (this.server_model.json_settings.player_web_interface){
            res.sendFile(this.server_model.json_settings.player_html_file, { root: 'views/player' });
          }
          else {
            res.sendFile('404.html', { root: 'views/public' });
          }
        });
      

        //Some getters

        this.app.get('/getWsMonitorPort', (req, res) => {
          res.json({ "monitor_ws_port" : server_model.json_settings.monitor_ws_port });
        });

        this.app.get('/getWsGamePort', (req, res) => {
          res.json({ "player_ws_port" : server_model.json_settings.player_ws_port });
        });
        
        this.app.get('/favicon.ico', (req, res) => {
          res.sendFile('favicon.ico', { root: 'views/public' });
        });


        this.server = this.app.listen(this.app_port, () => {
            console.log(`-> Listening on port ${this.app_port}`)
        });
    }
}

module.exports = App;
//Imports
const express = require('express');
const fs = require('fs');

// Default values
const DEFAULT_APP_PORT = 80;

class App {
    constructor(server_model) {
        this.server_model = server_model;
        this.app_port = server_model.json_state.app_port != undefined ? server_model.json_state.app_port : DEFAULT_APP_PORT;
        
        const monitor_app = express();

        monitor_app.get('/monitor', (req, res) => {
            fs.readFile('monitor.html', 'utf-8', (err, data) => {
              if(err) {
                console.log(err);
                res.status(500).send('Server error')
              } else {
        
                res.send(data)
              }
            })
          })
        
        monitor_app.get('/game', (req, res) => {
        fs.readFile('game.html', 'utf-8', (err, data) => {
            if(err) {
            console.log(err);
            res.status(500).send('Server error')
            } else {
        
            res.send(data)
            }
            });
        });
          
        monitor_app.listen(monitor_app_port, () => {
            console.log(`Listening on port ${monitor_app_port}`)
        });
    
    }
}

module.exports = App;
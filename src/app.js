//Imports
const express = require('express');
const fs = require('fs');

// Default values
const DEFAULT_APP_PORT = 80;

class App {
    constructor(server_model) {
        this.server_model = server_model;
        this.app_port = server_model.json_state.app_port != undefined ? server_model.json_state.app_port : DEFAULT_APP_PORT;
        
        const app = express();
        app.use(express.static('public'));

        app.get('/monitor', (req, res) => {
            fs.readFile('public/monitor.html', 'utf-8', (err, data) => {
              if(err) {
                console.log(err);
                res.status(500).send('Server error')
              } else {
        
                res.send(data)
              }
            })
          })
        
        app.get('/game', (req, res) => {
          fs.readFile('public/game.html', 'utf-8', (err, data) => {
              if(err) {
              console.log(err);
              res.status(500).send('Server error')
              } else {
          
              res.send(data)
              }
            });
        });

        app.get('/home', (req, res) => {
          fs.readFile('public/home.html', 'utf-8', (err, data) => {
            if(err) {
            console.log(err);
            res.status(500).send('Server error')
            } else {
        
            res.send(data)
            }
            });
        });
        

        app.get('/favicon.ico', (req, res) => {
          res.sendFile('/public/favicon.ico');
        });

        app.get('/', (req, res) => {
          res.redirect('/home');
        });

          
        app.listen(this.app_port, () => {
            console.log(`Listening on port ${this.app_port}`)
        });

        
    }
}

module.exports = App;
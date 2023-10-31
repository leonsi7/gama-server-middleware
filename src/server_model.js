const ConnectorGamaServer = require('./gama_server.js');
const MonitorServer = require('./monitor_server.js');
const PlayerServer = require('./player_server.js');
const App = require('./app.js');
const fs = require('fs');


class ServerModel {
    constructor() {
        this.json_state = JSON.parse(fs.readFileSync('src/json_state.json', 'utf-8'));
        this.json_settings = JSON.parse(fs.readFileSync('settings.json', 'utf-8'));
        this.json_simulation = {};
        this.monitor_server = new MonitorServer(this);
        this.player_server = new PlayerServer(this);
        this.app = new App(this);
        this.gama_connector = new ConnectorGamaServer(this);
    }

    restart(){
        this.player_server.close()
        this.gama_connector.close()
        this.monitor_server.close()
        this.player_server = new PlayerServer(this);
        this.gama_connector = new ConnectorGamaServer(this);
        this.monitor_server = new MonitorServer(this);
    }
    changeJsonSettings(json_settings){
        this.json_settings = json_settings
        fs.writeFileSync('settings.json', JSON.stringify(json_settings,null, 2), 'utf-8')
        this.restart()
    }

    sendJsonSettings() {
        this.monitor_server.sendMonitorJsonSettings();
    }

    notifyMonitor() {
        this.monitor_server.sendMonitorJsonState();
        this.player_server.broadcastJsonStatePlayer();
    }

    notifyPlayerClients() {
        this.player_server.broadcastSimulationPlayer()
        this.monitor_server.sendMonitorJsonSimulation()
    }

    addNewPlayerHeadset(id_player) {
        this.gama_connector.addNewPlayerHeadset(id_player);
    }

    addNewPlayerHeadset(id_player) {
        this.gama_connector.addNewPlayerHeadset(id_player);
    }

    removePlayerHeadset(id_player) {
        this.gama_connector.removePlayerHeadset(id_player);
    }

    launchExperiment() {
        this.gama_connector.launchExperiment();
    }

    stopExperiment() {
        this.gama_connector.stopExperiment();
    }

    connectGama() {
        this.gama_connector.connectGama();
    }

}

module.exports = ServerModel;
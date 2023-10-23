const ConnectorGamaServer = require('./gama_server.js');
const MonitorServer = require('./monitor_server.js');
const VrServer = require('./vr_server.js');
const App = require('./app.js');
const fs = require('fs');


class ServerModel {
    constructor() {
        this.json_state = JSON.parse(fs.readFileSync('json_state.json', 'utf-8'));
        this.json_simulation = {};
        this.monitor_server = new MonitorServer(this);
        this.vr_server = new VrServer(this);
        this.app = new App(this);
        this.gama_connector = new ConnectorGamaServer(this);
    }

    notifyMonitor() {
        this.monitor_server.sendMonitorInformation();
    }

    notifyVrClients() {
        this.vr_server.broadcastSimulationVR()
    }

    addNewVrHeadset(id_vr) {
        this.gama_connector.addNewVrHeadset(id_vr);
    }

    addNewVrHeadset(id_vr) {
        this.gama_connector.addNewVrHeadset(id_vr);
    }

    removeVrHeadset(id_vr) {
        this.gama_connector.removeVrHeadset(id_vr);
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
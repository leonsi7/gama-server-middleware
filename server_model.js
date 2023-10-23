const ConnectorGamaServer = require('./gama_server.js');
const MonitorServer = require('./monitor_server.js');
const VrServer = require('./vr_server.js');

class ServerModel {
    constructor() {
        this.gama_connector = new ConnectorGamaServer(this);
        this.monitor_server = new MonitorServer(this);
        this.vr_server = new VrServer(this)
        this.json_state = JSON.parse(fs.readFileSync('json_state.json', 'utf-8'));
        this.json_simulation = {};
    }

    notifyMonitor() {
        this.monitor_server.sendMonitorInformation();
    }

    notifyVrClients() {
        this.vr_server.broadcastSimulationVR()
    }

}
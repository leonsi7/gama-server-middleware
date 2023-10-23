const fs = require('fs');

class StateInfo {
    constructor(server_model) {
        this.server_model = server_model;
        this.json_state = JSON.parse(fs.readFileSync('json_state.json', 'utf-8'));
        this.json_simulation = {};
    }
    getJsonState() {
        return this.json_state;
    }
    setJsonState(new_json_state) {
        this.json_state = new_json_state;
        this.server_model.jsonStateChanges();
    }
    getJsonSimulation() {
        return this.json_simulation;
    }
    setJsonSimulation(new_json_simulation) {
        this.json_simulation = new_json_simulation;
        this.server_model.jsonSimulationChanges();
    }
}

module.exports = StateInfo;
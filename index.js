const WebSocket = require('ws');
const express = require('express');
const fs = require('fs');

// Ports
const gama_ws_port = 6868
const monitor_ws_port = 80
const vr_ws_port = 8080
const monitor_app_port = 8000
const gama_simulation_update_port = 3001

//Models and path to gama server. To be changed when the server has changed
path_to_model= "C:\\Users\\across-lab\\Documents\\GamaWorkspace\\Leon\\models\\Test_gama_server3.gaml" //"C:\\Users\\Léon\\Workspaces\\GamaWorkspace\\Gama_server_VR\\models\\Test_gama_server3.gaml" 
ip_adress_gama_server = "10.0.61.179" //"localhost"

// Global JSON state
var json_state  = {gama:{connected:false}};
var json_simulation;
const time_stamp = [];


fs.readFile('json_state.json', 'utf-8', (err, data) => {
    if(err) {
      console.log(err);
    } else {
      json_state = JSON.parse(data)
    }
});

//Messages about Gama Server
var load_experiment = {
    "type": "load",
    "model": path_to_model,
    "experiment": "test",
}

function play_experiment() {
    return {
        "type": "play",
        "exp_id": json_state.gama.experiment_id,
    }
}

function stop_experiment() {
    return  {
        "type": "stop",
        "exp_id": json_state.gama.experiment_id,
    }
}

function add_vr_headset() {
    return  {
        "type": "expression",
        "content": "Add a new VR headset", 
        "exp_id": json_state.gama.experiment_id,
        "expr": "create VrHeadset { id <- \""+current_id_vr+"\"; }"
    }
}

function remove_vr_headset() {
    return  {
        "type": "expression",
        "content": "Remove a VR Headset", 
        "exp_id": json_state.gama.experiment_id,
        "expr": "do killVrHeadset(\""+current_id_vr+"\");"
    }
}

const gama_error_messages = ["SimulationStatusError",
    "SimulationErrorDialog",
    "SimulationError",
    "RuntimeError",
    "GamaServerError",
    "MalformedRequest",
    "UnableToExecuteRequest"]

//About gama-server
var gama_socket

var index_messages;
var continue_sending = false;
var do_sending = false;
var list_messages;
var function_to_call;
var current_id_vr;

function sendMessages() {
    if (do_sending && continue_sending) {
        if (index_messages < list_messages.length) {
            //console.log("--> Sending message " + index_messages)
            if (typeof list_messages[index_messages] == "function") {
                gama_socket.send(JSON.stringify(list_messages[index_messages]()))
                //console.log("Message sent to Gama-Server:");
                //onsole.log(list_messages[index_messages]());
            }
            else gama_socket.send(JSON.stringify(list_messages[index_messages]));
            continue_sending = false;
            index_messages = index_messages + 1;
        }
        else {
            function_to_call()
            do_sending = false
        }
    }
}

function launchExperiment() {
    if (json_state["gama"]["connected"] == true && json_state["gama"]["launched_experiment"] == false) {
        list_messages = [load_experiment, play_experiment];
        index_messages = 0;
        do_sending = true;
        continue_sending = true;

        json_state["gama"]["loading"] = true
        sendMonitorInformation()
        function_to_call = () => {
            json_state["gama"]["launched_experiment"] = true
            json_state["gama"]["loading"] = false
            sendMonitorInformation()
        }
        sendMessages()
        
    }
}

function stopExperiment() {
    if (json_state["gama"]["launched_experiment"] == true) {

        list_messages = [stop_experiment];
        index_messages = 0;
        do_sending = true;
        continue_sending = true;
        json_state["gama"]["loading"] = true
        sendMonitorInformation()
        function_to_call = () => {
            json_state["gama"]["launched_experiment"] = false
            json_state["gama"]["loading"] = false
            json_state["vr"]["id_connected"].forEach(id_vr => {
                json_state["vr"][id_vr]["authentified"] = false
            });
            sendMonitorInformation()
        }
        sendMessages()
    }
}

function addNewVrHeadset(id_vr) {
    if (json_state["gama"]["launched_experiment"] == false) return
    current_id_vr = id_vr
    list_messages = [add_vr_headset];
    index_messages = 0;
    do_sending = true;
    continue_sending = true;
    function_to_call = () => {
        json_state["vr"][id_vr]["authentified"] = true
        sendMonitorInformation()
    }
    sendMessages()
}

function removeVrHeadset(id_vr) {
    current_id_vr = id_vr
    list_messages = [remove_vr_headset];
    index_messages = 0;
    do_sending = true;
    continue_sending = true;
    function_to_call = () => {
        console.log("The Vr headset: "+id_vr+" has been removed from Gama");
        json_state["vr"][id_vr]["authentified"] = false
        sendMonitorInformation()
    }
    sendMessages()
}

function connectGama() {

    json_state["gama"]["loading"] = true
    sendMonitorInformation()

    gama_socket = new WebSocket("ws://"+ip_adress_gama_server+":"+gama_ws_port);

    gama_socket.onopen = function() {
        console.log("Connected to Gama Server");
        json_state["gama"]["connected"] = true
        json_state["gama"]["launched_experiment"] = false
        sendMonitorInformation()
    };

    gama_socket.onmessage = function(event) {
        try {
            const data = JSON.parse(event.data)
            if (data.type == "SimulationOutput" && data.content != String({ message: '{}', color: null })) {
                
                const cleaned_string = data.content.toString().substring(13,data.content.toString().length -15)
                json_simulation = JSON.parse(cleaned_string)
                const count = json_simulation.count
                broadcastSimulationVR()

                
            }
            if (data.type == "CommandExecutedSuccessfully") {
                if (data.command != undefined && data.command.type == "load") json_state.gama.experiment_id = data.content
                continue_sending = true
                setTimeout(sendMessages,300)
            }
            if (gama_error_messages.includes(data.type)) {
                json_state["gama"]["content_error"] = data.type + " for the command: "+ data.command.type
                json_state["gama"]["loading"] = false
                sendMonitorInformation()
                json_state["gama"]["content_error"] = ""
                throw "A problem appeared in the last message. Please check the response from the Server"
            }
        }
        catch (error) {
            console.log(error);

        }
    }

    gama_socket.addEventListener('close', (event) => {
        json_state["gama"]["connected"] = false
        json_state["gama"]["launched_experiment"] = false
        json_state["gama"]["loading"] = false
        json_state["vr"]["id_connected"].forEach(id_vr => {
            json_state["vr"][id_vr]["authentified"] = false
        });
        sendMonitorInformation()
        if (event.wasClean) {
            console.log('The WebSocket connection with Gama Server was properly be closed');
        } else {
            console.error('The Websocket connection with Gama Server interruped suddenly');
        }
        console.log(`Closure id : ${event.code}, Reason : ${event.reason}`);
    })

    gama_socket.addEventListener('error', (error) => {
        console.error('Websocket error :', error);
        
    });

    json_state["gama"]["loading"] = false
    sendMonitorInformation()
}

// About the monitor
const monitor_socket = new WebSocket.Server({ port: monitor_ws_port });
const monitor_app = express();

var monitor_socket_client

function sendMonitorInformation() {
    if (monitor_socket_client != undefined) monitor_socket_client.send(JSON.stringify(json_state));
}

monitor_app.get('/', (req, res) => {
    fs.readFile('monitor.html', 'utf-8', (err, data) => {
      if(err) {
        console.log(err);
        res.status(500).send('Server error')
      } else {
        res.send(data)
      }
    })
  })
  
monitor_app.listen(monitor_app_port, () => {
    console.log(`Listening on port ${monitor_app_port}`)
})

monitor_socket.on('connection', function connection(ws) {
    monitor_socket_client = ws
    sendMonitorInformation()
    monitor_socket_client.on('message', function incoming(message) {
        const json_monitor = JSON.parse(message)
        const type = json_monitor['type']
        if (type == "launch_experiment") launchExperiment()
        else if (type == "stop_experiment") stopExperiment()
        else if (type == "try_connection") connectGama()
        else if (type == "add_vr_headset") addNewVrHeadset(json_monitor["id"])
        else if (type == "remove_vr_headset") removeVrHeadset(json_monitor["id"])
    })
});

//About VR clients
const vr_socket = new WebSocket.Server({ port: vr_ws_port });

const vr_socket_clients = []
const vr_socket_clients_id = []

vr_socket.on('connection', function connection(ws) {
    
    ws.on('message', function incoming(message) {
        const json_vr = JSON.parse(message)
        if (json_vr.type == "connection") {
            //Si le casque a déjà été connecté
            if (json_state["vr"]["id_connected"].includes(json_vr.id)) {
                const index = vr_socket_clients_id.indexOf(json_vr.id)
                vr_socket_clients[index] = ws
                json_state["vr"][json_vr.id]["date_connection"] = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`
                json_state["vr"][json_vr.id]["state"] = "connected"
                sendMonitorInformation()
            }
            //Sinon
            else {
                vr_socket_clients.push(ws)
                vr_socket_clients_id.push(json_vr.id)
                console.log(json_vr);
                json_state["vr"]["id_connected"].push(json_vr.id)
                json_state["vr"][json_vr.id] = {}
                json_state["vr"][json_vr.id]["date_connection"] = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`
                json_state["vr"][json_vr.id]["authentified"] = false
                json_state["vr"][json_vr.id]["state"] = "connected"
                sendMonitorInformation()
            }
            if (json_state["vr"][json_vr.id]["authentified"] == false){
                addNewVrHeadset(json_vr.id)
            }
        }

        if (json_vr.type == "exit" && json_state["vr"]["id_connected"].includes(json_vr.id) && json_state["vr"][json_vr.id]["authentified"] == true){
            removeVrHeadset()
        }
    });

    ws.on('close', () => {
        const index = vr_socket_clients.indexOf(ws)
        const id_vr = vr_socket_clients_id[index]
        json_state["vr"][id_vr]["state"] = "unconnected"
        json_state["vr"][id_vr]["date_connection"] = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`
        sendMonitorInformation()
    })

    ws.on('error', (error) => {
        const index = vr_socket_clients.indexOf(ws)
        const id_vr = vr_socket_clients_id[index]
        json_state["vr"][id_vr]["state"] = "unconnected"
        json_state["vr"][id_vr]["date_connection"] = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`
        sendMonitorInformation()
    });

});

function broadcastSimulationVR() {
    for (var id_vr in json_simulation) {
        if (json_simulation[id_vr] != undefined && id_vr != "count" && id_vr != "random_content") {
            const index = vr_socket_clients_id.indexOf(id_vr)
            vr_socket_clients[index].send(JSON.stringify(json_simulation[id_vr]))
        } 
    }
}

connectGama()
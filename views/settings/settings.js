const hostname = window.location.hostname;

const monitorLink = document.getElementById("monitor-link");
    monitorLink.addEventListener("click", function(event) {
        event.preventDefault();
        // Redirigez l'utilisateur vers la page /monitor
        window.location.href = "/monitor";
    });

// Ajoutez un gestionnaire d'événements pour le lien "Settings"
const settingsLink = document.getElementById("settings-link");
settingsLink.addEventListener("click", function(event) {
    event.preventDefault();
    // Redirigez l'utilisateur vers la page /settings
    window.location.href = "/settings";
});

const helpLink = document.getElementById("help-link");
helpLink.addEventListener("click", function(event) {
    event.preventDefault();
    // Redirigez l'utilisateur vers la page /help
    window.location.href = "/help";
});


const stateDisplayerLink = document.getElementById("state-displayer-link");
stateDisplayerLink.addEventListener("click", function(event) {
    event.preventDefault();
    // Redirigez l'utilisateur vers la page /help
    window.location.href = "/flow_displayer";
});


document.addEventListener("DOMContentLoaded", function() {

    fetch('/getWsMonitorPort')
      .then(response => response.json())
      .then(data => {
        createWebSocket(data.monitor_ws_port)
      });

});

  
function createWebSocket(monitor_ws_port) {
    const jsonForm = document.getElementById("json-form");
    const hostname = window.location.hostname;
    const socket = new WebSocket('ws://'+hostname+':'+monitor_ws_port);

    socket.onopen = function() {
    };

    socket.onmessage = function(event){
        const json_settings = JSON.parse(event.data)
        if (json_settings.type == "json_settings") {
            const jsonDisplay = document.getElementById("json-form");
            jsonDisplay.elements.gama_ws_port.value = json_settings.gama_ws_port;
            jsonDisplay.elements.monitor_ws_port.value = json_settings.monitor_ws_port;
            jsonDisplay.elements.player_ws_port.value = json_settings.player_ws_port;
            jsonDisplay.elements.app_port.value = json_settings.app_port;
            jsonDisplay.elements.model_file_path.value = json_settings.model_file_path;
            jsonDisplay.elements.player_html_file.value = json_settings.player_html_file;
            jsonDisplay.elements.experiment_name.value = json_settings.experiment_name;
            jsonDisplay.elements.ip_address_gama_server.value = json_settings.ip_address_gama_server;
            jsonDisplay.elements.model_file_path_type.value = json_settings.type_model_file_path == "absolute" ? "Absolute" : "Relative"
        }
        
    }

    jsonForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const type_path = document.getElementById("model-file-path-type").value == "Absolute" ? "absolute" : "relative"
        const gama_ws_port = parseInt(document.getElementById("gama-ws-port").value)
        const monitor_ws_port = parseInt(document.getElementById("monitor-ws-port").value)
        const player_ws_port = parseInt(document.getElementById("player-ws-port").value)
        const app_port = parseInt(document.getElementById("app-port").value)
        // Update JSON data with form values
        if (gama_ws_port > 0 && monitor_ws_port > 0 && player_ws_port > 0 && app_port > 0) {
            json_settings = {
                type:"json_settings",
                gama_ws_port: gama_ws_port,
                monitor_ws_port: monitor_ws_port,
                player_ws_port: player_ws_port,
                app_port: app_port,
                model_file_path: document.getElementById("model-file-path").value,
                experiment_name: document.getElementById("experiment-name").value,
                ip_address_gama_server: document.getElementById("ip-address-gama-server").value,
                player_html_file: document.getElementById("player-html-file").value,
                type_model_file_path: type_path
            };
            console.log(json_settings);
            // Display updated JSON data
            socket.send(JSON.stringify(json_settings))
            // Redirigez l'utilisateur vers la page /settings
            window.location.href = "/settings";
        }
        else {
            alert('Please enter valid port numbers');
        }
    });

    socket.addEventListener('close', (event) => {
        if (event.wasClean) {
            console.log('The WebSocket connection with Gama Server was properly be closed');
        } else {
            console.error('The Websocket connection with Gama Server interruped suddenly');
            document.querySelector("#connection-state").innerHTML = "&#x274C; The cetral server disconnected ! Please refresh this page when the server came back to work"
            document.querySelector("#connection-state").style = "color:red;"
            document.querySelector(".container").style = "display:none;"
        }
        console.log(`Closure id : ${event.code}, Reason : ${event.reason}`);
    })
    
    socket.addEventListener('error', (error) => {
        document.querySelector("#connection-state").innerHTML = "&#x274C; The cetral server disconnected ! Please refresh this page when the server came back to work"
        document.querySelector("#connection-state").style = "color:red;"
        document.querySelector(".container").style = "display:none;"
    });
}

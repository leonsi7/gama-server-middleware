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


document.addEventListener("DOMContentLoaded", function() {
    const jsonForm = document.getElementById("json-form");

    const hostname = window.location.hostname;
    const socket = new WebSocket('ws://'+hostname+':80');

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
            jsonDisplay.elements.ip_address_gama_server.value = json_settings.ip_address_gama_server;
            jsonDisplay.elements.model_file_path_type.value = json_settings.type_model_file_path == "absolute" ? "Absolute" : "Relative"
        }
        
    }

    jsonForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const type_path = document.getElementById("model-file-path-type").value == "Absolute" ? "absolute" : "relative"

        // Update JSON data with form values
        json_settings = {
            type:"json_settings",
            gama_ws_port: parseInt(document.getElementById("gama-ws-port").value),
            monitor_ws_port: parseInt(document.getElementById("monitor-ws-port").value),
            player_ws_port: parseInt(document.getElementById("player-ws-port").value),
            app_port: parseInt(document.getElementById("app-port").value),
            model_file_path: document.getElementById("model-file-path").value,
            ip_address_gama_server: document.getElementById("ip-address-gama-server").value,
            type_model_file_path: type_path
        };
        console.log(json_settings);
        // Display updated JSON data
        socket.send(JSON.stringify(json_settings))
        // Redirigez l'utilisateur vers la page /settings
        window.location.href = "/settings";
    });

    socket.addEventListener('close', (event) => {
        document.querySelector("#connection-state").innerHTML = "&#x274C; The cetral server disconnected ! Please refresh this page when the server came back to work"
        document.querySelector("#connection-state").style = "color:red;"
        document.querySelector(".container").style = "display:none;"
        if (event.wasClean) {
            console.log('The WebSocket connection with Gama Server was properly be closed');
        } else {
            console.error('The Websocket connection with Gama Server interruped suddenly');
        }
        console.log(`Closure id : ${event.code}, Reason : ${event.reason}`);
    })
    
    socket.addEventListener('error', (error) => {
        document.querySelector("#connection-state").innerHTML = "&#x274C; The cetral server disconnected ! Please refresh this page when the server came back to work"
        document.querySelector("#connection-state").style = "color:red;"
        document.querySelector(".container").style = "display:none;"
    });
});

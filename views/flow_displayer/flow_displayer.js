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


fetch('/getWsMonitorPort')
      .then(response => response.json())
      .then(data => {
        createWebSocket(data.monitor_ws_port)
      });

function createWebSocket(monitor_ws_port) {
    const socket = new WebSocket('ws://'+hostname+':'+monitor_ws_port);

    socket.onopen = function() {
    };

    socket.onmessage = function(event){
        const json_state = JSON.parse(event.data)
        if (json_state.type == "json_state") {
            const formattedJSON = JSON.stringify(json_state, null, 2);
            document.getElementById('json-state-display').textContent = formattedJSON;
        }
        else if (json_state.type == "json_simulation") {
            const formattedJSON = JSON.stringify(json_state, null, 2);
            document.getElementById('json-simulation-display').textContent = formattedJSON;
        }
    } 

    socket.addEventListener('close', (event) => {
        

        if (event.wasClean) {
            console.log('The WebSocket connection with Gama Server was properly be closed');
        } else {
            console.error('The Websocket connection with Gama Server interruped suddenly');
            document.querySelector("#connection-state").innerHTML = "&#x274C; The central server disconnected ! Please refresh this page when the server came back to work"
            document.querySelector("#connection-state").style = "color:red;"
        }
        console.log(`Closure id : ${event.code}, Reason : ${event.reason}`);
    })

    socket.addEventListener('error', (error) => {
        document.querySelector("#connection-state").innerHTML = "&#x274C; The cetral server disconnected ! Please refresh this page when the server came back to work"
        document.querySelector("#connection-state").style = "color:red;"
    });
}


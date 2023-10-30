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

            // About GAMA
            document.querySelector("#try-connection").disabled =  json_state["gama"]["connected"] ? true : false
            document.querySelector("#gama-connection-state").innerHTML = json_state["gama"]["connected"] ? "&#10004; Connected": "&#x274C; Not connected"
            document.querySelector("#gama-connection-state").style = json_state["gama"]["connected"] ? "color:green;" : "color:red;"
            document.querySelector("#simulation-launched").innerHTML = json_state["gama"]["launched_experiment"] ? "&#10004; Simulation launched": "&#x274C; The simulation is not launched"
            document.querySelector("#simulation-launched").style = json_state["gama"]["launched_experiment"] ? "color:green;": "color:red;"
            document.querySelector("#gama-loader").style.visibility = json_state["gama"]["loading"] ? "visible" : "hidden";
            document.querySelector("#start-simulation").disabled =  json_state["gama"]["connected"]&& !json_state["gama"]["launched_experiment"]  ? false : true
            document.querySelector("#stop-simulation").disabled =  json_state["gama"]["connected"] &&  json_state["gama"]["launched_experiment"] ? false : true

            // About VR    
            document.querySelector("#player-container").innerHTML = ""
            json_state["player"]["id_connected"].forEach(element => {
                const player_button_add_span = document.createElement('span')
                const player_button_add = document.createElement('button')
                player_button_add_span.appendChild(player_button_add)
                player_button_add.innerHTML = "Add"
                player_button_add.disabled = true
                const player_button_remove_span = document.createElement('span')
                const player_button_remove = document.createElement('button')
                player_button_remove_span.appendChild(player_button_remove)
                player_button_remove.innerHTML = "Remove"
                player_button_remove.disabled = true
                const player_li = document.createElement('p')
                player_li.classList.add("player_li")
                const player_id = document.createElement('span')
                player_id.classList.add("player_id")
                const date_player = document.createElement('span')
                date_player.classList.add("date_player")
                player_button_add.classList.add("button-player-add"); // Ajoutez une classe "button-add" au bouton "Add"
                player_button_remove.classList.add("button-player-remove");
                if (json_state["gama"]["launched_experiment"] == true) {
                    if (json_state["player"][element]["authentified"]) {
                        player_button_add.disabled = true
                        player_button_remove.disabled = false
                        if (json_state["player"][element]["connected"]){
                            player_id.innerHTML = "&#10004; ID: "+ String(element)
                            player_li.style = "color:green;"
                            date_player.innerHTML = " - Connected at: " + json_state["player"][element]["date_connection"] + " - Status: Authentified"
                        }
                        else {
                            player_id.innerHTML = "   &#x274C; ID: "+ String(element)
                            player_li.style = "color:red;"
                            date_player.innerHTML = " - Last connection at: " + json_state["player"][element]["date_connection"] + " - Status: Authentified"
                        }
                    }
                    else {
                        player_button_add.disabled = false
                        player_button_remove.disabled = true
                        if (json_state["player"][element]["connected"]){
                            player_id.innerHTML = "ID: "+ String(element)
                            player_li.style = "color:orange;"
                            date_player.innerHTML = " - Connected at: " + json_state["player"][element]["date_connection"] + " - Status: Unauthentified"
                        }
                        else {
                            player_id.innerHTML = "   &#x274C; ID: "+ String(element)
                            player_li.style = "color:red;"
                            date_player.innerHTML = " - Last connection at: " + json_state["player"][element]["date_connection"] + " - Status: Unauthentified"
                        }
                    }
                }
                else {
                    player_button_add.disabled = true
                    player_button_remove.disabled = true
                    if (json_state["player"][element]["connected"]){
                        player_id.innerHTML = "ID: "+ String(element)
                        player_li.style = "color:orange;"
                        date_player.innerHTML = " - Connected at: " + json_state["player"][element]["date_connection"] + " - Status: Unauthentified"
                    }
                    else {
                        player_id.innerHTML = "   &#x274C; ID: "+ String(element)
                            player_li.style = "color:red;"
                            date_player.innerHTML = " - Last connection at: " + json_state["player"][element]["date_connection"] + " - Status: Unauthentified"
                    }
                }
                
                document.querySelector("#player-container").appendChild(player_li)
                player_li.appendChild(player_button_add_span)
                player_li.appendChild(player_button_remove_span)
                player_li.appendChild(player_id)
                player_li.appendChild(date_player)

                player_button_add.addEventListener('click', () => {
                    socket.send(JSON.stringify({"type":"add_player_headset","id":element}))
                })

                player_button_remove.addEventListener('click', () => {
                    socket.send(JSON.stringify({"type":"remove_player_headset","id":element}))
                })
            });
        }
    }

    document.querySelector("#try-connection").addEventListener('click', () => {
        socket.send(JSON.stringify({"type":"try_connection"}))
    })

    document.querySelector("#start-simulation").addEventListener('click', () => {
        socket.send(JSON.stringify({"type":"launch_experiment"}))
    })

    document.querySelector("#stop-simulation").addEventListener('click', () => {
        socket.send(JSON.stringify({"type":"stop_experiment"}))
    })

    socket.addEventListener('close', (event) => {
        document.querySelector("#connection-state").innerHTML = "&#x274C; The central server disconnected ! Please refresh this page when the server came back to work"
        document.querySelector("#connection-state").style = "color:red;"
        document.querySelector(".sections").style = "display:none;"

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
        document.querySelector(".sections").style = "display:none;"
    });
    }

/**
* Name: Testgamaserver
* Based on the internal empty template. 
* Author: Léon
* Tags: 
*/


model Testgamaserver

/* Insert your model definition here */

global {

	reflex  send_simulation_info when:every(1 #cycle){
		map<string, unknown> json;
		map<string, unknown> sending_message;
		loop player_headset over:PlayerHeadset {
			if(player_headset.isAlive){
				map<string,unknown> info_json;
				map<string, unknown> location_json;
				location_json["x"] <- player_headset.location.x;
				location_json["y"] <- player_headset.location.y;
				info_json["position"] <- location_json;
				json[player_headset.id] <- info_json;
			
			}
		}
		write as_json_string(json);
	}
	
	action removePlayerHeadset(string id_player) {
		loop player_headset over: PlayerHeadset {
			if (player_headset.id = id_player){
				player_headset.isAlive <- false;
			}
		}
	}
}

species PlayerHeadset skills:[moving] {
	
	string id;
	rgb color <- rgb(rnd(0,255),rnd(0,255),rnd(0,255));
	bool isAlive;
	init {
		isAlive <- true;
	}

    reflex move {
        do wander;
    }
	
    aspect base {
    	if(isAlive) {
    		draw circle(1) color:color;
    	}
    }
    
    
}

// Créez un environnement avec une zone spécifique où RandomGuy se déplace
experiment test type:gui {
    float minimum_cycle_duration <- 0.03 #second;
    output {
    	display map {
			species PlayerHeadset aspect: base;
		}
    }
}
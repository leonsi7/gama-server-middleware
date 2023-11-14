/**
* Name: multiplayeraddon
* Based on the internal empty template. 
* Author: Tri
* Tags: 
*/


model multiplayer

import "import/main_model.gaml"

global{
	string output_path <- "../output/";
	file shape_file_provinces <- file('../includes/maroc_2012.shp');
	int end_date <- 10000;
	bool is_benchmark <- false;
	string vision <- "sonar";
	list<string> companies_default_names <- ["Gogle","Aple","Facebok","Amazn","Microft"];
	list<string> owners_default_names <- ["Elon M.","Brad Pitt","Marie Curie","Minnie Mouse","Anonymous"];
	int nb_trawlers <- 0;
	int max_companies <- 5;
	int nb_companies <- 0;
	bool is_multiplayer <- true;
	list<float> capture_by_company <- list_with(max_companies,0.0);
	list<float> profit_by_company <- list_with(max_companies,0.0);
	list<rgb> companies_color <- list_with(max_companies,rnd_color(255));
	
	init{
		ask gama {
			pref_experiment_ask_closing <- false;
		}
		do init_sim;
	}
	
	
	action create_company(string id_player_input, string comp_name, string owner_name){
		map<string, unknown> json;
		if length(company) < max_companies{
			create company{
				capital <- 100000.0;
				id <- int(self);
				id_player <- id_player_input;
				name <- comp_name;	
				owner <- owner_name;
				homeport <- one_of(port);
				color <- companies_color[id];
				do create_boat;
				nb_companies <- nb_companies + 1;
			}
			json[id_player_input] <- ["type_info"::"init","name"::comp_name,"owner"::owner_name];
			
		}else{
			json[id_player_input] <- ["type_info"::"message","content"::"Cannot create company "+name+". Too many companies on the market."];
		}
		ask gama {
			do send message: to_json(json);
		}
	}
	
	
	
	action remove_company(company c){
		ask c.fleet{
			do die;
		}
		c.active <- false;
	}
	
	action buy_boat(string cid){
		ask first(company where (each.id_player=cid)){
			write company collect(each.id_player);
			do buy_boat;
		}
	}
	
	action sell_boat(string cid){
		ask first(company where (each.id_player=cid)){
			do sell_boat;
		}
	}
	
	reflex send_info {
		
		map<string, unknown> json;
		list<map> contents;
		loop player over:company {
			if(player.active){
				map<string,unknown> info_json;
				map<string,unknown> contents_json;
				map<string, unknown> status_json;
				status_json["income"] <- player.income;
				status_json["capture"] <- player.capture;
				status_json["maintenance_cost"] <- player.maintenance_cost;
				status_json["capital"] <- player.capital;
				status_json["fleet_size"] <- length(player.fleet);
				contents_json["contents"] <- status_json;
				contents_json['type'] <- "status";
				info_json["id"] <- [player.id];
				info_json["contents"] <- contents_json;		
				contents <+ info_json;			
			}
		}
		json["contents"] <- contents;
		ask gama {
			do send message: to_json(json);
		}
	}
	
	reflex stats{
		loop i from: 0 to: max_companies - 1{
			capture_by_company[i] <- (i=0?0:capture_by_company[i-1]) - 0.0001; // to stack curves
			capture_by_company[i] <- capture_by_company[i] 
								+(company(i)!=nil?mean(company(i).capture_history):0);
			profit_by_company[i] <- company(i)=nil?0:
				(mean(company(i).income_history)-mean(company(i).maintenance_history));
		}
	}
}





species company{
	string id_player;
	int id;
	bool active <- true;
	string name <- "World Co.";
	list<boat> fleet <- [];
	string owner <- "Elon M.";
	float capture -> sum(fleet collect(each.capture));
	list<float> capture_history <- [];
	float income -> sum(fleet collect(each.sales_income));
	list<float> income_history <- [];
	float maintenance_cost -> sum(fleet collect(each.maintenance_cost));
	list<float> maintenance_history <- [];
	float capital;
	rgb color <- rnd_color(255);
	port homeport;
	
	
	reflex update{
		if (active){
			capture_history <- last(sliding_window,capture_history+capture);
			income_history <- last(sliding_window,income_history+income);
			maintenance_history <- last(sliding_window,maintenance_history+maintenance_cost);
		}
	}
	
	
	action create_boat {
		create trawler{
			my_company <- myself.id;
			color <- myself.color;
			homeport <- myself.homeport;
			location <- any_location_in(homeport);
			myself.fleet << self;
			color <- myself.color;
		}
	}
	
	action buy_boat {
		map<string, unknown> json;
		if active{
			if capital > buy_price{
				capital <- capital - buy_price;
				do create_boat;
			}
		}
	}
	
	
	action sell_boat{
		map<string, unknown> json;
		trawler t <- one_of(trawler where (each.my_company=id));
		if t!=nil{
			capital <- capital + sell_price;
			ask t {do die;}
			nb_trawlers <- nb_trawlers - 1;
		}
	}
}





experiment Multiplayer type: gui autorun: false {
	parameter name: 'User name:' var: game_name  category: 'Game (Master)' on_change: {if cycle = 0 {output_file <- world.get_output_file();}do update_outputs();};
	parameter name: 'Current company:' var: objective category: 'Game (Master)' on_change: {do update_outputs();};
	user_command "Buy ship     (-1000 \u01e4)" category: "Game" color: fish_stock_color when: (cycle<end_date-no_buy_duration) {if capital>1000 {nb_trawlers <- nb_trawlers+1;capital <- capital-1000;}}
	user_command "Sell ship      (+600 \u01e4)" category: "Game" color: rgb(231,76,60) when: (cycle<end_date-no_buy_duration){if nb_trawlers > 0 {nb_trawlers <- nb_trawlers-1; capital <- capital+600;}}
	parameter name: "Font size" var: my_font_size min: 6 max: 26 on_change: {do update_outputs();} category: 'Display';
//	parameter name: "Point of view" var: vision init: "sonar" category: 'Display' among: ['heatmap','sonar','fade','stock'] on_change: {do update_outputs();};
	parameter name: 'Show trails' var: show_trails  category: 'Display';
	float overlay_rel_width <- 0.62;
	float overlay_rel_height <- 0.25;
	
	action create_player(string id_player) {
		ask world {
			do create_company(id_player, one_of(companies_default_names - company collect(each.name)),one_of(owners_default_names - company collect(each.name)));	
		}
	}
	
	action remove_player(string cid) {
		ask world {
			do remove_company(first(company where (each.id_player=cid)));
		}
	}
	
		
	output {
		layout horizontal([0::140,vertical([1::100,2::100])::100]) tabs: true;
		display 'Provinces' type: 3d background: rgb(47,47,47)  toolbar: false refresh: every(1#cycle){
	//		grid cell border: #black;
			species provinces aspect: base ;
			species sardine aspect: base ;
			species seiner;
			species trawler;
			species sonar;
			species port;
			species company;
			
			overlay position: { world.shape.width*0.4, world.shape.height*1.05} size: {overlay_rel_width,overlay_rel_height} background: rgb(44,62,80) transparency: 0.2 border: #black rounded: true
            {
            	float overlay_width <- world.shape.width*overlay_rel_width;
    			float overlay_height <- world.shape.height*overlay_rel_height;
            	if cycle = 0{
            		if game_name = "Enter your name"{
            			draw "Enter your name\n(on left panel)" anchor: #center at: {overlay_width/2,overlay_height/3} color: #white font: font("SansSerif", 2*my_font_size, #bold);
            		}else{
            			draw "Welcome "+game_name anchor: #center at: {overlay_width/2,overlay_height*0.3} color: #white font: font("SansSerif", 1.5*my_font_size, #bold);
            			draw "Your objective: "+objective anchor: #center at: {overlay_width/2,overlay_height*0.7} color: #white font: font("SansSerif", 1.5*my_font_size, #bold);
            		}
           		}else{
            		draw "Capture: "+compute_score(total_capture)+"Tons (income: "+trunc(price*capture,1)+" per day)" 
            			at: {0.05*overlay_width,0.2*overlay_height} anchor: #left_center color: objective="Maximize capture"?score_color:#white font: font("SansSerif", my_font_size, #bold);
	            	draw "Capital: "+compute_score(capital)+"\u01e4" at: {0.05*overlay_width,0.5*overlay_height} anchor: #left_center color: objective="Maximize capture"?#white:score_color font: font("SansSerif", my_font_size, #bold);
	            	draw "Ships: "+nb_trawlers+" (cost: "+fleet_maintenance_cost+" \u01e4 per day)" 
	            		at: {0.05*overlay_width,0.8*overlay_height} anchor: #left_center color: cycle<end_date-no_buy_duration?#white:rgb(30,30,30) font: font("SansSerif", my_font_size, #bold); 		
            	}
            }		
		}
		display  Capture refresh: every(10#cycle) type: 2d  background: #black toolbar: false{
			chart name: 'Daily capture' type: series style: area background: rgb(47,47,47) color: #white title_font:"SansSerif" {
				loop i from: 0 to: max_companies-1{
					data legend: string(i) value: capture_by_company[i]  color: companies_color[i] thickness: 2 marker: false;
 				}
			}
		}
		display  "Fishery results" refresh: every(10#cycle) type: 2d  background: #black toolbar: false{
			chart name: 'Net profit, fleet size' type: series background: rgb(47,47,47) color: #white title_font:"SansSerif" {
				loop i from: 0 to: max_companies-1{
					data legend: string(i) value: profit_by_company[i] color: companies_color[i] thickness: 2 marker: false;
				}
				data legend: '' value: 0 style: line color: #grey line_visible: false marker: true marker_size: 0.1;
			}
		}			
	}
}

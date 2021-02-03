rlmon_obj_1={

    // The number of racks to be shown in One row of the screen.
    number_of_racks_in_row: 5,

    setup_nav_buttons: function() {
	var x;
	x = document.getElementsByClassName("rlmon-display-buttons");
	for (i = 0; i < x.length; i++) {
	    x[i].addEventListener("click", this.change_view);
	    x[i].corresponding_div = document.getElementById(x[i].id.replace('-button', '-div'));
	}
	// Need to populate the racks.
	// FIXME: replace the hardcoded JSON object by actually making
	//        a request and getting back the data.
	data_json = {
	    0: {
		'room_name': 'server room 1',
		'rack_list': {
		    0: {
			'rack_name': 'rack A',
			'machine_list': ['machine_001', 'machine_002', 'machine_003', 'machine_004', 'machine_005',
					 'machine_006', 'machine_007', 'machine_008', 'machine_009', 'machine_010']
		    },
		    1: {
			'rack_name': 'rack B',
			'machine_list': ['machine_011', 'machine_012', 'machine_013', 'machine_014', 'machine_015',
					 'machine_016', 'machine_017', 'machine_018', 'machine_019', 'machine_020']
		    },
		    2: {
			'rack_name': 'rack C',
			'machine_list': ['machine_021', 'machine_022', 'machine_023', 'machine_024', 'machine_025',
					 'machine_026', 'machine_027', 'machine_028', 'machine_029', 'machine_030']
		    },
		    3: {
			'rack_name': 'rack D',
			'machine_list': ['machine_031', 'machine_032', 'machine_033', 'machine_034', 'machine_035',
					 'machine_036', 'machine_037', 'machine_038', 'machine_039', 'machine_040']
		    },
		    4: {
			'rack_name': 'rack E',
			'machine_list': ['machine_041', 'machine_042', 'machine_043', 'machine_044', 'machine_045',
					 'machine_046', 'machine_047', 'machine_048', 'machine_049', 'machine_050']
		    }
		}
	    }
	};

	this.populate_rack_view(data_json);
    },

    change_view: function(e) {
	var i, x;
	x = document.getElementsByClassName("rlmon-display-div");
	for (i = 0; i < x.length; i++) {
	    x[i].style.display = "none";
	}
	e.target.corresponding_div.style.display = "block";
	console.log(e);
    },

    populate_rack_view: function(data_json) {
	main_rack_div = document.getElementById("rack-disp");
	var i, j, k;
	var rack_group = null;

	for (i = 0; i < Object.keys(data_json).length; i++) {
	    // for each room
	    for (j = 0; j < Object.keys(data_json[i]['rack_list']).length; j++) {
		// for each rack.
		if (j%this.number_of_racks_in_row==0) {
		    // make a new rack group.
		    rack_group = document.createElement("div");
		    rack_group.classList.add('5-racks', 'w3-row-padding', 'w3-bottombar');
		}

		rack_object = document.createElement("div");
		rack_object.classList.add("w3-col", "w3-container", "w3-padding-small", "w3-border");
		rack_object.style.width=(100/this.number_of_racks_in_row).toString()+"%";
		ul_object = document.createElement("ul");
		ul_object.classList.add("w3-ul", "w3-border", "w3-center", "w3-small");

		// Name of the RACK
		li_object = document.createElement("li");
		li_object.classList.add("w3-large");
		li_object.innerHTML = data_json[i]['rack_list'][j]['rack_name'];
		ul_object.appendChild(li_object);

		// add machines to each rack.
		for (k = 0; k < data_json[i]['rack_list'][j]['machine_list'].length; k++) {
		    li_object = document.createElement("li");
		    li_object.rlmon_id = data_json[i]['rack_list'][j]['machine_list'][k];
		    li_object.rlmon_meta_data = null;
		    li_object.classList.add("w3-hover-shadow");
		    li_object.innerHTML = data_json[i]['rack_list'][j]['machine_list'][k];

		    meta_data_obj = document.createElement("div");
		    meta_data_obj.classList.add("w3-panel", "w3-green");
		    meta_data_obj.style.position = "absolute";
		    meta_data_obj.style.display = "none";
		    li_object.appendChild(meta_data_obj);

		    li_object.addEventListener("mouseover", this.show_meta_data_div);
		    li_object.addEventListener("mouseout", this.hide_meta_data_div);
		    ul_object.appendChild(li_object);
		}
		rack_object.appendChild(ul_object);

		rack_group.appendChild(rack_object);

		if (j%this.number_of_racks_in_row==0) {
		    main_rack_div.appendChild(rack_group);
		}
	    }
	}
    },

    show_meta_data_div: function(e) {
	meta_data_div = e.target.children[0];

	if (!("meta_data_json" in meta_data_div)) {
	    rlmon_obj_1.request_and_fill_data(meta_data_div);
	}

	meta_data_div.style.display = "flex";
    },

    hide_meta_data_div: function(e) {
	meta_data_div = e.target.children[0];
	meta_data_div.style.display = "none";
    },

    fill_meta_data: function(meta_data_div) {

	var i;

	main_div = document.createElement("div");
	main_div.classList.add("w3-section");

	values_to_disp = [{"name":"Machine name", "idx":"machine_name"},
			  {"name":"CPU usage", "idx":"CPU"},
			  {"name":"RAM usage", "idx":"RAM"}];

	for (i = 0; i < values_to_disp.length; i++) {
	    row_div = document.createElement("div");
	    row_div.classList.add("w3-row-padding", "w3-border");
	    name_idx_div = document.createElement("div");
	    name_idx_div.classList.add("w3-col", "w3-half");
	    name_idx_div.innerHTML = values_to_disp[i]["name"];
	    row_div.appendChild(name_idx_div);
	    name_val_div = document.createElement("div");
	    name_val_div.classList.add("w3-col", "w3-half");
	    name_val_div.innerHTML = meta_data_div.meta_data_json[values_to_disp[i]["idx"]];
	    row_div.appendChild(name_val_div);
	    main_div.appendChild(row_div)
	}

	meta_data_div.appendChild(main_div);
    },

    request_and_fill_data: function(meta_data_div) {
	// FIXME: request for data and fill after that.
	meta_data_json = {
	    "CPU": 30,
	    "RAM": 40,
	    "machine_name": "A-1"
	}

	meta_data_div.meta_data_json = meta_data_json
	this.fill_meta_data(meta_data_div);
    }
}

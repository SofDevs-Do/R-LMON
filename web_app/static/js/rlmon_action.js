navigation_selector_obj={

    backend_url: "http://127.0.0.1:8000",

    setup_nav_buttons: function() {
	var x;
	x = document.getElementsByClassName("rlmon-display-buttons");
	for (i = 0; i < x.length; i++) {
	    x[i].addEventListener("click", this.change_view);
	    x[i].corresponding_div = document.getElementById(x[i].id.replace('-button', '-div'));
	}

	// Add event listeners on change of dates, or the type of data to be used
	// for color coding the machines.
	document.getElementById("from-date-input").addEventListener("change", overview_page_obj.top_fun);
	document.getElementById("to-date-input").addEventListener("change", overview_page_obj.top_fun);
	document.getElementById("color-coding-selector").addEventListener("change", overview_page_obj.top_fun);

	// invoke the loading of data.
	overview_page_obj.top_fun(null);
    },

    change_view: function(e) {
	var i, x;
	x = document.getElementsByClassName("rlmon-display-div");
	for (i = 0; i < x.length; i++) {
	    x[i].style.display = "none";
	}
	e.target.corresponding_div.style.display = "block";
    }
}

overview_page_obj={
    // The number of racks to be shown in One row of the screen.
    number_of_racks_in_row: 5,

    values_to_disp: [{"name":"Machine name", "idx":"machine_name"},
		     {"name":"CPU usage", "idx":"CPU"},
		     {"name":"RAM usage", "idx":"RAM"}],

    top_fun: function(e) {
	// Need to populate the racks.
	from_date = document.getElementById("from-date-input").value;
	to_date = document.getElementById("to-date-input").value;
	color_coding_selector = document.getElementById("color-coding-selector").value;

	xhr_object = new XMLHttpRequest();
	xhr_object.onload = overview_page_obj.populate_rack_view_callback;
	xhr_object.open('GET', navigation_selector_obj.backend_url
			+ '/api/v2/overview-page-data/'
			+ color_coding_selector + '/'
			+ from_date +'/'
			+ to_date);
	xhr_object.send();
    },

    populate_rack_view_callback: function() {
	if(this.readyState == 4 && this.status == 200)
	{
	    var res = this.responseText;
	    var res_json = JSON.parse(res);
	    overview_page_obj.populate_rack_view(res_json);
	}
    },

    populate_rack_view: function(data_json) {
	main_rack_div = document.getElementById("rack-disp");
	main_rack_div.innerHTML = "";
	var i, j, k;
	var rack_group = null;

	for (let i in data_json) {
	    // for each room
	    j_idx = 0;
	    for (let j in data_json[i]['rack_list']) {
		// for each rack.
		if (j_idx%this.number_of_racks_in_row==0) {
		    // make a new rack group.
		    rack_group = document.createElement("div");
		    rack_group.classList.add('5-racks', 'w3-row-padding');
		}

		rack_object = document.createElement("div");
		rack_object.classList.add("w3-col", "w3-container", "w3-padding-small", "w3-border-black");
		rack_object.style.width=(100/this.number_of_racks_in_row).toString()+"%";
		ul_object = document.createElement("ul");
		ul_object.classList.add("w3-ul", "w3-center", "w3-tiny");

		// Name of the RACK
		li_object = document.createElement("li");
		li_object.classList.add("w3-medium", "w3-border-black");
		li_object.innerHTML = j;
		ul_object.appendChild(li_object);

		// add machines to each rack.
		// for (k = 0; k < data_json[i]['rack_list'][j]['machine_list'].length; k++) {
		for (let k in data_json[i]['rack_list'][j]['machine_list']) {
		    li_object = document.createElement("li");
		    li_object.rlmon_id = data_json[i]['rack_list'][j]['machine_list'][k]["_id"];
		    li_object.classList.add("w3-hover-shadow", "w3-border-black");
		    li_object.innerHTML = data_json[i]['rack_list'][j]['machine_list'][k]["_id"];

		    value = data_json[i]['rack_list'][j]['machine_list'][k]["value"];
		    if ((value >= 0) && (value < 25)) {
			li_object.classList.add("w3-deep-orange");
		    }
		    else if ((value >= 25) && (value < 50)) {
			li_object.classList.add("w3-amber");
		    }
		    else if ((value >= 50) && (value < 75)) {
			li_object.classList.add("w3-light-green");
		    }
		    else if ((value >= 75) && (value < 100)) {
			li_object.classList.add("w3-green");
		    }
		    else {
			li_object.classList.add("w3-black");
		    }

		    meta_data_obj = document.createElement("div");
		    meta_data_obj.classList.add("w3-panel", "w3-dark-gray", "w3-hover-shadow");
		    meta_data_obj.style.position = "absolute";
		    meta_data_obj.style.display = "none";
		    meta_data_obj.meta_data_added = false;
		    li_object.appendChild(meta_data_obj);

		    li_object.addEventListener("mouseover", this.show_meta_data_div_timer);
		    li_object.addEventListener("mouseout", this.hide_meta_data_div);
		    li_object.addEventListener("click", machine_details_obj.change_view);

		    ul_object.appendChild(li_object);
		}
		rack_object.appendChild(ul_object);

		rack_group.appendChild(rack_object);

		if (j_idx%this.number_of_racks_in_row==0) {
		    main_rack_div.appendChild(rack_group);
		}
		j_idx = j_idx + 1;
	    }
	}
    },

    show_meta_data_div_timer: function(e) {
	e.target.hover_timer = setTimeout(function() {
	    overview_page_obj.show_meta_data_div(e);
	}, 300);
    },

    show_meta_data_div: function(e) {
	meta_data_div = e.target.children[0];

	if (meta_data_div !== undefined) {
	    if (!meta_data_div.meta_data_added) {
		overview_page_obj.request_and_fill_data(meta_data_div);
	    }
	    else {
		// NOTE: sometimes the data doesn't show up. Need
		// to figure out why. This is an interim solution.
		meta_data_div.innerHTML = "";
		overview_page_obj.fill_meta_data(meta_data_div);
	    }

	    meta_data_div.style.display = "flex";
	}
    },

    hide_meta_data_div: function(e) {
	clearTimeout(e.target.hover_timer);
	meta_data_div = e.target.children[0];
	if (meta_data_div !== undefined) {
	    meta_data_div.style.display = "none";
	}
    },

    fill_meta_data: function(meta_data_div) {

	var i;

	main_div = document.createElement("div");
	main_div.classList.add("w3-section");

	for (i = 0; i < this.values_to_disp.length; i++) {
	    row_div = document.createElement("div");
	    row_div.classList.add("w3-row-padding", "w3-border");
	    name_idx_div = document.createElement("div");
	    name_idx_div.classList.add("w3-col", "w3-half");
	    name_idx_div.innerHTML = this.values_to_disp[i]["name"];
	    row_div.appendChild(name_idx_div);
	    name_val_div = document.createElement("div");
	    name_val_div.classList.add("w3-col", "w3-half");
	    name_val_div.innerHTML = meta_data_div.meta_data_json[this.values_to_disp[i]["idx"]];
	    row_div.appendChild(name_val_div);
	    main_div.appendChild(row_div)
	}

	meta_data_div.appendChild(main_div);
    },

    request_and_fill_data: function(meta_data_div) {
	// FIXME: replace the dummy request with a proper request to the
	//        backend.

	xhr_object = new XMLHttpRequest();
	xhr_object.onload = this.populate_meta_data;
	xhr_object.meta_data_div = meta_data_div;
	xhr_object.open('GET', navigation_selector_obj.backend_url+'/api/dev/test/v2');
	xhr_object.send();
    },

    populate_meta_data: function() {
	if(this.readyState == 4 && this.status == 200)
	{
	    var res = this.responseText;
	    var res_json = JSON.parse(res);
	    this.meta_data_div.meta_data_json = res_json;
	    this.meta_data_div.meta_data_added = true;
	    overview_page_obj.fill_meta_data(this.meta_data_div);
	}
    }
}


machine_details_obj={
    change_view: function(e) {
	var i, x;
	x = document.getElementsByClassName("rlmon-display-div");
	for (i = 0; i < x.length; i++) {
	    x[i].style.display = "none";
	}
	document.getElementById("machine-details-div").style.display = "block";
	machine_details_obj.top_fun(e.target);
    },

    top_fun: function(machine_li_obj) {
	main_machine_details_div = document.getElementById("machine-details-div");
	main_machine_details_div.innerHTML = "machine ID: "+machine_li_obj.rlmon_id.toString();
    }
}

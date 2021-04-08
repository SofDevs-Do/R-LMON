navigation_selector_obj={

    prev_view : "machine-overview-data-div",

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
	document.getElementById("overview-page-display-data-selector").addEventListener("change", overview_page_obj.top_fun);

	// set the dates, and restrict the 'from date' field to a
	// month
	max_date = new Date(new Date().setDate(new Date().getDate()-1));
	week_back_date = new Date(new Date().setDate(new Date().getDate()-7));
	min_date = new Date(new Date().setDate(new Date().getDate()-30));

	document.getElementById("from-date-input").min = min_date.toISOString().substr(0, 10);
	document.getElementById("from-date-input").max = max_date.toISOString().substr(0, 10);
	document.getElementById("from-date-input").value = week_back_date.toISOString().substr(0, 10);
	document.getElementById("to-date-input").min = min_date.toISOString().substr(0, 10);
	document.getElementById("to-date-input").max = max_date.toISOString().substr(0, 10);
	document.getElementById("to-date-input").value = max_date.toISOString().substr(0, 10);

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
    order_of_view: "low-top",

    values_to_disp: [{"name":"Machine name", "idx":"machine_name"},
		     {"name":"CPU usage", "idx":"CPU"},
		     {"name":"RAM usage", "idx":"RAM"}],

    top_fun: function(e) {
	document.getElementById("rack-view-button").addEventListener("click", overview_page_obj.populate_rack_view);
	document.getElementById("graph-view-button").addEventListener("click", overview_page_obj.populate_graph_view);

	overview_page_obj.update_legend();

	// Need to populate the racks.
	from_date = document.getElementById("from-date-input").value;
	to_date = document.getElementById("to-date-input").value;
	color_coding_selector = document.getElementById("color-coding-selector").value;

	xhr_object = new XMLHttpRequest();
	xhr_object.onload = overview_page_obj.get_machine_overview_data_callback;
	xhr_object.open('GET', server_details.web_server_ip
			+ '/api/v2/overview-page-data/'
			+ color_coding_selector + '/'
			+ from_date +'/'
			+ to_date);
	xhr_object.send();

	if (document.getElementById("color-coding-selector").value == "Last login") {
	    document.getElementById("from-date-input").disabled = true;
	    document.getElementById("to-date-input").disabled = true;
	}
	else {
	    document.getElementById("from-date-input").disabled = false;
	    document.getElementById("to-date-input").disabled = false;
	}
    },

    get_machine_overview_data_callback: function() {
	if(this.readyState == 4 && this.status == 200)
	{
	    var res = this.responseText;
	    var data_json = JSON.parse(res);
	    overview_page_obj.data_json = data_json;
	    flattened_data_json = [];

	    for (let i in data_json) {
		for (let j in data_json[i]['rack_list']) {
		    for (let k in data_json[i]['rack_list'][j]['machine_list']) {
			to_add = data_json[i]['rack_list'][j]['machine_list'][k];
			flattened_data_json.push(to_add);
		    }
		}
	    }

	    if (document.getElementById("color-coding-selector").value == "CPU utilization" ||
		document.getElementById("color-coding-selector").value == "RAM utilization") {
		overview_page_obj.flattened_data_json = flattened_data_json.sort(
		    function(a, b) {
			return a["value"] - b["value"];
		    });
	    }
	    else {
		overview_page_obj.flattened_data_json = flattened_data_json.sort(
		    function(a, b) {
			if (a["value"] != null && b["value"] != null)
			    return (new Date(Date.parse(a["value"]))) - (new Date(Date.parse(b["value"])));
			else {
			    if (a["value"] == null)
				return -1;
			    else
				return 1
			}
		    });
	    }

	    overview_page_obj.refresh_vidualization();
	}
    },

    refresh_vidualization: function() {
	if (document.getElementById("machine-graph-disp").style.display != "none") {
	    overview_page_obj.populate_graph_view(null);
	}
	else {
	    overview_page_obj.populate_rack_view(null);
	}
    },

    toggle_sorted_view: function(e) {
	if (overview_page_obj.order_of_view != "low-top") {
	    overview_page_obj.order_of_view = "low-top";
	}
	else {
	    overview_page_obj.order_of_view = "high-top";
	}
	ul_object = document.getElementById("machine-graph-sorted-view-list-div");
	overview_page_obj.populate_sorted_graph_view(ul_object);
	if (document.getElementById("color-coding-selector").value == "CPU utilization" ||
	    document.getElementById("color-coding-selector").value == "RAM utilization") {
	    graph_canvas_div = document.getElementById("machine-graph-graph-canvas");
	    overview_page_obj.populate_bar_graph_view(graph_canvas_div);
	}
    },

    populate_graph_view: function(e) {
	document.getElementById("machine-rack-disp").style.display = "none";
	main_graph_div = document.getElementById("machine-graph-disp");
	main_graph_div.style.display = "block";
	main_graph_div.innerHTML = "";
	graph_view_div = document.createElement("div");
	graph_view_div.id = "machine-graph-disp-inner-div";
	graph_view_div.classList.add("w3-row-padding", "w3-container", "w3-padding-small");
	ul_object = document.createElement("ul");
	ul_object.id = "machine-graph-sorted-view-list-div";
	ul_object.classList.add("w3-ul", "w3-center", "w3-tiny", "w3-col");
	ul_object.style.width=(100/overview_page_obj.number_of_racks_in_row).toString()+"%";
	graph_canvas_div = document.createElement("div");
	graph_canvas_div.id = "machine-graph-graph-canvas";
	graph_canvas_div.classList.add("w3-tiny", "w3-col");
	graph_canvas_div.style.width=(100-(100/overview_page_obj.number_of_racks_in_row)).toString()+"%";
	graph_view_div.appendChild(ul_object);
	graph_view_div.appendChild(graph_canvas_div);
	main_graph_div.appendChild(graph_view_div);
	overview_page_obj.populate_sorted_graph_view(ul_object);
	if (document.getElementById("color-coding-selector").value == "CPU utilization" ||
	    document.getElementById("color-coding-selector").value == "RAM utilization") {
	    overview_page_obj.populate_bar_graph_view(graph_canvas_div);
	}
    },

    populate_bar_graph_view: function(graph_canvas_div) {
	graph_canvas_div.innerHTML = "";
	labels = []
	data_points = []
	flattened_data_json = overview_page_obj.flattened_data_json.slice(0);

	if (overview_page_obj.order_of_view != "low-top") {
	    flattened_data_json = flattened_data_json.reverse();
	}

	p_object = document.createElement("p");
	p_object.classList.add("w3-medium");
	p_object.innerHTML = document.getElementById("color-coding-selector").value + " graph";
	graph_canvas_div.appendChild(p_object);
	graph_canvas = document.createElement("canvas");
	graph_canvas_div.appendChild(graph_canvas);

	for (let i in flattened_data_json) {
	    labels.push(flattened_data_json[i]["_id"]);
	    if (flattened_data_json[i]["value"] > 0)
		data_points.push(flattened_data_json[i]["value"]);
	    else
		data_points.push(0);
	}

	Chart.defaults.global.defaultFontColor = 'black';
	ctx = graph_canvas.getContext('2d');
	ctx.font = "semibold 20px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
	bar_graph = new Chart(ctx, {
	    type: 'horizontalBar',
	    title: document.getElementById("color-coding-selector").value + " graph",
	    data: {
		labels: labels,
		datasets: [{
		    data: data_points,
		    backgroundColor: 'rgb(255, 87, 34)',
		}]
	    },
	    options: {
		legend: {
		    display: false
		},
		scales: {
		    xAxes: [{
			ticks: {
			    suggestedMin: 0,
			    suggestedMax: 100
			}
		    }]
		}
	    },
	});

    },

    populate_sorted_graph_view: function(ul_object) {
	ul_object.innerHTML = "";
	flattened_data_json = overview_page_obj.flattened_data_json.slice(0);
	coloring_function = null;
	sorted_text = "Sort descending";
	var disp_data_input_string = document.getElementById("overview-page-display-data-selector").value;
	var disp_data_based_on_key = overview_page_obj.get_backend_key_from_disp_string(disp_data_input_string);

	// different coloring functions based on the data requested by the user.
	if (document.getElementById("color-coding-selector").value == "CPU utilization" ||
	    document.getElementById("color-coding-selector").value == "RAM utilization") {
	    coloring_function = overview_page_obj.color_machines_based_on_cpu_ram_data;
	}
	else {
	    coloring_function = overview_page_obj.color_machines_based_on_last_login_data;
	}

	if (overview_page_obj.order_of_view != "low-top") {
	    flattened_data_json = flattened_data_json.reverse();
	    sorted_text = "Sort ascending";
	}

	li_object = document.createElement("li");
	li_object.classList.add("w3-medium", "w3-border-black", "w3-gray", "w3-hover-shadow");
	li_object.style.cursor = "pointer";
	li_object.innerHTML = sorted_text;
	li_object.addEventListener("click", overview_page_obj.toggle_sorted_view);
	ul_object.appendChild(li_object);

	for (let i in flattened_data_json) {
	    li_object = document.createElement("li");
	    li_object.rlmon_id = flattened_data_json[i]["_id"];
	    li_object.classList.add("w3-hover-shadow", "w3-border-black");
	    li_object.style.cursor = "pointer";
	    value = flattened_data_json[i]["value"];
	    if (document.getElementById("color-coding-selector").value == "CPU utilization" ||
		document.getElementById("color-coding-selector").value == "RAM utilization") {
		if (value > 0)
		    li_object.innerHTML = flattened_data_json[i][disp_data_based_on_key] + ": " + value.toFixed(2);
		else
		    li_object.innerHTML = flattened_data_json[i][disp_data_based_on_key] + ": " + 0;
	    }
	    else {
		li_object.innerHTML = flattened_data_json[i][disp_data_based_on_key] + ": " + value;
	    }
	    li_object.addEventListener("click", machine_details_obj.change_view);
	    coloring_function(value, li_object);
	    ul_object.appendChild(li_object);
	}
    },

    get_backend_key_from_disp_string: function(disp_string) {
	if (disp_string == "Machine name")
	    return "_id";
	if (disp_string == "Prof in-charge")
	    return "assigned_to";
	if (disp_string == "Student")
	    return "student_assigned_to";
	if (disp_string == "IP Address")
	    return "ip_addr";
	if (disp_string == "OS Distribution")
	    return "os_info";
	if (disp_string == "CPU Model")
	    return "cpu_model";
	if (disp_string == "RAM Capacity")
	    return "ram_capacity";
	return "no_key";
    },

    populate_rack_view: function(e) {
	document.getElementById("machine-graph-disp").style.display = "none";
	main_rack_div = document.getElementById("machine-rack-disp");
	main_rack_div.style.display = "block";
	main_rack_div.innerHTML = "";
	data_json = overview_page_obj.data_json;
	var i, j, k;
	var rack_group = null;
	var no_data = false;
	coloring_function = null;
	var num_machines = 0, num_racks = 0;
	var disp_data_input_string = document.getElementById("overview-page-display-data-selector").value;
	var disp_data_based_on_key = overview_page_obj.get_backend_key_from_disp_string(disp_data_input_string);

	// different coloring functions based on the data requested by the user.
	if (document.getElementById("color-coding-selector").value == "CPU utilization" ||
	    document.getElementById("color-coding-selector").value == "RAM utilization") {
	    coloring_function = overview_page_obj.color_machines_based_on_cpu_ram_data;
	}
	else {
	    coloring_function = overview_page_obj.color_machines_based_on_last_login_data;
	}


	for (let i in data_json) {
	    // for each room
	    j_idx = 0;
	    for (let j in data_json[i]['rack_list']) {
		// for each rack.
		if (j_idx%overview_page_obj.number_of_racks_in_row==0) {
		    // make a new rack group.
		    rack_group = document.createElement("div");
		    rack_group.classList.add('5-racks', 'w3-row-padding');
		}

		rack_object = document.createElement("div");
		num_racks += 1;
		rack_object.classList.add("w3-col", "w3-container", "w3-padding-small", "w3-border-black");
		rack_object.style.width=(100/overview_page_obj.number_of_racks_in_row).toString()+"%";
		ul_object = document.createElement("ul");
		ul_object.classList.add("w3-ul", "w3-center", "w3-tiny");

		// Name of the RACK
		li_object = document.createElement("li");
		li_object.classList.add("w3-medium", "w3-border-black");
		li_object.innerHTML = j;
		ul_object.appendChild(li_object);

		// add machines to each rack.
		for (let k in data_json[i]['rack_list'][j]['machine_list']) {
		    no_data = false;
		    li_object = document.createElement("li");
		    num_machines += 1;
		    li_object.rlmon_id = data_json[i]['rack_list'][j]['machine_list'][k]["_id"];
		    li_object.classList.add("w3-hover-shadow", "w3-border-black");
		    li_object.style.cursor = "pointer";
		    li_object.innerHTML = data_json[i]['rack_list'][j]['machine_list'][k][disp_data_based_on_key];

		    value = data_json[i]['rack_list'][j]['machine_list'][k]["value"];
		    no_data = coloring_function(value, li_object);

		    meta_data_obj = document.createElement("div");
		    meta_data_obj.classList.add("w3-panel", "w3-dark-gray", "w3-hover-shadow");
		    meta_data_obj.style.position = "absolute";
		    meta_data_obj.style.display = "none";
		    meta_data_obj.meta_data_added = false;
		    li_object.appendChild(meta_data_obj);

		    if (!no_data) {
			li_object.addEventListener("mouseover", overview_page_obj.show_meta_data_div_timer);
			li_object.addEventListener("mouseout", overview_page_obj.hide_meta_data_div);
		    }
		    li_object.addEventListener("click", machine_details_obj.change_view);

		    ul_object.appendChild(li_object);
		}
		rack_object.appendChild(ul_object);

		rack_group.appendChild(rack_object);

		if (j_idx%overview_page_obj.number_of_racks_in_row==0) {
		    main_rack_div.appendChild(rack_group);
		}
		j_idx = j_idx + 1;
	    }
	}
	document.getElementById("number-of-racks").innerHTML = num_racks;
	document.getElementById("number-of-machines").innerHTML = num_machines;
    },

    update_legend: function() {
	legend_key = document.getElementById("color-coding-selector").value;

	if (legend_key == "CPU utilization" || legend_key == "RAM utilization") {
	    document.getElementById("unit-of-bins").innerHTML = "colour code based on usage %";
	    document.getElementById("legend-div-1").innerHTML = "0-24%";
	    document.getElementById("legend-div-2").innerHTML = "25-49%";
	    document.getElementById("legend-div-3").innerHTML = "50-74%";
	    document.getElementById("legend-div-4").innerHTML = "74-100%";
	}
	else {
	    document.getElementById("unit-of-bins").innerHTML = "colour code based on most recent last login date being in the rage:";
	    document.getElementById("legend-div-1").innerHTML = ">4w";
	    document.getElementById("legend-div-2").innerHTML = "3w";
	    document.getElementById("legend-div-3").innerHTML = "2w";
	    document.getElementById("legend-div-4").innerHTML = "1w";
	}
    },

    color_machines_based_on_cpu_ram_data: function(value, li_object) {
	no_data = false;
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
	    no_data = true;
	}
	return no_data;
    },

    color_machines_based_on_last_login_data: function(value, li_object) {
	no_data = false;
	today = new Date(new Date().setDate(new Date().getDate()));
	one_week_back_date = new Date(new Date().setDate(new Date().getDate()-7));
	two_week_back_date = new Date(new Date().setDate(new Date().getDate()-14));
	three_week_back_date = new Date(new Date().setDate(new Date().getDate()-21));
	four_week_back_date = new Date(new Date().setDate(new Date().getDate()-28));

	value_date = new Date(Date.parse(value));

	if (value_date < three_week_back_date) {
	    li_object.classList.add("w3-deep-orange");
	}
	else if (value_date < two_week_back_date) {
	    li_object.classList.add("w3-amber");
	}
	else if (value_date < one_week_back_date) {
	    li_object.classList.add("w3-light-green");
	}
	else if (value_date <= today ) {
	    li_object.classList.add("w3-green");
	}
	else {
	    li_object.classList.add("w3-black");
	    no_data = true;
	}
	return no_data;
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
	from_date = document.getElementById("from-date-input").value;
	to_date = document.getElementById("to-date-input").value;
	color_coding_selector = document.getElementById("color-coding-selector").value;

	xhr_object = new XMLHttpRequest();
	xhr_object.onload = this.populate_meta_data;
	xhr_object.meta_data_div = meta_data_div;
	xhr_object.open('GET', server_details.web_server_ip
			+ '/api/v2/overview-machine-meta-data/'
			+ meta_data_div.parentElement.rlmon_id + '/'
			+ from_date + '/'
			+ to_date);
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

	// set the dates, and restrict the 'from date' field to a
	// month
	max_date = new Date(new Date().setDate(new Date().getDate()-1));
	week_back_date = new Date(new Date().setDate(new Date().getDate()-7));
	min_date = new Date(new Date().setDate(new Date().getDate()-30));

	document.getElementById("from-date-input-md").min = min_date.toISOString().substr(0, 10);
	document.getElementById("from-date-input-md").max = max_date.toISOString().substr(0, 10);
	document.getElementById("from-date-input-md").value = week_back_date.toISOString().substr(0, 10);
	document.getElementById("to-date-input-md").min = min_date.toISOString().substr(0, 10);
	document.getElementById("to-date-input-md").max = max_date.toISOString().substr(0, 10);
	document.getElementById("to-date-input-md").value = max_date.toISOString().substr(0, 10);

	// invoke the loading of data.
	machine_details_obj.top_fun(e.target);
    },

    top_fun: function(machine_li_obj) {
	//main_machine_details_div = document.getElementById("machine-details-div");
	// main_machine_details_div.innerHTML = "machine ID: "+machine_li_obj.rlmon_id.toString();

	machine_details_obj.request_and_fill_mach_col_data(machine_li_obj.rlmon_id.toString());
	machine_details_obj.fill_date_dependent_data(machine_li_obj.rlmon_id.toString());
	// machine_details_obj.populate_avg_disk_data({});

	var machine_id = machine_li_obj.rlmon_id.toString();

	var reboot_button = document.getElementById("reboot-button");
	reboot_button.onclick = function() {machine_details_obj.reboot_button_action(machine_id)};

	var syslog_button = document.getElementById("syslog-button");
	syslog_button.onclick = function() {machine_details_obj.syslog_button_action(machine_id)};

	var from_date_inp = document.getElementById("from-date-input-md");
	from_date_inp.onchange = function() {machine_details_obj.fill_date_dependent_data(machine_id)};
	var to_date_inp = document.getElementById("to-date-input-md");
	to_date_inp.onchange = function() {machine_details_obj.fill_date_dependent_data(machine_id)};
    },

    fill_date_dependent_data: function(machine_id) {
	machine_details_obj.request_and_fill_avg_cpu_ram_data(machine_id);
	machine_details_obj.request_and_fill_disk_info(machine_id);
	machine_details_obj.request_cpu_ram_utilization_data(machine_id);
    },

    syslog_button_action: function(machine_id) {
	document.getElementById('syslog_modal').style.display='block';
	document.getElementById('syslog_modal_content').innerHTML += "<p>Syslog output will come here!</p>";
    },

    reboot_button_action: function(machine_id) {
	// console.log(machine_id);
	if (confirm("Confirm reboot of the system!")){
	    // console.log("rebooting");
	    xhr_object = new XMLHttpRequest();
	    xhr_object.onload = this.reboot_done;
	    endpoint = server_details.web_server_ip + '/api/v2/machine-ctrl/' + machine_id + '/' + 'reboot';
	    xhr_object.open('POST', endpoint);
	    xhr_object.send();

	}
	else {
	    console.log("Reboot cancelled");
	}
    },

    reboot_done: function() {
	console.log("reboot done!");
    },

    request_and_fill_disk_info: function(machine_id) {
	var from_date = document.getElementById("from-date-input-md").value;
	var to_date = document.getElementById("to-date-input-md").value;
	xhr_object = new XMLHttpRequest();
	xhr_object.onload = this.get_disk_info;
	endpoint = server_details.web_server_ip + '/api/v2/machine-details-disk-info/' + machine_id + '/' + from_date + '/' + to_date;
	xhr_object.open('GET', endpoint);
	xhr_object.send();
    },

    get_disk_info: function() {
	if(this.readyState == 4 && this.status == 200)
	{
	    var res = this.responseText;
	    var res_json = JSON.parse(res);
	    machine_details_obj.populate_avg_disk_data(res_json);
	}
    },

    populate_avg_disk_data: function(avg_disk_data) {
	var fs_list = Object.keys(avg_disk_data);
	var color_list = ['rgba(54, 255, 55, 1)', 'rgba(254, 255, 55, 1)', 'rgba(28, 129, 165, 1)', 'rgba(121, 0, 74, 1)', 'rgba(135, 69, 74, 1)', 'rgba(135, 69, 239, 1)', 'rgba(135, 208, 239, 1)', 'red', 'rgba(255, 99, 71, 1)', 'rgba(233, 115, 132, 1)'];
	var cntr ;
	var total_disk_space = 0;
	var used_disk_space = 0;
	var datasets = [];
	var dataset = {};
	var labels_disk = [];
	for(cntr=0; cntr < fs_list.length; cntr++) {
	    dataset = {};
	    total_disk_space += parseFloat(avg_disk_data[fs_list[cntr]]['total_GB']);
	    used_disk_space += avg_disk_data[fs_list[cntr]]['avg_used_GB'];
	    dataset['data'] = [used_disk_space, total_disk_space - used_disk_space];
	    dataset['backgroundColor'] = [color_list[cntr], 'transparent'];
	    dataset['borderColor'] = ['rgba(54, 162, 255, 0.2)', 'rgba(54, 162, 235, 0.2)'];
	    datasets.push(dataset);
	    labels_disk.push(avg_disk_data[fs_list[cntr]]['mounted_on']+"-utilized");
	    labels_disk.push("Un-utilized Disk space");
	}
	// console.log(labels_disk);
	var avg_disk_util_val = ((used_disk_space*100)/total_disk_space).toFixed(2);
	var avg_disk_util_data = {
	    datasets: [{
		data: [used_disk_space, total_disk_space - used_disk_space],
		backgroundColor: ['rgba(138, 92, 116, 1)', 'transparent'],
		borderColor: ['rgba(54, 162, 255, 0.2)', 'rgba(54, 162, 235, 0.2)']
	    }],
	    labels: ['Avg Disk utilized (in GB)', 'Avg Disk Un-utilized (in GB)']
	};

	var ctx = document.getElementById("avg-disk-overall-util-doughnut-chart-canvas");
	var avg_disk_util_donoughnut_chart = new Chart(ctx, {
	    type: 'doughnut',
	    data: avg_disk_util_data,
	    options: {
		responsive: true,
		cutoutPercentage: 60,
		legend: false,
		tooltips: { bodyFontSize: 7},
		title: {
		    display: true,
		    text: 'Average Disk Utilization'
		},
	    }
	});
	// var avg_disk_util_data = {
	//     datasets: datasets,
	//     labels: ['Avg Disk utilized (in GB)', 'Avg Disk Un-utilized (in GB)']
	// };

	// var ctx_disk = document.getElementById("avg-disk-util-doughnut-chart-canvas");
	// var avg_disk_util_donoughnut_chart = new Chart(ctx_disk, {
	//     type: 'doughnut',
	//     data: avg_disk_util_data,
	//     options: {
	// 	responsive: true,
	// 	cutoutPercentage: 60,
	// 	legend: {
	// 	    display: true
	// 	},
	// 	title: {
	// 	    display: true,
	// 	    text: 'Average Disk Utilization'
	// 	},
	//     }
	// });

	// console.log(datasets);

	var disk_info_table = document.getElementById("disk-info-table");
	disk_info_table.innerHTML = '';

	var disks_list = Object.keys(avg_disk_data).sort()
	
	var head_row = disk_info_table.insertRow(0);
	var head_cell1 = head_row.insertCell(0);
	var head_cell2 = head_row.insertCell(1);
	var head_cell3 = head_row.insertCell(2);
	var head_cell4 = head_row.insertCell(3);
	var head_cell5 = head_row.insertCell(4);
	head_cell1.innerHTML = "<b>Disk</b>";
	head_cell2.innerHTML = "<b>Mounted At</b>";
	head_cell3.innerHTML = "<b>Used(in GB)</b>";
	head_cell4.innerHTML = "<b>Total(in GB)</b>";
	head_cell5.innerHTML = "<b>Free%</b>";
	var i;
	for(i=0; i<disks_list.length; i++) {
	    var row = disk_info_table.insertRow(i+1);
	    var cell1 = row.insertCell(0);
	    var cell2 = row.insertCell(1);
	    var cell3 = row.insertCell(2);
	    var cell4 = row.insertCell(3);
	    var cell5 = row.insertCell(4);
	    cell1.innerHTML = disks_list[i];
	    cell2.innerHTML = avg_disk_data[disks_list[i]]["mounted_on"];
	    cell3.innerHTML = avg_disk_data[disks_list[i]]["avg_used_GB"].toFixed(2);
	    cell4.innerHTML = avg_disk_data[disks_list[i]]["total_GB"];
	    cell5.innerHTML = ((avg_disk_data[disks_list[i]]["total_GB"] - avg_disk_data[disks_list[i]]["avg_used_GB"])*100/avg_disk_data[disks_list[i]]["total_GB"]).toFixed(2);
	}
	disk_info_table.classList.add("w3-table", "w3-striped", "w3-bordered", "w3-small", "w3-round");

	
    },

    request_and_fill_avg_cpu_ram_data: function(machine_id) {
	var from_date = document.getElementById("from-date-input-md").value;
	var to_date = document.getElementById("to-date-input-md").value;
	xhr_object = new XMLHttpRequest();
	xhr_object.onload = this.get_avg_cpu_ram_data;

	endpoint = server_details.web_server_ip + '/api/v2/overview-machine-meta-data/' + machine_id + '/' + from_date + '/' + to_date;
	
	xhr_object.open('GET', endpoint);
	xhr_object.send();
    },

    get_avg_cpu_ram_data: function() {
	if(this.readyState == 4 && this.status == 200)
	{
	    var res = this.responseText;
	    var res_json = JSON.parse(res);
	    machine_details_obj.populate_avg_cpu_ram_data(res_json);
	}
    },

    populate_avg_cpu_ram_data: function(avg_cpu_ram_data) {
	var avg_cpu_util_val = parseFloat(avg_cpu_ram_data['CPU'])
	
	var avg_cpu_util_data = {
	    datasets: [{
		data: [avg_cpu_util_val, (100-avg_cpu_util_val)],
		backgroundColor: ['rgba(54, 162, 155, 1)', 'transparent'],
		borderColor: ['rgba(54, 162, 255, 0.2)', 'rgba(54, 162, 235, 0.2)']
	    }],
	    labels: ['Avg CPU utilized %', 'Avg CPU Un-utilized%']
	};

	var avg_ram_util_val = parseFloat(avg_cpu_ram_data['RAM']);
	var avg_ram_util_data = {
	    datasets: [{
		data: [avg_ram_util_val, (100-avg_ram_util_val)],
		backgroundColor: ['rgba(254, 162, 55, 1)', 'transparent'],
		borderColor: ['rgba(54, 162, 255, 0.2)', 'rgba(54, 162, 235, 0.2)']
	    }],
	    labels: ['Avg RAM utilized %', 'Avg RAM Un-utilized%']
	};

	var ctx = document.getElementById("avg-cpu-util-doughnut-chart-canvas");
	var avg_cpu_util_donoughnut_chart = new Chart(ctx, {
	    type: 'doughnut',
	    data: avg_cpu_util_data,
	    options: {
		responsive: true,
		cutoutPercentage: 60,
		legend: false,
		tooltips: { bodyFontSize: 8 },
		title: {
		    display: true,
		    text: 'Average CPU Utilization'
		}
	    }
	});

	var ctx_ram = document.getElementById("avg-ram-util-doughnut-chart-canvas");
	var avg_ram_util_donoughnut_chart = new Chart(ctx_ram, {
	    type: 'doughnut',
	    data: avg_ram_util_data,
	    options: {
		responsive: true,
		cutoutPercentage: 60,
		legend: false,
		tooltips: { bodyFontSize: 8 },
		title: {
		    display: true,
		    text: 'Average RAM Utilization'
		},
	    }
	});

    },

    request_and_fill_mach_col_data: function(machine_id) {
	xhr_object = new XMLHttpRequest();
	xhr_object.onload = this.get_mach_col_data;
	xhr_object.open('GET', server_details.web_server_ip
			+ '/api/v2/machine-details-page-data/'
			+ machine_id);
	xhr_object.send();
    },

   get_mach_col_data: function() {
	if(this.readyState == 4 && this.status == 200)
	{
	    var res = this.responseText;
	    var res_json = JSON.parse(res);
	    machine_details_obj.populate_mach_col_data(res_json);
	}
   },

    populate_mach_col_data: function(mach_col_data) {
	var server_name = mach_col_data['_id'];
	machine_details_obj._update_server_name(server_name);
	
	var hostname = mach_col_data['hostname'];
	machine_details_obj._update_hostname(hostname);
	
	var ip_info = mach_col_data['ip_info'];
	machine_details_obj._update_ip_info(ip_info);
	
	var kvm_info = ['01-1'];
	machine_details_obj._update_kvm_info(kvm_info);
	
	var assigned_to_info = mach_col_data['assigned_to'];
	machine_details_obj._update_assigned_to_info(assigned_to_info);

	var student_assigned_to_info = mach_col_data['student_assigned_to'];
	machine_details_obj._update_student_assigned_to_info(student_assigned_to_info);
	
	var comments_info = [mach_col_data['comments']];
	machine_details_obj._update_comments_info(comments_info);
	
	var os_info = mach_col_data['os_info'];
	machine_details_obj._update_os_info(os_info);
	
	var cpu_model = mach_col_data['cpu_model'];
	machine_details_obj._update_cpu_model_info(cpu_model);
	
	var ram_capacity_info = mach_col_data['ram_capacity'];
	machine_details_obj._update_ram_capacity_info(ram_capacity_info);
	
	var swap_space_info = mach_col_data['swap_info'];
	machine_details_obj._update_swap_space_info(swap_space_info);
	
	var uptime_info = mach_col_data['uptime'];
	machine_details_obj._update_uptime_info(uptime_info);

	var users_last_login_info = mach_col_data['users_last_login'];
	machine_details_obj._update_users_last_login_info(users_last_login_info);

    },


    request_cpu_ram_utilization_data: function(machine_id) {
	var from_date = document.getElementById("from-date-input-md").value;
	var to_date = document.getElementById("to-date-input-md").value;

	xhr_object = new XMLHttpRequest();
	xhr_object.onload = this.get_cpu_ram_utilization_data;
	xhr_object.open('GET', server_details.web_server_ip
			+ '/api/v2/machine-details-cpu-ram-data/'
			+ machine_id + '/' + from_date + '/' + to_date);
	xhr_object.send();
    },

   get_cpu_ram_utilization_data: function() {
	if(this.readyState == 4 && this.status == 200)
	{
	    var res = this.responseText;
	    var res_json = JSON.parse(res);
	    machine_details_obj.populate_cpu_ram_utilization_data(res_json);
	}
   },

    populate_cpu_ram_utilization_data: function(cpu_ram_utilization_data) {
	graph_canvas_div = document.getElementById("cpu-ram-graph-div");
	graph_canvas_div.innerHTML = "";
	graph_canvas = document.createElement("canvas");
	graph_canvas_div.appendChild(graph_canvas);

	// flatten the date-time stuff
	cpu_usage_data = []
	ram_usage_data = []
	for (let date in cpu_ram_utilization_data["CPU"]) {
	    cpu_usage_data.push({x: date, y: cpu_ram_utilization_data["CPU"][date]})
	}

	for (let date in cpu_ram_utilization_data["RAM"]) {
	    ram_usage_data.push({x: date, y: cpu_ram_utilization_data["RAM"][date]})
	}

	// console.log(cpu_usage_data);

	//Chart.defaults.global.defaultFontColor = 'black';
	ctx = graph_canvas.getContext('2d');
	line_graph = new Chart(ctx, {
	    type: 'line',
	    data: {
		datasets: [
		    {
			label: 'CPU Usage',
			fill: false,
			borderColor: 'rgb(255, 99, 132)',
			data: cpu_usage_data
		    },
		    {
			label: 'RAM Usage',
			fill: false,
			borderColor: 'rgb(132, 99, 255)',
			data: ram_usage_data
		    }]
	    },
	    options: {
		scales: {
		    yAxes: [{
			ticks: {
			    suggestedMin: 0,
			    suggestedMax: 100
			}
		    }],
		    xAxes: [{
			type: 'time',
			time: {
			    displayFormats: {
				second: 'h:MM:SS',
				minute: 'h:MM',
				hour: 'hA D',
				week: 'MMM D',
				day: 'MMM D',
				month: 'YYYY MMM',
				year: 'YYYY'
			    },
			},
			display: true,
			scaleLabel: {
			    display: true,
			    labelString: 'value'
			}
		    }]
		}
	    }
	});
    },

    _update_users_last_login_info: function(users_last_login_info){
	var users_last_login_table = document.getElementById("users-last-login-table");
	users_last_login_table.innerHTML = '';

	var users_list = Object.keys(users_last_login_info).sort()
	
	var head_row = users_last_login_table.insertRow(0);
	var head_cell1 = head_row.insertCell(0);
	var head_cell2 = head_row.insertCell(1);
	head_cell1.innerHTML = "<b>User</b>";
	head_cell2.innerHTML = "<b>Last Login</b>";
	var i;
	for(i=0; i<users_list.length; i++) {
	    var row = users_last_login_table.insertRow(i+1);
	    var cell1 = row.insertCell(0);
	    var cell2 = row.insertCell(1);
	    cell1.innerHTML = users_list[i];
	    cell2.innerHTML = users_last_login_info[users_list[i]];
	}
	users_last_login_table.classList.add("w3-table", "w3-striped", "w3-bordered", "w3-small", "w3-round");

    },

    _update_uptime_info: function(uptime_info){
	var uptime_info_div = document.getElementById("uptime-info-md");
	uptime_info_div.innerHTML = "<h6>" + "Up-time : " + uptime_info + "</h6>";
    },

    _update_swap_space_info: function(swap_space_info){
	var swap_space_div = document.getElementById("swap-space-md");
	swap_space_div.innerHTML = "<td>" + "Swap Space : " + "</td> <td>" + swap_space_info + " GB" + "</td>";
    },

    _update_ram_capacity_info: function(ram_capacity_info){
	var ram_capacity_div = document.getElementById("ram-capacity-md");
	ram_capacity_div.innerHTML = "<td>" + "RAM Capacity : " + "</td> <td>" + ram_capacity_info + " GB" + "</td>";
    },

    _update_cpu_model_info: function(cpu_model){
	var cpu_model_div = document.getElementById("cpu-model-md");
	cpu_model_div.innerHTML = "<td>" +"CPU Model : " + "</td> <td>" + cpu_model + "</td>";
    },

    _update_kvm_info: function(kvm_info){
	var kvm_info_md_div = document.getElementById("kvm-info-md");
	kvm_info_md_div.innerHTML = "";
	kvm_info_md_div.innerHTML = "<li><h6>KVM Switch </h6></li> <li>" + kvm_info.join(' </li> <li> ') + " </li> </ul>";
    },

    _update_comments_info: function(comments_info){
	var comments_md_div = document.getElementById("comments-md");
	comments_md_div.innerHTML = "";
	comments_md_div.innerHTML = "<li><h6>Comments </h6></li> <li>" + comments_info.join(' </li> <li> ') + " </li> </ul>";	
    },

    _update_assigned_to_info: function(assigned_to_info) {
	var assigned_to_md_div = document.getElementById("prof-assigned-to-md");
	assigned_to_md_div.innerHTML = "";
	// console.log(assigned_to_info);
	assigned_to_md_div.innerHTML = "<li><h4>Professor Assigned To </h4></li> <li>" + assigned_to_info +' </li>' + "</ul>";
    },

    _update_student_assigned_to_info: function(student_assigned_to_info) {
	var student_assigned_to_md_div = document.getElementById("student-assigned-to-md");
	student_assigned_to_md_div.innerHTML = "";
	student_assigned_to_md_div.innerHTML = "<li><h4>Student Assigned To </h4></li> <li>" + student_assigned_to_info +' </li>' + "</ul>";
    },

    _update_ip_info: function(ip_info) {
	var ip_md_div = document.getElementById("ip-md");
	ip_md_div.innerHTML = "";
	ip_md_div.innerHTML = "<li><h4>IPs </h4></li> <li>" + ip_info.join(' </li> <li> ') + " </li> </ul>";
    },

    _update_server_name: function(server_name) {
	var server_name_div = document.getElementById("server-name-md");
	server_name_div.innerHTML = "Server : " + server_name;
    },

    _update_hostname: function(hostname) {
	var hostname_div = document.getElementById("hostname-md");
	hostname_div.innerHTML = "<td>" + "Hostname : " + "</td> <td>" +  hostname + "</td>";
    },

    _update_os_info: function(os_info) {
	var os_info_div = document.getElementById("os-info-md");
	os_info_div.innerHTML = "<td>" + "OS : " + "</td> <td>" + os_info + "</td>";
    }
    
}

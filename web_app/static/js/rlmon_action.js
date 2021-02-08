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

	if (e != null && e.target.id == "color-coding-selector" && color_coding_selector == "Last login") {
	    document.getElementById("from-date-input").disabled = true;
	    document.getElementById("to-date-input").disabled = true;
	}
	else {
	    document.getElementById("from-date-input").disabled = false;
	    document.getElementById("to-date-input").disabled = false;
	}
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
	var no_data = false;
	coloring_function = null;

	// different coloring functions based on the data requested by the user.
	if (document.getElementById("color-coding-selector").value == "CPU utilization" ||
	    document.getElementById("color-coding-selector").value == "RAM utilization") {
	    coloring_function = this.color_machines_based_on_cpu_ram_data;
	}
	else {
	    coloring_function = this.color_machines_based_on_last_login_data;
	}

	this.update_legend();

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
		    no_data = false;
		    li_object = document.createElement("li");
		    li_object.rlmon_id = data_json[i]['rack_list'][j]['machine_list'][k]["_id"];
		    li_object.classList.add("w3-hover-shadow", "w3-border-black");
		    li_object.innerHTML = data_json[i]['rack_list'][j]['machine_list'][k]["_id"];

		    value = data_json[i]['rack_list'][j]['machine_list'][k]["value"];
		    coloring_function(value, li_object);

		    meta_data_obj = document.createElement("div");
		    meta_data_obj.classList.add("w3-panel", "w3-dark-gray", "w3-hover-shadow");
		    meta_data_obj.style.position = "absolute";
		    meta_data_obj.style.display = "none";
		    meta_data_obj.meta_data_added = false;
		    li_object.appendChild(meta_data_obj);

		    if (!no_data) {
			li_object.addEventListener("mouseover", this.show_meta_data_div_timer);
			li_object.addEventListener("mouseout", this.hide_meta_data_div);
		    }
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

    update_legend: function() {
	legend_key = document.getElementById("color-coding-selector").value;

	if (legend_key == "CPU utilization" || legend_key == "RAM utilization") {
	    document.getElementById("legend-div-1").innerHTML = "0-24";
	    document.getElementById("legend-div-2").innerHTML = "25-49";
	    document.getElementById("legend-div-3").innerHTML = "50-74";
	    document.getElementById("legend-div-4").innerHTML = "74-100";
	}
	else {
	    document.getElementById("legend-div-1").innerHTML = ">4w";
	    document.getElementById("legend-div-2").innerHTML = "3w";
	    document.getElementById("legend-div-3").innerHTML = "2w";
	    document.getElementById("legend-div-4").innerHTML = "1w";
	}
    },

    color_machines_based_on_cpu_ram_data: function(value, li_object) {
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
    },

    color_machines_based_on_last_login_data: function(value, li_object) {

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
	xhr_object.open('GET', navigation_selector_obj.backend_url
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
	machine_details_obj.top_fun(e.target);
    },

    top_fun: function(machine_li_obj) {
	//main_machine_details_div = document.getElementById("machine-details-div");
	// main_machine_details_div.innerHTML = "machine ID: "+machine_li_obj.rlmon_id.toString();

	var server_name = "A-15";
	var hostname = "Blossom";
	var ip_info = ['10.10.3.212', '192.168.113.224'];
	var kvm_info = ['01-1'];
	var assigned_to_info = ['Prof ABCD'];
	var comments_info = ['Hadoop Cluster', 'KVM Host'];
	var os_info = "Ubuntu 20.04.1 LTS";
	var cpu_model = "Intel(R) Core(TM) i3-5005U CPU @ 2.00GHz"
	var ram_capacity_info = "7.63"
	var swap_space_info = "3.86"
	var uptime_info = "4 days, 19 hours, 18 minutes";
	var users_last_login_info = {
            "sneha": "Mon Dec 14 16:14:50",
            "yashas": "Mon Sep 14 11:38:21",
            "padma": "Mon Sep 14 13:06:40",
            "ravi": "**Never logged in**"
	}
	var avg_cpu_util_val = 20.25;
	var avg_cpu_util_data = {
	    datasets: [{
		data: [avg_cpu_util_val, (100-avg_cpu_util_val)],
		backgroundColor: ['rgba(54, 162, 155, 1)', 'transparent'],
		borderColor: ['rgba(54, 162, 255, 0.2)', 'rgba(54, 162, 235, 0.2)']
	    }],
	    labels: ['Avg CPU utilized %', 'Avg CPU Un-utilized%']
	};
	var avg_ram_util_val = 20.25;
	var avg_ram_util_data = {
	    datasets: [{
		data: [avg_ram_util_val, (100-avg_ram_util_val)],
		backgroundColor: ['rgba(254, 162, 55, 1)', 'transparent'],
		borderColor: ['rgba(54, 162, 255, 0.2)', 'rgba(54, 162, 235, 0.2)']
	    }],
	    labels: ['Avg RAM utilized %', 'Avg RAM Un-utilized%']
	};
	var avg_disk_util_val = 60.25;
	var avg_disk_util_val1 = 20.25;
	var avg_disk_util_data = {
	    datasets: [{
		           data: [avg_disk_util_val, (100-avg_disk_util_val)],
		           backgroundColor: ['rgba(54, 255, 55, 1)', 'transparent'],
		           // borderColor: ['rgba(54, 162, 255, 0.2)', 'rgba(54, 162, 235, 0.2)']
	               },
		       {
			   data: [avg_disk_util_val1, (100-avg_disk_util_val1)],
			   backgroundColor: ['rgba(254, 255, 55, 1)', 'transparent'],
			   // borderColor: ['rgba(54, 162, 255, 0.2)', 'rgba(54, 162, 235, 0.2)']
		       }],
	    labels: ['Avg Disk utilized %', 'AVg Disk Un-utilized%']
	};
	
	var server_name_div = document.getElementById("server-name-md");
	server_name_div.innerHTML = "Server : " + server_name;
	
	var hostname_div = document.getElementById("hostname-md");
	hostname_div.innerHTML = "<td>" + "Hostname : " + "</td> <td>" +  hostname + "</td>";

	// ip_info_div = document.getElementById("ip-info-md");
	// ip_info_div.innerHTML = "IPs : " + ip_info.join(', ');

	var os_info_div = document.getElementById("os-info-md");
	os_info_div.innerHTML = "<td>" + "OS : " + "</td> <td>" + os_info + "</td>";

	var cpu_model_div = document.getElementById("cpu-model-md");
	cpu_model_div.innerHTML = "<td>" +"CPU Model : " + "</td> <td>" + cpu_model + "</td>";

	var ram_capacity_div = document.getElementById("ram-capacity-md");
	ram_capacity_div.innerHTML = "<td>" + "RAM Capacity : " + "</td> <td>" + ram_capacity_info + " GB" + "</td>";

	var swap_space_div = document.getElementById("swap-space-md");
	swap_space_div.innerHTML = "<td>" + "Swap Space : " + "</td> <td>" + swap_space_info + " GB" + "</td>";

    	var uptime_info_div = document.getElementById("uptime-info-md");
	uptime_info_div.innerHTML = "<h6>" + "Up-time : " + uptime_info + "</h6>";

	var users_last_login_table = document.getElementById("users-last-login-table");
	users_last_login_table.innerHTML = '';
	console.log(users_last_login_table)
	var users_list = Object.keys(users_last_login_info).sort()
	// console.log(users_list);
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

	var ctx = document.getElementById("avg-cpu-util-doughnut-chart-canvas");
	var avg_cpu_util_donoughnut_chart = new Chart(ctx, {
	    type: 'doughnut',
	    data: avg_cpu_util_data,
	    options: {
		responsive: true,
		cutoutPercentage: 60,
		legend: false,
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
		title: {
		    display: true,
		    text: 'Average RAM Utilization'
		},
	    }
	});
	
	var ctx_disk = document.getElementById("avg-disk-util-doughnut-chart-canvas");
	var avg_disk_util_donoughnut_chart = new Chart(ctx_disk, {
	    type: 'doughnut',
	    data: avg_disk_util_data,
	    options: {
		responsive: true,
		cutoutPercentage: 60,
		legend: false,
		title: {
		    display: true,
		    text: 'Average Disk Utilization'
		},
	    }
	});

	var ip_md_div = document.getElementById("ip-md");
	ip_md_div.innerHTML = "";
	ip_md_div.innerHTML = "<li><h4>IPs </h4></li> <li>" + ip_info.join(' </li> <li> ') + " </li> </ul>";

	var assigned_to_md_div = document.getElementById("assigned-to-md");
	assigned_to_md_div.innerHTML = "";
	assigned_to_md_div.innerHTML = "<li><h6>Assigned To </h6></li> <li>" + assigned_to_info.join(' </li> <li> ') + " </li> </ul>";

	var kvm_info_md_div = document.getElementById("kvm-info-md");
	kvm_info_md_div.innerHTML = "";
	kvm_info_md_div.innerHTML = "<li><h6>KVM Switch </h6></li> <li>" + kvm_info.join(' </li> <li> ') + " </li> </ul>";

	var comments_md_div = document.getElementById("comments-md");
	comments_md_div.innerHTML = "";
	comments_md_div.innerHTML = "<li><h6>Comments </h6></li> <li>" + comments_info.join(' </li> <li> ') + " </li> </ul>";	
    }
}

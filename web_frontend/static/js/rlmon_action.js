rlmon_toggle_nav={
    setup_nav_buttons: function() {
	var x;
	x = document.getElementsByClassName("rlmon-display-buttons");
	for (i = 0; i < x.length; i++) {
	    x[i].addEventListener("click", this.change_view);
	    x[i].corresponding_div = document.getElementById(x[i].id.replace('-button', '-div'));
	}
    },

    change_view: function(e) {
	var i, x;
	x = document.getElementsByClassName("rlmon-display-div");
	for (i = 0; i < x.length; i++) {
	    x[i].style.display = "none";
	}
	e.target.corresponding_div.style.display = "block";
	console.log(e);
    }
}

function HTTPGet (id, controller) {
    console.log("Initializing HTTPGet module");
    HTTPGet.super_.call(this, id, controller);
}

inherits(HTTPGet, AutomationModule);
_module = HTTPGet;

HTTPGet.prototype.init = function (config) {
	HTTPGet.super_.prototype.init.call(this, config);
	var self = this;    
	self.callback = _.bind(self.updateDevice, self);
	self.controller.devices.on("change:metrics:level", self.callback);
};

HTTPGet.prototype.stop = function () {
	var self = this;
	self.controller.devices.off("change:metrics:level", self.callback);
	HTTPGet.super_.prototype.stop.call(this);
};


HTTPGet.prototype.updateDevice = function (device) {
	var self = this;

	var value = device.get("metrics:level");

	if (device.get("deviceType") == "switchBinary" || device.get("deviceType") == "sensorBinary") {
		if (value == 0) {
			value = "off";
		} else if (value == 255) {
			value = "on";
		}
	}

	// Maio: verifichiamo se il filtro id matcha e cerca nell'array di port e filtri
	//console.log("HTTPGET: notification id: " + device.id);
	var filters = ( typeof(this.config.filter) == 'undefined' ? "" : this.config.filter ).split(",");
	var ports = ( typeof(this.config.ports) == 'undefined' ? "" : this.config.ports ).split(",");
	if ( filters.length == ports.length ) {
		var indexObj = filters.indexOf(device.id);
		if ( indexObj != -1 ) {
			try {
	                	var msg = "0001|" + device.id + "|" + value;
        	        	var port = parseInt(ports[indexObj]);
				var sock = new sockets.udp();
				sock.connect("127.0.0.1", port);
				sock.send(msg);
				sock.close();
				console.log("HTTPGET - Sending UDP msg: " + msg + " - on portz: " + port);
			} catch (e) {
				console.log("HTTPGET: " + e);
			}
		}
	}
};

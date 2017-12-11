/*** HTTPGet Z-Way HA module ****************************************************

Version: 1.0.1
(c) H Plato, 2017
-----------------------------------------------------------------------------
Author: H Plato <hplato@gmail.com>
Description:
   Pushes the status of devices to a URL

   HTTPGet based on https://github.com/goodfield/zway-mqtt

 *****************************************************************************/


// ----------------------------------------------------------------------------
// --- Class definition, inheritance and setup
// ----------------------------------------------------------------------------

function HTTPGet (id, controller) {
    console.log("Initializing HTTPGet module");
    HTTPGet.super_.call(this, id, controller);
}

//inherits(HTTPGet, BaseModule);
inherits(HTTPGet, AutomationModule);


_module = HTTPGet;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------

HTTPGet.prototype.init = function (config) {
    // Call superclass' init (this will process config argument and so on)
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

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------


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

	self.get_url(device, value);
};

HTTPGet.prototype.get_url = function (device, value) {

	var url = this.config.url
	url = url.replace("%DEVICE%",device.id);
	url = url.replace("%VALUE%",value);

	console.log(this.config.url+" : "+device.id+" : "+value+" : "+url);

    var req = {
        url: url,
        async: true,
        success: function(response) {
            console.log("Request was successful");
			},
        error: function(response) {
            console.log("Can not make request: " + response.statusText); // don't add it to notifications, since it will fill all the notifcations on error
            } 
        };
        // With authorization
//        if (self.config.user !== undefined && self.config.password !== undefined) {
//            req.auth = {
//                    login: self.config.login,
//                    password: self.config.password
//            };
//        }
    http.request(req);
};



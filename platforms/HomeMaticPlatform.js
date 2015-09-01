var types = require("HAP-NodeJS/accessories/types.js");
var request = require("request");
var http = require("http");
var path = require("path");


var HomeMaticWeatherChannel = require(path.resolve(__dirname, 'homematic/Weather.js'));
var HomeMaticDimmerChannel = require(path.resolve(__dirname, 'homematic/Dimmer.js'));
var HomeMaticSwitchChannel = require(path.resolve(__dirname, 'homematic/Switch.js'));
var HomeMaticThermostatChannel = require(path.resolve(__dirname, 'homematic/Thermostat.js'));
var HomeMaticContactChannel = require(path.resolve(__dirname, 'homematic/Contact.js'));


function RegaRequest(log,ccuip) {
   this.log = log;
   this.ccuIP = ccuip;
}

RegaRequest.prototype = {

   script: function (script, callback) {

     var post_options = {
            host: this.ccuIP,
            port: '80',
            path: '/tclrega.exe',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': script.length
            }
        };

        var post_req = http.request(post_options, function(res) {
            var data = "";
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk.toString();
            });
            res.on('end', function () {
 				var pos = data.lastIndexOf("<xml><exec>");
                var response = (data.substring(0, pos));
                callback(response);
            });
        });

        post_req.on('error', function(e) {
	         callback("{}");
        });

        post_req.write(script);
        post_req.end();


   }
}


function HomeMaticPlatform(log, config) {
   this.log 	= log;
   this.ccuIP 	= config["ccu_ip"];
   this.filter_device  = config["filter_device"];
   this.filter_channel  = config["filter_channel"];

   this.sendQueue = [];
   this.timer   = 0;
}

HomeMaticPlatform.prototype = {

  accessories: function(callback) {
    this.log("Fetching Homematic devices...");
	var that = this;
    var foundAccessories = [];

    var script = "string sDeviceId;string sChannelId;boolean df = true;Write(\'{\"devices\":[\');foreach(sDeviceId, root.Devices().EnumIDs()){object oDevice = dom.GetObject(sDeviceId);if(oDevice){var oInterface = dom.GetObject(oDevice.Interface());if(df) {df = false;} else { Write(\',\');}Write(\'{\');Write(\'\"id\": \"\' # sDeviceId # \'\",\');Write(\'\"name\": \"\' # oDevice.Name() # \'\",\');Write(\'\"address\": \"\' # oDevice.Address() # \'\",\');Write(\'\"channels\": [\');boolean bcf = true;foreach(sChannelId, oDevice.Channels().EnumIDs()){object oChannel = dom.GetObject(sChannelId);if(bcf) {bcf = false;} else {Write(\',\');}Write(\'{\');Write(\'\"cId\": \' # sChannelId # \',\');Write(\'\"name\": \"\' # oChannel.Name() # \'\",\');if(oInterface){Write(\'\"address\": \"\' # oInterface.Name() #\'.'\ # oChannel.Address() # \'\",\')};Write(\'\"type\": \"\' # oChannel.HssType() # \'\"\');Write(\'}\');}Write(\']}\');}}Write(\']}\');";

    var regarequest = new RegaRequest(this.log,this.ccuIP).script(script, function(data) {
                var json  = JSON.parse(data);
				if (json['devices'] != undefined) {
				      json['devices'].map(function(device) {
				            var isFiltered = false;

				            if ((that.filter_device != undefined) && (that.filter_device.indexOf(device.address) > -1)) {
				              isFiltered = true;
				            } else {
				              isFiltered = false;
				            }


             				if ((device['channels'] != undefined) && (!isFiltered)) {

             				device['channels'].map(function(ch) {
				            var isChannelFiltered = false;

				            if ((that.filter_channel != undefined) && (that.filter_channel.indexOf(ch.address) > -1)) {
				              isChannelFiltered = true;
				            } else {
				              isChannelFiltered = false;
				            }

             				  if ((ch.address != undefined) && (!isChannelFiltered)) {
             				   if (ch.type=="SWITCH") {
             				    // Switch found
              				    accessory = new HomeMaticSwitchChannel(that.log, that, ch.id , ch.name , ch.type , ch.address);
				                foundAccessories.push(accessory);
             				   }

             				   if (ch.type=="DIMMER") {
             				    // Dimmer found
              				    accessory = new HomeMaticDimmerChannel(that.log, that, ch.id , ch.name , ch.type , ch.address);
				                foundAccessories.push(accessory);
             				   }

             				   if (ch.type=="CLIMATECONTROL_RT_TRANSCEIVER") {
             				    // ThermoControl found
              				    accessory = new HomeMaticThermostatChannel(that.log, that, ch.id , ch.name , ch.type , ch.address);
				                foundAccessories.push(accessory);
             				   }

             				   if (ch.type=="WEATHER") {
             				    // ThermoControl found
              				    accessory = new HomeMaticWeatherChannel(that.log, that, ch.id , ch.name , ch.type , ch.address);
				                foundAccessories.push(accessory);
             				   }

             				   if (ch.type=="SHUTTER_CONTACT") {
             				    // ThermoControl found
              				    accessory = new HomeMaticContactChannel(that.log, that, ch.id , ch.name , ch.type , ch.address);
				                foundAccessories.push(accessory);
             				   }



							 } else {
							   that.log(device.name + " has no address");
							 }

             				});
             		     } else {
             		      that.log(device.name + " has no channels or is filtered");
             		     }
          			  });
				 callback(foundAccessories);
				} else {
				 callback(foundAccessories);
				}
    });
  },

  prepareRequest: function(accessory,script) {
    var that = this;
    this.sendQueue.push(script);
    that.delayed(100);
  },

  sendPreparedRequests: function() {
    var that = this;
    var script = "var d;";
    this.sendQueue.map(function(command) {
      script = script + command;
    });
    this.sendQueue = [];
    var regarequest = new RegaRequest(this.log,this.ccuIP).script(script, function(data) {

    });
  },

  sendRequest: function(accessory,script,callback) {
    var that = this;
    var regarequest = new RegaRequest(this.log,this.ccuIP).script(script, function(data) {
     if (data != undefined) {
       try {
         var json  = JSON.parse(data);
         callback(json);
       } catch (err) {
         callback(undefined);
       }
       return;
     }
    });
  },

  delayed: function(delay) {
    var timer = this.delayed[delay];
    if( timer ) {
      this.log("removing old command");
      clearTimeout( timer );
    }

    var that = this;
    this.delayed[delay] = setTimeout( function(){clearTimeout(that.delayed[delay]);that.sendPreparedRequests()}, delay?delay:100);
    this.log("New Timer was set");
  },

}




module.exports.platform = HomeMaticPlatform;

var types = require("hap-nodejs/accessories/types.js");
var request = require("request");
var http = require("http");
var path = require("path");
var netatmo = require('netatmo');

function NetatmoPlatform(log, config) {
   this.log 	= log;

   var auth = {
  	"client_id": config["clientId"],
  	"client_secret": config["clientSecret"],
  	"username": config["username"],
  	"password": config["password"],
	};

   this.netatmo_api = new netatmo(auth);
}

NetatmoPlatform.prototype = {


	accessories: function(callback) {
    	this.log("Fetching Netatmo devices...");
		var that = this;
		var foundAccessories = [];

		this.netatmo_api.getDevicelist(function(err, devices, modules) {

		    devices.map(function(device) {
  			  accessory = new NetAtmoModule(that, device._id, "" , device.module_name, device.type);
			  foundAccessories.push(accessory);
		    });


  			modules.map(function(module) {
  			  accessory = new NetAtmoModule(that, module.main_device, module._id , module.module_name , module.type);
			  foundAccessories.push(accessory);
  			});
		 callback(foundAccessories);
		});
	},
}



function NetAtmoModule(platform,device_id,module_id,module_name,module_type) {

   this.platform = platform;
   this.log = platform.log;
   this.deviceid = device_id;
   this.moduleid = module_id;
   this.name = module_name;
   this.moduletype = module_type;
   this.cache=[];

}

NetAtmoModule.prototype = {


  cacheMeasure:function(dp,aValue) {
    this.log("Cache " + dp + " with " + aValue);
    var now = Math.floor(Date.now() / 1000);
    this.cache[dp] = {timestamp: now, value:aValue};
  },

  getCachedData:function(dp) {
	if (this.cache[dp] != undefined) {
       var value = this.cache[dp].value;
       var time = this.cache[dp].timestamp;

       var now = Math.floor(Date.now() / 1000);
       // can use cached Value < 30min
       if ((now - time) < 1800) {
	     this.log("Cache Hit for " + dp + " with " + value);
         return value;
       }
	}
	return null;
  },

  command: function(dp,callback) {

   	var that = this;

	var cd = this.getCachedData(dp);
	if (cd != null) {
	  callback(cd);
	  return;
	}



   var options = {
     device_id: this.deviceid,
	 scale: 'max',
	 date_end: 'last',
  	 type: ['Temperature', 'CO2', 'Humidity', 'Pressure', 'Noise'],
  	 module_id: this.moduleid
   };

  // this.log("Module " + this.name + " getMeasure at Module " + this.moduleid)

	this.platform.netatmo_api.getMeasure(options, function(err, measure) {

  		var data = measure[0]['value'][0];

  		if (data!=undefined) {

  		  if (data[0] != 'null') {
  		     that.cacheMeasure("Temperature",data[0]);
  		  }

  		  if (data[1] != 'null') {
  		     that.cacheMeasure("CO2",data[1]);
           // Set new AirQuality Index see DIN EN 13779
           var ppm = data[1];
           if (ppm < 400) {
             that.cacheMeasure("AirQuality",1);
           }
           if ((ppm > 400) && (ppm < 600)) {
             that.cacheMeasure("AirQuality",2);
           }
           if ((ppm > 600) && (ppm < 1000)) {
             that.cacheMeasure("AirQuality",3);
           }

           if (ppm > 1000) {
             that.cacheMeasure("AirQuality",4);
           }

  		  }

  		  if (data[2] != 'null') {
  		     that.cacheMeasure("Humidity",data[2]);
  		  }

  		  if (data[3] != 'null') {
  		     that.cacheMeasure("Pressure",data[3]);
  		  }

  		  if (data[4] != 'null') {
  		     that.cacheMeasure("Noise",data[4]);
  		  }

  		}

  	 callback(that.getCachedData(dp));
	});

  },


  informationCharacteristics: function() {
    return [
      {
        cType: types.NAME_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: this.name,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Name of the accessory",
        designedMaxLength: 255
      },{
        cType: types.MANUFACTURER_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "NetAtmo",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Manufacturer",
        designedMaxLength: 255
      },{
        cType: types.MODEL_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: this.moduletype,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Model",
        designedMaxLength: 255
      },{
        cType: types.SERIAL_NUMBER_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "Serial",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "SN",
        designedMaxLength: 255
      },{
        cType: types.IDENTIFY_CTYPE,
        onUpdate: null,
        perms: ["pw"],
        format: "bool",
        initialValue: false,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Identify Accessory",
        designedMaxLength: 1
      }
    ]
  },


    controlCharacteristics: function(type,that) {

    var cTypes = [];

    cTypes.push({
      cType: types.NAME_CTYPE,
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "ModuleName",
      supportEvents: true,
      supportBonjour: false,
      manfDescription: "Name of service",
      designedMaxLength: 255
    });

    // Setup Temperature and Humidity
    if ((type == "NAMain") || (type=="NAModule1")) {
	  cTypes.push({
      cType: types.CURRENT_TEMPERATURE_CTYPE,
      onRead: function(callback) {

          that.command("Temperature",function(newValue){
           callback(newValue);
          });

      },
      perms: ["pr"],
      format: "int",
      initialValue: 20,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Current Temperature",
      unit: "celsius"
    },{
      cType: types.CURRENT_RELATIVE_HUMIDITY_CTYPE,
      onRead: function(callback) {

          that.command("Humidity",function(newValue){
           callback(newValue);
          });

      },
      perms: ["pr","ev"],
      format: "int",
      initialValue: 20,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Current Humidity",
      unit: "%"
    });
	}

    // Setup Carbon Dioxide and Sound Level
    if (type == "NAMain") {
	  cTypes.push({
      cType: "00000093-0000-1000-8000-0026BB765291",
      onRead: function(callback) {

          that.command("CO2",function(newValue){
           callback(newValue);
          });

      },
      perms: ["pr"],
      format: "float",
      initialValue: 400,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Current Carbon Dioxide Level",
      unit: "ppm"
    },
    {
      cType: "00000095-0000-1000-8000-0026BB765291",
      onRead: function(callback) {

          that.command("AirQuality",function(newValue){
           callback(newValue);
          });

      },
      perms: ["pr"],
      format: "UInt8",
      initialValue: 5,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Current Air Quality",
    }
    );
    }

    return cTypes
  },



  getServices: function() {
    var that = this;
    var services = [];

    services.push({sType: types.ACCESSORY_INFORMATION_STYPE,characteristics: this.informationCharacteristics()});
    services.push({sType: types.TEMPERATURE_SENSOR_STYPE,characteristics: this.controlCharacteristics(this.moduletype,that)});

    this.log("Loaded services for " + this.name)
    return services;
  }

}




module.exports.accessory = NetAtmoModule;
module.exports.platform = NetatmoPlatform;

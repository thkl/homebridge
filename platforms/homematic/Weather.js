var types = require("HAP-NodeJS/accessories/types.js");

function HomeMaticWeatherChannel (log,platform, id ,name, type ,adress) {
  	this.name     = name;
  	this.type     = type;
  	this.adress   = adress;
  	this.log      = log;
  	this.platform = platform;
}

HomeMaticWeatherChannel.prototype = {


 // Return current States
  query: function() {

    return "false";
  },


  command: function(mode,dp,value,callback) {
    this.log(this.name + " sending command " + dp + " " + value);
	// SEnd COmmand
	var that = this;
	
    if (mode == "get") {
		var script = "var d=dom.GetObject(\'"+ that.adress + "."+dp+"\');if (d) {Write(\'{\"value\":\'#d.State()#\'}\');}\n";
		this.log ("Script :" + script);
		that.platform.sendRequest(that,script, function(json){
		  if (json['value'] != undefined) {
		   callback(json['value']);
		  }
		});
	}


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
        initialValue: "EQ-3",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Manufacturer",
        designedMaxLength: 255
      },{
        cType: types.MODEL_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: this.type,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Model",
        designedMaxLength: 255
      },{
        cType: types.SERIAL_NUMBER_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: this.adress ,
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

  controlCharacteristics: function(that) {
    cTypes = [];

    cTypes.push({
      cType: types.NAME_CTYPE,
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: this.name,
      supportEvents: true,
      supportBonjour: false,
      manfDescription: "Name of service",
      designedMaxLength: 255
    },

    {
      cType: types.CURRENT_TEMPERATURE_CTYPE,
      onRead: function(callback) {
          
          that.command("get","TEMPERATURE","",function(newValue){
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
    },
    {
      cType: types.CURRENT_RELATIVE_HUMIDITY_CTYPE,
      onRead: function(callback) {
          
          that.command("get","HUMIDITY","",function(newValue){
           callback(newValue);
          });
          
      },
      perms: ["pr"],
      format: "int",
      initialValue: 20,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Current Humidity",
      unit: "%"
    },
    {
      cType: types.TEMPERATURE_UNITS_CTYPE,
      onRead: null,
      perms: ["pr"],
      format: "int",
      initialValue: 0,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Current Temperature",
      unit: "celsius"
    }
    
    
    
    
    );
    return cTypes
  },


  getServices: function() {
    var that = this;
    var services = [{
      sType: types.ACCESSORY_INFORMATION_STYPE,
      characteristics: this.informationCharacteristics(),
    },
    {
      sType: types.TEMPERATURE_SENSOR_STYPE ,
      characteristics: this.controlCharacteristics(that)
    }];
    this.log("Loaded services for " + this.name)
    return services;
  }
};

module.exports = HomeMaticWeatherChannel;



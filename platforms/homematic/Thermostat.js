var types = require("HAP-NodeJS/accessories/types.js");



function HomeMaticThermostatChannel(log,platform, id ,name, type ,adress) {
  this.name     = name;
  this.type     = type;
  this.adress   = adress;
  this.log      = log;
  this.platform = platform;
}



HomeMaticThermostatChannel.prototype = {


 // Return current States
  query: function() {

    return "false";
  },


  delayed: function(dp,value,delay) {
    var timer = this.delayed[delay];
    if( timer ) {
      clearTimeout( timer );
    }

    this.log(this.name + " delaying command set with value " + value);
    var that = this;
    this.delayed[delay] = setTimeout( function(){clearTimeout(that.delayed[delay]);that.command("set",dp,value)}, delay?delay:100 );
  },


  command: function(mode,dp,value,callback) {
  // SEnd COmmand
	var that = this;
	if (mode == "set") {
		var script = "d=dom.GetObject(\'"+ that.adress + "."+dp+"\');if (d) {d.State("+value+");}\n";
		that.platform.prepareRequest(that,script);
	}

    if (mode == "get") {
		var script = "var d=dom.GetObject(\'"+ that.adress + "."+dp+"\');if (d) {Write(\'{\"value\":\'#d.State()#\'}\');} else {Write(\'{}\');}\n";
		this.log ("Script :" + script);
		that.platform.sendRequest(that,script, function(json){
		   if ((json!=undefined) && (json['value'] != undefined)) {
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
      cType: types.CURRENTHEATINGCOOLING_CTYPE,
      onUpdate: function(value) { console.log("Change:",value); execute("Thermostat", "Current HC", value); },
      perms: ["pr"],
      format: "int",
      initialValue: 1,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Current Mode",
      designedMaxLength: 1,
      designedMinValue: 1,
      designedMaxValue: 1,
      designedMinStep: 1,
    },
    {
      cType: types.TARGETHEATINGCOOLING_CTYPE,
      onUpdate: function(value) {

      },
      perms: ["pw","pr"],
      format: "int",
      initialValue: 1,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Target Mode",
      designedMinValue: 1,
      designedMaxValue: 1,
      designedMinStep: 1,
    },
    {
      cType: types.CURRENT_TEMPERATURE_CTYPE,
      onRead: function(callback) {

          that.command("get","ACTUAL_TEMPERATURE","",function(newValue){
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
      cType: types.TARGET_TEMPERATURE_CTYPE,
      onUpdate: function(value) {
            that.delayed("SET_TEMPERATURE",value,500);
      },
      onRead: function(callback) {

          that.command("get","SET_TEMPERATURE","",function(newValue){
           callback(newValue);
          });

      },
      perms: ["pw","pr"],
      format: "int",
      initialValue: 20,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Target Temperature",
      designedMinValue: 16,
      designedMaxValue: 38,
      designedMinStep: 1,
      unit: "celsius"
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
    )


    return cTypes
  },


  getServices: function() {
    var that = this;
    var services = [{
      sType: types.ACCESSORY_INFORMATION_STYPE,
      characteristics: this.informationCharacteristics(),
    },
    {
      sType: types.THERMOSTAT_STYPE ,
      characteristics: this.controlCharacteristics(that)
    }];
    this.log("Loaded services for " + this.name)
    return services;
  }
};

module.exports = HomeMaticThermostatChannel;

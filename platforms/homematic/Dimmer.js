var types = require("HAP-NodeJS/accessories/types.js");

function HomeMaticDimmerChannel(log,platform, id ,name, type ,adress) {
  this.name     = name;
  this.type     = type;
  this.adress   = adress;
  this.log      = log;
  this.platform = platform;
  this.state    = 0;
}


HomeMaticDimmerChannel.prototype = {


 // Return current States
  query: function() {

    return "false";
  },


  delayed: function(mode,dp,value,delay) {
    var timer = this.delayed[delay];
    if( timer ) {
      clearTimeout( timer );
    }

    this.log(this.name + " delaying command "+mode+" with value " + value);
    var that = this;
    this.delayed[delay] = setTimeout( function(){clearTimeout(that.delayed[delay]);that.command(mode,dp,value)}, delay?delay:100 );
  },

  command: function(mode,dp,value,callback) {
  // SEnd COmmand
	var that = this;

    if (mode == "get") {
    // Issue 02 - Make sure that we returned a valid  json even there is no datapoint to fetch value from
		var script = "var d=dom.GetObject(\'"+ that.adress + "."+dp+"\');if (d) {Write(\'{\"value\":\'#d.Value()#\'}\');} else {Write(\'{}\');}\n";
		that.platform.sendRequest(that,script, function(json){
		  if ((json!=undefined) && (json['value'] != undefined)) {
		   that.log("Request Power State. Value is " + json['value']);
		   callback(json['value']);
		  }
		});
	}


    if (mode == "set") {
		var script = "var d=dom.GetObject(\'"+ that.adress + "."+dp+"\');if (d) {d.State("+value+");}\n";
		that.platform.sendRequest(that,script, function(json){

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
    cTypes = [{
      cType: types.NAME_CTYPE,
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: this.name,
      supportEvents: true,
      supportBonjour: false,
      manfDescription: "Name of service",
      designedMaxLength: 255
    }]

      cTypes.push({
        cType: types.POWER_STATE_CTYPE,
        onUpdate: function(value) {
            that.command("set","LEVEL" , (value==true) ? 1 : 0)
        },

        onRead: function(callback) {

          that.command("get","LEVEL","",function(newValue){
           callback((newValue>0) ? 1:0);
          });

        },
        
        perms: ["pw","pr"],
        format: "bool",
        initialValue: (that.state > 0) ? 1 : 0 ,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Change the power state",
        designedMaxLength: 1
      },
      {
        cType: types.BRIGHTNESS_CTYPE,
        onUpdate: function(value) {
          that.delayed("set","LEVEL" , value/100,100);
        },
        
        onRead: function(callback) {

          that.command("get","LEVEL","",function(newValue){
           callback(newValue*100);
          });

        },
        
        perms: ["pw","pr"],
        format: "int",
        initialValue: that.state,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Adjust Brightness of Light",
        designedMinValue: 0,
        designedMaxValue: 100,
        designedMinStep: 1,
        unit: "%"
      }
      )


    return cTypes
  },

  sType: function() {
      return types.LIGHTBULB_STYPE
  },

  getServices: function() {
    var that = this;
    var services = [{
      sType: types.ACCESSORY_INFORMATION_STYPE,
      characteristics: this.informationCharacteristics(),
    },
    {
      sType: this.sType(),
      characteristics: this.controlCharacteristics(that)
    }];
    this.log("Loaded services for " + this.name)
    return services;
  }
};

module.exports = HomeMaticDimmerChannel;
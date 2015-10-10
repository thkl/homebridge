var types = require("HAP-NodeJS/accessories/types.js");

function HomeMaticSwitchChannel(log,platform, id ,name, type ,adress,outlet) {
  this.name     = name;
  this.type     = type;
  this.adress   = adress;
  this.log      = log;
  this.platform = platform;
  this.state    = 0;
  this.outlet   = outlet;
}




HomeMaticSwitchChannel.prototype = {


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
            that.command("set","STATE" , (value==true) ? 1 : 0)
        },

        onRead: function(callback) {

          that.command("get","STATE","",function(newValue){
           callback(newValue);
          });

        },
        perms: ["pw","pr"],
        format: "bool",
        initialValue: that.state,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Change the power state",
        designedMaxLength: 1
      })

	// Add is in Use Characteristics
    if (this.outlet == true) {
	cTypes.push({
        cType: types.OUTLET_IN_USE_CTYPE,
               
        onRead: function(callback) {
           callback(true);
        },
        perms: ["pr"],
        format: "bool",
        initialValue: true,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Is Outlet in Use",
        designedMaxLength: 1
      })
	}  

    return cTypes
  },

  sType: function() {
    if (this.outlet == true) {
      return types.OUTLET_STYPE
    } else {
      return types.LIGHTBULB_STYPE
    }
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


module.exports = HomeMaticSwitchChannel;
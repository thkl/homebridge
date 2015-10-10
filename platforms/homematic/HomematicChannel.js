var types = require("HAP-NodeJS/accessories/types.js");


function HomeMaticGenericChannel(log,platform, id ,name, type ,adress,special) {
  this.name     = name;
  this.type     = type;
  this.adress   = adress;
  this.log      = log;
  this.platform = platform;
  this.state  	= [];
  this.eventupdate = false;
  this.special  = special;
  this.currentStateCharacteristic = [];
}




HomeMaticGenericChannel.prototype = {


 // Return current States
  query: function(dp,callback) {

    if (this.state[dp] != undefined) {
      callback(this.state[dp]);
    } else {
      this.remoteGetValue(dp);
    }

  },

  dpvalue:function(dp,fallback) {
    if (this.state[dp] != undefined) {
      return(this.state[dp]);
    } else {
      return fallback;
    }
  },

  remoteGetValue:function(dp) {
      var that = this;
  	  that.platform.getValue(that.adress,dp,function(newValue) {
  	    that.log("Remote Value Response for " + that.adress + "." + dp + "->" + newValue);
  	    that.eventupdate = true;
  	    that.cache(dp,newValue);
  	    that.eventupdate = false;
  	  });
  },
  
  
  event:function(dp,newValue) {
    
    if (dp=="LEVEL") {
      newValue = newValue*100;
    }

    this.eventupdate = true;
    this.cache(dp,newValue);
    this.eventupdate = false;
  },


  cache:function(dp,value) {
    var that = this;
    if (that.currentStateCharacteristic[dp]!=undefined) {
            that.currentStateCharacteristic[dp].updateValue(value, null);
    }
    this.state[dp] = value;
  },


  delayed: function(mode, dp,value,delay) {
  
   if (this.eventupdate==true) {
    return;
   }
   
    var timer = this.delayed[delay];
    if( timer ) {
      clearTimeout( timer );
    }

    this.log(this.name + " delaying command "+mode + " " + dp +" with value " + value);
    var that = this;
    this.delayed[delay] = setTimeout( function(){clearTimeout(that.delayed[delay]);that.command(mode,dp,value)}, delay?delay:100 );
  },

  command: function(mode,dp,value,callback) {
 
   if (this.eventupdate==true) {
    return;
   }
   var that = this;

   if (mode == "set") {
       
		that.platform.setValue(that.adress,dp,value);
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
    
    
    if (this.type=="SWITCH") {
       cTypes.push({
        cType: types.POWER_STATE_CTYPE,
        onUpdate: function(value) {
            that.command("set","STATE" , (value==1)?true:false)
        },

        onRead: function(callback) {
            that.query("STATE",callback);
        },
        
        onRegister: function(characteristic) { 
            that.currentStateCharacteristic["STATE"] = characteristic;
            characteristic.eventEnabled = true;
        },
             
        perms: ["pw","pr","ev"],
        format: "bool",
        initialValue: that.dpvalue("STATE",0),
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Change the power state",
        designedMaxLength: 1
      });
      
      if (this.special=="OUTLET") {
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
    }
    
    
    if (this.type=="DIMMER") {
     cTypes.push({
        cType: types.POWER_STATE_CTYPE,
        onUpdate: function(value) {
            that.command("set","LEVEL" , (value==true) ? "1" : "0")
        },

        onRead: function(callback) {
            that.query("LEVEL",callback);
        },
        
        onRegister: function(characteristic) { 
            that.currentStateCharacteristic["LEVEL"] = characteristic;
            characteristic.eventEnabled = true;
        },
        
        perms: ["pw","pr","ev"],
        format: "bool",
        initialValue: (that.dpvalue("LEVEL")>0,0),
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Change the power state",
        designedMaxLength: 1
      },
      {
        cType: types.BRIGHTNESS_CTYPE,
        onUpdate: function(value) {
          that.delayed("set","LEVEL" , String(value/100),100);
        },
        
        onRead: function(callback) {
           that.query("LEVEL",callback);
        },
        
        onRegister: function(characteristic) { 
            that.currentStateCharacteristic["LEVEL"] = characteristic;
            characteristic.eventEnabled = true;
        },

        
        perms: ["pw","pr","ev"],
        format: "int",
        initialValue: that.dpvalue("LEVEL",0),
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Adjust Brightness of Light",
        designedMinValue: 0,
        designedMaxValue: 100,
        designedMinStep: 1,
        unit: "%"
      });
    }

    if (this.type=="BLIND") {
     cTypes.push(
      {
        cType: types.WINDOW_COVERING_CURRENT_POSITION_CTYPE,
        onUpdate: function(value) {
          that.delayed("set","LEVEL" , String(value/100),100);
        },
        
        onRead: function(callback) {
           that.query("LEVEL",callback);
        },
        
        onRegister: function(characteristic) { 
            that.currentStateCharacteristic["LEVEL"] = characteristic;
            characteristic.eventEnabled = true;
        },

        
        perms: ["pw","pr","ev"],
        format: "int",
        initialValue: that.dpvalue("LEVEL",0),
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Adjust Brightness of Light",
        designedMinValue: 0,
        designedMaxValue: 100,
        designedMinStep: 1,
        unit: "%"
      });
    }
    
    if (this.type=="SHUTTER_CONTACT") { 
	 cTypes.push(
	 {  
	 	cType: types.CONTACT_SENSOR_STATE_CTYPE,
             onUpdate: function(value) {
            that.command("set","STATE" , (value==1)?true:false)
        },

        onRead: function(callback) {
            that.query("STATE",callback);
        },
        
        onRegister: function(characteristic) { 
            that.currentStateCharacteristic["STATE"] = characteristic;
            characteristic.eventEnabled = true;
        },
      
      perms: ["pr"],
      format: "bool",
      initialValue: 0,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Current State"
	 });
	}
    
    if (this.type=="CLIMATECONTROL_RT_TRANSCEIVER") {
    
    cTypes.push({
      cType: types.NAME_CTYPE,onUpdate: null,perms: ["pr"],format: "string",
      initialValue: this.name,supportEvents: true,supportBonjour: false,manfDescription: "Name of service",designedMaxLength: 255
    },
	
	{
      cType: types.CURRENTHEATINGCOOLING_CTYPE,onUpdate: null,
      perms: ["pr"],format: "int",initialValue: 1,supportEvents: false,
      supportBonjour: false,manfDescription: "Current Mode",designedMaxLength: 1,designedMinValue: 1,designedMaxValue: 1,designedMinStep: 1
    },
  
    {
      cType: types.TARGETHEATINGCOOLING_CTYPE,onUpdate: null,perms: ["pw","pr"],
      format: "int",initialValue: 1,supportEvents: false,supportBonjour: false,manfDescription: "Target Mode",
      designedMinValue: 1,designedMaxValue: 1,designedMinStep: 1
    },
    
    {
      cType: types.CURRENT_TEMPERATURE_CTYPE,
      onUpdate: null,
              
      onRead: function(callback) {
 		that.query("ACTUAL_TEMPERATURE",callback);
      },
        
      onRegister: function(characteristic) { 
            that.currentStateCharacteristic["ACTUAL_TEMPERATURE"] = characteristic;
            characteristic.eventEnabled = true;
      },
      perms: ["pw","pr","ev"], perms: ["pr"],format: "double",
      initialValue: that.dpvalue("ACTUAL_TEMPERATURE",20),
      supportEvents: false,supportBonjour: false,manfDescription: "Current Temperature",unit: "celsius"
    },
    
    {
      cType: types.TARGET_TEMPERATURE_CTYPE,
      onUpdate: function(value) {
            that.delayed("set", "SET_TEMPERATURE", value,500);
      },
      onRead: function(callback) {
			that.query("SET_TEMPERATURE",callback);
      },
      onRegister: function(characteristic) { 
            that.currentStateCharacteristic["SET_TEMPERATURE"] = characteristic;
            characteristic.eventEnabled = true;
      },
      perms: ["pw","pr","ev"],format: "double",
      initialValue: that.dpvalue("SET_TEMPERATURE",16),
      supportEvents: false,supportBonjour: false, manfDescription: "Target Temperature",
      designedMinValue: 16,designedMaxValue: 38,designedMinStep: 1,unit: "celsius"
    },
    
    {
      cType: types.TEMPERATURE_UNITS_CTYPE,onRead: null,
      perms: ["pr"],format: "int",initialValue: 0,supportEvents: false,
      supportBonjour: false,manfDescription: "Current Temperature Unit",unit: "celsius"
    }

   );
   }
    
	
    return cTypes
  },

  sType: function() {
  
    if (this.type=="SWITCH") {
    
     if (this.special=="OUTLET") {
      return types.OUTLET_STYPE;
     } else {
      return types.LIGHTBULB_STYPE;
     }
	}
	    
    if (this.type=="DIMMER") { 
      return types.LIGHTBULB_STYPE;
	}

    if (this.type=="BLIND") { 
      return types.WINDOW_COVERING_STYPE;
	}

    if (this.type=="CLIMATECONTROL_RT_TRANSCEIVER") { 
      return types.THERMOSTAT_STYPE;
	}
	
	 if (this.type=="SHUTTER_CONTACT") { 
      return types.CONTACT_SENSOR_STYPE;
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


module.exports = HomeMaticGenericChannel;
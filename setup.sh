#!/usr/bin/env

# Check if we can use colours in our output
use_colour=0
[ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null && use_colour=1

# Some useful functions
progress() {
	[ $use_colour -eq 1 ] && echo -ne "\033[01;32m"
	echo "$@" >&2
	[ $use_colour -eq 1 ] && echo -ne "\033[00m"
}

info() {
	[ $use_colour -eq 1 ] && echo -ne "\033[01;34m"
	echo "$@" >&2
	[ $use_colour -eq 1 ] && echo -ne "\033[00m"
}

die () {
	[ $use_colour -eq 1 ] && echo -ne "\033[01;31m"
	echo "$@" >&2
	[ $use_colour -eq 1 ] && echo -ne "\033[00m"
	exit 1
}

install_package() {
	package=$1
	info "install ${package}"
	sudo apt-get -y --force-yes install $package 2>&1 > /dev/null
	return $?
}

# check architecture
sudo test "`dpkg --print-architecture`" == "armhf" || die "This Repos is only for armhf."

# set timezone and update system
info "Setting up locale and keyboard"
sudo dpkg-reconfigure locales

TIMEZONE="Europe/Berlin"
echo $TIMEZONE | sudo tee /etc/timezone
sudo cp /usr/share/zoneinfo/${TIMEZONE} /etc/localtime
sudo dpkg-reconfigure -f noninteractive tzdata

info "Setting up Hostname"
echo 'Homebridge' | sudo tee /etc/hostname

info "Cleaning up"
sudo dpkg --configure -a

info "Update Package Lists this may take some time (10-20 min) depending on your internet connection"
sudo apt-get update -y
sudo apt-get dist-upgrade -y
info "Done"

info "Installing Zeroconf"

install_package "libavahi-compat-libdnssd-dev"
install_package "gcc-4.8 g++-4.8"
install_package "libkrb5-dev"

info "Installing node"
wget https://s3-eu-west-1.amazonaws.com/conoroneill.net/wp-content/uploads/2015/03/node-v0.12.1-linux-arm-pi.tar.gz
tar -zxvf node-v0.12.1-linux-arm-pi.tar.gz
cd node-v0.12.1-linux-arm-pi
sudo cp -R * /usr/local/


info "Cloning Repository"
cd /home/pi

CONFIG = "/home/pi/homebridge/config.json"
VERSION=$(whiptail --menu "Which Version do you want to install" 20 60 10 \
      "0" "Homebridge nfarina New Plugin Version with Homematic Plugin" \
      "1" "Homebridge thkl Old Homematic Fork" \
      "2" "Homebridge thkl Old Homematic Fork BETA-Version" \
      3>&1 1>&2 2>&3)
      
    if [ $? -eq 0 ]; then  

	  case "${VERSION}" in

         0)
          sudo npm install -g homebridge
          sudo npm install -g homebridge-homematic
          mkdir /home/pi/.homebridge
          CONFIG = "/home/pi/.homebridge/config.json"
         ;;
         
         
         1)
          git clone -b master --single-branch https://github.com/thkl/homebridge.git
         ;;
      	
		
		 2)
          git clone -b xmlrpc --single-branch https://github.com/thkl/homebridge.git
         ;;
         
       esac

    fi

cd homebridge

info "Installing Node Modules"
npm install

info "Setup"

hazconfig="$(cat $CONFIG| grep 'bridge' | wc -l)"
if [ "$hazconfig" = "0" ]; then

  CCUIP=$(whiptail --inputbox "Please enter your CCU IP" 20 60 "000.000.000.000" 3>&1 1>&2 2>&3)
  if [ $? -eq 0 ]; then
   echo "{\"bridge\": {\"name\": \"Homebridge\", \"username\": \"CC:22:3D:E3:CE:30\",\"port\": 51826,\"pin\": \"031-45-154\"}," >> $CONFIG;
   echo "\"description\": \"This is an autogenerated config. only the homematic platform is enabled. see the sample for more\"," >> $CONFIG;
   echo "\"platforms\": [" >> $CONFIG;
   echo "{\"platform\": \"HomeMatic\",\"name\": \"HomeMatic CCU\",\"ccu_ip\": \"$CCUIP\"," >> $CONFIG;
   echo "\"filter_device\":[],\"filter_channel\":[],\"outlets\":[]}"  >> $CONFIG;
   echo "],\"accessories\": []}"  >> $CONFIG;
  fi
fi

whiptail --yesno "Would you like to start homebridge at boot by default?" $DEFAULT 20 60 2
RET=$?
if [ $RET -eq 0 ]; then

  file="/home/pi/.homebridge/config.json"
  if [ -f "$file" ]
  then
    wget https://raw.githubusercontent.com/thkl/homebridge/xmlrpc/homebridge
  	sudo cp /home/pi/homebridge/homebridge /etc/init.d/homebridge
  else
  	sudo cp /home/pi/homebridge/homebridge.txt /etc/init.d/homebridge
  fi
  	sudo chmod 755 /etc/init.d/homebridge
	sudo update-rc.d homebridge defaults
fi

echo '127.0.0.1  Homebridge' | sudo tee /etc/hosts

info "Done. If there are no error messages you are done."
info "Please navigate to https://github.com/nfarina/homebridge for more informations."
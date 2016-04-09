echo "/dev/mmcblk0p3 /usr/local ext4 errors=remount-ro,noatime 0 0" >> /etc/fstab
mkfs.ext4 /dev/mmcblk0p3
# Achtung manuelle Eingabe erforderlich
mount /usr/local
mkdir /usr/local/bin 
mkdir /usr/local/etc 
mkdir /usr/local/games 
mkdir /usr/local/include 
mkdir /usr/local/lib 
mkdir /usr/local/sbin 
mkdir /usr/local/share 
mkdir /usr/local/src 
mkdir /usr/local/share/man
ln -s /usr/local/share/man /usr/local/man


#RaspberryMatic Image laden und unter /mnt/image mounten
#--------------------------------------------------

#wget -O RaspberryMatic-2.15.5-3.img.zip "http://update.homematic.com/firmware/download?cmd=download&version=2.15.5&serial=TMP&lang=de&product=HM-IMAGE-RASPBERRYMATIC"
wget -O /root/RaspberryMatic-2.15.5-3.img.zip "http://update.homematic.com/firmware/download?cmd=download&version=2.15.5&serial=TMP&lang=de&product=HM-IMAGE-RASPBERRYMATIC"
unzip RaspberryMatic-2.15.5-3.img.zip
# Das entpacken benötigt ca. 10 Minuten, nicht ungeduldig werden
mkdir /mnt/image
mount /root/raspberrymatic-2.15.5-3.img /mnt/image -ooffset=$((22528*512))

#copy /bin
#--------------------------------------------------

mkdir -p /opt/hm/bin
mkdir -p /opt/hm/sbin

cp /mnt/image/bin/ReGaHss /opt/hm/bin
cp /mnt/image/bin/SetInterfaceClock /opt/hm/bin 
cp /mnt/image/bin/checkDHCP /opt/hm/bin
cp /mnt/image/bin/crypttool /opt/hm/bin
cp /mnt/image/bin/dhcp.script /opt/hm//bin
cp /mnt/image/bin/dhcp_check.script /opt/hm/bin
cp /mnt/image/bin/eq3configcmd /opt/hm/bin
cp /mnt/image/bin/eq3configd /opt/hm/bin
cp /mnt/image/bin/hm_autoconf /opt/hm/bin
cp /mnt/image/bin/hm_deldev /opt/hm/bin
cp /mnt/image/bin/hm_startup /opt/hm/bin
cp /mnt/image/bin/hs485d /opt/hm/bin
cp /mnt/image/bin/hs485dLoader /opt/hm/bin
cp /mnt/image/bin/hss_led /opt/hm/bin
cp /mnt/image/bin/mountSD /opt/hm/bin
cp /mnt/image/bin/ntpclient /opt/hm/bin
cp /mnt/image/bin/rfd /opt/hm/bin
cp /mnt/image/bin/setHWClock.sh /opt/hm/bin
cp /mnt/image/bin/setclock /opt/hm/bin
cp /mnt/image/bin/setfirewall.tcl /opt/hm/bin
cp /mnt/image/bin/setlgwkey.sh /opt/hm/bin
cp /mnt/image/bin/ssdpd /opt/hm/bin
cp /mnt/image/bin/tclsh /opt/hm/bin
cp /mnt/image/bin/update_firmware_pre /opt/hm/bin
cp /mnt/image/bin/update_firmware_run /opt/hm/bin
cp /mnt/image/bin/yaku-ns /opt/hm/bin
cp /mnt/image/sbin/daemonize /opt/hm/sbin

ln -s /opt/hm/bin/ReGaHss /bin
ln -s /opt/hm/bin/SetInterfaceClock /bin
ln -s /opt/hm/bin/checkDHCP /bin 
ln -s /opt/hm/bin/crypttool /bin
ln -s /opt/hm/bin/dhcp.script /bin
ln -s /opt/hm/bin/dhcp_check.script /bin
ln -s /opt/hm/bin/eq3configcmd /bin
ln -s /opt/hm/bin/eq3configd /bin
ln -s /opt/hm/bin/hm_autoconf /bin
ln -s /opt/hm/bin/hm_deldev /bin
ln -s /opt/hm/bin/hm_startup /bin
ln -s /opt/hm/bin/hs485d /bin
ln -s /opt/hm/bin/hs485dLoader /bin
ln -s /opt/hm/bin/mountSD /bin
ln -s /opt/hm/bin/rfd /bin
ln -s /opt/hm/bin/setclock /bin
ln -s /opt/hm/bin/setfirewall.tcl /bin
ln -s /opt/hm/bin/setlgwkey.sh /bin
ln -s /opt/hm/bin/ssdpd /bin
ln -s /opt/hm/bin/tclsh /bin
ln -s /opt/hm/bin/update_firmware_pre /bin
ln -s /opt/hm/bin/update_firmware_run /bin  
ln -s /usr/sbin/syslogd /sbin/syslogd
ln -s /usr/bin/vi /bin
ln -s /opt/hm/sbin/daemonize /sbin

#copy firmware & HM specific
#--------------------------------------------------

cp -R /mnt/image/firmware /
cp /mnt/image/boot/VERSION /boot
cp -R /mnt/image/opt/HMServer /opt

#copy lib
#--------------------------------------------------

mkdir -p /opt/hm/lib
cp /mnt/image/lib/libLanDeviceUtils.so /opt/hm/lib
cp /mnt/image/lib/libUnifiedLanComm.so /opt/hm/lib
cp /mnt/image/lib/libXmlRpc.so /opt/hm/lib
cp /mnt/image/lib/libelvutils.so /opt/hm/lib
cp /mnt/image/lib/libeq3config.so /opt/hm/lib
cp /mnt/image/lib/libfirewall.tcl /opt/hm/lib
cp /mnt/image/lib/libhsscomm.so /opt/hm/lib
cp /mnt/image/lib/libtcl8.2.so /opt/hm/lib
cp /mnt/image/lib/libxmlparser.so /opt/hm/lib
cp /mnt/image/lib/tclrega.so /opt/hm/lib
cp /mnt/image/lib/tclrpc.so /opt/hm/lib
cp /mnt/image/lib/tclticks.so /opt/hm/lib
cp -R /mnt/image/lib/tcl8.2 /opt/hm/lib

ln -s /opt/hm/lib/libLanDeviceUtils.so /lib
ln -s /opt/hm/lib/libUnifiedLanComm.so /lib
ln -s /opt/hm/lib/libXmlRpc.so /lib
ln -s /opt/hm/lib/libelvutils.so /lib
ln -s /opt/hm/lib/libeq3config.so /lib
ln -s /opt/hm/lib/libfirewall.tcl /lib
ln -s /opt/hm/lib/libhsscomm.so /lib
ln -s /opt/hm/lib/libtcl8.2.so /lib
ln -s /opt/hm/lib/libxmlparser.so /lib
ln -s /opt/hm/lib/tclrega.so /lib
ln -s /opt/hm/lib/tclrpc.so /lib
ln -s /opt/hm/lib/tcl8.2 /lib

#copy www
#--------------------------------------------------

cp -R /mnt/image/www /

#copy & prepare etc
#--------------------------------------------------

/etc/init.d/lighttpd stop
cp -R /mnt/image/usr/local/etc /usr/local/
cp -R /mnt/image/etc/config_templates /mnt/image/etc/lighttpd /mnt/image/etc/rega.conf /mnt/image/etc/ifplugd /etc
cp -R /mnt/image/etc/init.d/S* /etc/init.d/
cp /mnt/image/etc/rega.conf /etc
ln -s /usr/local/config/TZ /etc/TZ


ln -s /usr/local/etc/config /etc/config

/etc/init.d/lighttpd start
sed -i 's/  PATH=\"\/usr\/local\/sbin:\/usr\/local\/bin:\/usr\/sbin:\/usr\/bin:\/sbin:\/bin\"/  PATH=\"\/usr\/local\/sbin:\/usr\/local\/bin:\/usr\/sbin:\/usr\/bin:\/sbin:\/bin:\/opt\/hm\/bin:\/opt\/hm\/sbin\"/g' /etc/profile
sed -i 's/      start-stop-daemon -S -q -p \/var\/run\/HMServer.pid --exec java -- -Xmx32m -Dlog4j.configuration=file:\/\/\/etc\/config\/log4j.xml -Dfile.encoding=ISO-8859-1 -jar \/opt\/HMServer\/HMServer.jar \&/      start-stop-daemon -S -q -p \/var\/run\/HMServer.pid --exec \/usr\/bin\/java -- -Xmx32m -Dlog4j.configuration=file:\/\/\/etc\/config\/log4j.xml -Dfile.encoding=ISO-8859-1 -jar \/opt\/HMServer\/HMServer.jar \&/g' /etc/init.d/S61HMServer
echo 'export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:/usr/lib:/usr/local/lib:/opt/hm/lib' >> /etc/profile

#Java installieren
#--------------------------------------------------

# Download von http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html
# Linux ARM v6/v7 Hard Float ABI
# Datein in das /root Verzeichnis des Rasp kopieren

tar zxvf /root/jdk-8u65-linux-arm32-vfp-hflt.tar.gz -C /opt
ln -s /opt/jdk1.8.0_65 /opt/jre
update-alternatives --install /usr/bin/javac javac /opt/jre/bin/javac 1
update-alternatives --install /usr/bin/java java /opt/jre/bin/java 1
update-alternatives --config javac
update-alternatives --config java

#OCCU starten
#--------------------------------------------------

/etc/init.d/occ

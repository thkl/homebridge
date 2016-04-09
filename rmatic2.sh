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
unzip /root/RaspberryMatic-2.15.5-3.img.zip
# Das entpacken benötigt ca. 10 Minuten, nicht ungeduldig werden

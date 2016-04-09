#Vorraussetzungen
#--------------------------------------------------

# 16GB SD Karte
# raspbian-ua-netinst - Raspbian unattended netinstaller
# https://github.com/debian-pi/raspbian-ua-netinst
# Nach der Anleitung auf obiger Seite eine SD Karte vorbereiten.
# Bevor von der SD Karte installiert wird, die angehängte Datei installer-config.txt auf die SD-Karte kopieren
# von der SD Karte booten und warten, Ihr erhaltet dadurch ein Raspbian Basic Image
# Mit der installer-config.txt erhaltet Ihr eine 12 GB Große root Partition, der Rest bleibt vorerst frei
# User: root Passwort: 1
# mit dem Parameter rootsize=+12288M in der installer-config.txt könnt Ihr die Größe der root Partition festlegen.
# Mindesten 2GB sollten für /usr/local frei bleiben!

#raspi_basic_config
#--------------------------------------------------

dpkg-reconfigure locales
# de_DE ISO-8859-1
# de_DE.UTF-8 UTF-8
# de_DE@euro ISO-8859-15
# de_DE.UTF-8 UTF-8 als Haupt locales wählen
dpkg-reconfigure tzdata
# Europa -> Berlin
apt-get update -y
apt-get upgrade -y
apt-get -q=2 install libatomic1 libdaemon0 curl libpcap0.8 lighttpd iptables ifplugd unzip inetutils-syslogd fdflush setserial i2c-tools msmtp pcregrep rsync rpi-update openvpn tcl udhcpc dma i2c-tools mtd-utils
rpi-update

# /usr/local muss eine eigene Partition sein, nur dann funktioniert es mit den Backups!
#Eigene Partition /usr/local erstellen
echo -e "n\np\n3\n\n+2G\nw" | fdisk /dev/mmcblk0
reboot

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

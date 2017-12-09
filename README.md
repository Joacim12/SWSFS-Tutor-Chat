# SWSFS-Tutor-Chat

[![Build Status](https://travis-ci.org/Joacim12/SWSFS-Tutor-Chat.svg?branch=master)](https://travis-ci.org/Joacim12/SWSFS-Tutor-Chat)
[![Waffle.io - Columns and their card count](https://badge.waffle.io/Joacim12/SWSFS-Tutor-Chat.svg?columns=all)](https://waffle.io/Joacim12/SWSFS-Tutor-Chat)

## How to part:
Set up a system for local development:

#### Start med at få en server op der kan køre tomcat8, i mit tilfælde har jeg valgt en raspberry pi der kører headless raspbian, så jeg har slået ssh til. og bruger git bash til at forbinde med.
 - log in på server vha -ssh pi@ipadresse
 - sørg for at køre sudo apt-get update så du har den seneste pakke liste.
 - installer java: 
    sudo apt-get install default-jdk
 #### lav en tomcatuser:
 - skriv kommando: sudo groupadd tomcat
 - skriv kommando: sudo useradd -s /bin/false -g tomcat -d /opt/tomcat tomcat
 - download og installer tomcat
 - find linket til den seneste tar.gz fil fra: https://tomcat.apache.org/download-80.cgi under binary distributions og så core
 - skriv kommando: cd /tmp
 - skriv kommando: curl -O http://ftp.download-by.net/apache/tomcat/tomcat-8/v8.5.24/bin/apache-tomcat-8.5.24.tar.gz
 - skriv kommando: sudo mkdir /opt/tomcat
 - skriv kommando: sudo tar xzvf apache-tomcat-8.5.24.tar.gz -C /opt/tomcat --strip-components=1
 #### Opdater tomcats tilladelser:
   - skriv kommando: cd /opt/tomcat
   - skriv kommando: sudo chgrp -R tomcat /opt/tomcat (Giver tomcat gruppen ejerskab over tomcat og undermapper)
   - skriv kommando: sudo chmod -R g+r conf
   - skriv kommando: sudo chmod g+x conf
   - skriv kommando: sudo chown -R tomcat webapps/ work/ temp/ logs/
 #### Sæt tomcat op til at køre som en service:
   Start med at finde ud af hvor JAVA_HOME er, 
   - skriv kommando: sudo update-java-alternatives -l
   
   i mit tilfælde er outputtet: jdk-8-oracle-arm32-vfp-hflt 318 /usr/lib/jvm/jdk-8-oracle-arm32-vfp-hflt
   så mit JAVA_HOME er: /usr/lib/jvm/jdk-8-oracle-arm32-vfp-hflt
   - skriv kommando: sudo nano /etc/systemd/system/tomcat.service 
        - Kopier nedenstående(og husk at ret din JAVA_HOME variabel):
```
[Unit]
Description=Apache Tomcat Web Application Container
After=network.target

[Service]
Type=forking

Environment=JAVA_HOME=/usr/lib/jvm/jdk-8-oracle-arm32-vfp-hflt
Environment=CATALINA_PID=/opt/tomcat/temp/tomcat.pid
Environment=CATALINA_HOME=/opt/tomcat
Environment=CATALINA_BASE=/opt/tomcat
Environment='CATALINA_OPTS=-Xms512M -Xmx1024M -server -XX:+UseParallelGC'
Environment='JAVA_OPTS=-Djava.awt.headless=true -Djava.security.egd=file:/dev/./urandom'

ExecStart=/opt/tomcat/bin/startup.sh
ExecStop=/opt/tomcat/bin/shutdown.sh

User=tomcat
Group=tomcat
UMask=0007
RestartSec=10
Restart=always

[Install]
WantedBy=multi-user.target
```
tryk ctrl +x for at gemme.
   skriv kommando: sudo systemctl daemoen-reload
   skriv kommando: sudo systemctl start tomcat
   skriv kommando: sudo systemctl status tomcat
   
   Her skulle du gerne få en linje der er grøn og der står at tomcat kører :-)
   
-Opret en bruger til tomcats webinterface:
  skriv kommando:  sudo nano /opt/tomcat/conf/tomcat-users.xml
  Under tomcat-users tagget tilføj en linje med din bruger(Husk at rette bruger og kode til noget mere sikkert):
  <user username="admin" password="password" roles="manager-gui,admin-gui"/> 
  tryk ctrl + x for at lukke og gemme.
  skriv kommando: 
      sudo nano /opt/tomcat/webapps/manager/META-INF/context.xml
      Her fjern Valve tagget, eller udkommenter det med <!--<tag/>-->
      skriv kommando: sudo systemctl restart tomcat   
      Nu skulle du have adgang til tomcats webinterface! Tilgå din server i en browser og skriv port 8080 efter ip adresssen, nu skulle du meget gerne se en tomcat skærm :)
      Hvis alt virker husk at slå tomcat til at boote ved hver start:
      skriv kommando: sudo systemctl enable tomcat

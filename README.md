# SWSFS-Tutor-Chat

[![Build Status](https://travis-ci.org/Joacim12/SWSFS-Tutor-Chat.svg?branch=master)](https://travis-ci.org/Joacim12/SWSFS-Tutor-Chat)
[![Waffle.io - Columns and their card count](https://badge.waffle.io/Joacim12/SWSFS-Tutor-Chat.svg?columns=all)](https://waffle.io/Joacim12/SWSFS-Tutor-Chat)

## How to part:
#### Set up a system for local development:

## TOMCAT
- Start med at få en server op der kan køre tomcat8, i mit tilfælde har jeg valgt en raspberry pi der kører headless raspbian, så jeg har slået ssh til. og bruger git bash til at forbinde med.
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
   
   i mit tilfælde er outputtet: **jdk-8-oracle-arm32-vfp-hflt 318 /usr/lib/jvm/jdk-8-oracle-arm32-vfp-hflt**
   så mit JAVA_HOME er: **/usr/lib/jvm/jdk-8-oracle-arm32-vfp-hflt**
   - skriv kommando: sudo nano /etc/systemd/system/tomcat.service 
     - Kopier nedenstående(og husk at ret din JAVA_HOME variabel):
```Shell
[Unit]
Description=Apache Tomcat Web Application Container
After=network.target

[Service]
Type=forking

Environment=JAVA_HOME=**/usr/lib/jvm/jdk-8-oracle-arm32-vfp-hflt**
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
  - skriv kommando: sudo systemctl daemoen-reload
  - skriv kommando: sudo systemctl start tomcat
  - skriv kommando: sudo systemctl status tomcat
   
   Her skulle du gerne få en linje der er grøn og der står at tomcat kører :-)
   
#### Opret en bruger til tomcats webinterface:
  - skriv kommando:  sudo nano /opt/tomcat/conf/tomcat-users.xml
  - Under tomcat-users tagget tilføj en linje med din bruger(Husk at rette bruger og kode til noget mere sikkert):
  ```<user username="admin" password="password" roles="manager-gui,admin-gui"/> ```
  - tryk ctrl + x for at lukke og gemme.
  - skriv kommando: sudo nano /opt/tomcat/webapps/manager/META-INF/context.xml
    -  Her fjern Valve tagget, eller udkommenter det med <!--<tag/>-->
    -  skriv kommando: sudo systemctl restart tomcat   
      Nu skulle du have adgang til tomcats webinterface! Tilgå din server i en browser og skriv port 8080 efter ip adresssen, nu skulle du meget gerne se en tomcat skærm :)
      Hvis alt virker husk at slå tomcat til at boote ved hver start:
     - skriv kommando: sudo systemctl enable tomcat
     
## MySQL
- Skriv kommando: sudo apt-get install mysql-server
- skriv kommando: mysql_secure_installation
  - Fjern anonyme brugere
  - Slå root login remotely fra
  - Fjern test databaser
  - Reload tabeller
- Skriv kommando: mysql -u root -p
- Skriv kommando: CREATE USER 'tutorChat'@'%' IDENTIFIED BY 'TutorLogin2017!';
- Skriv kommando: CREATE DATABASE tutorchat;
- Skriv kommando: GRANT ALL PRIVILEGES ON tutorchat.* TO 'tutorChat'@'%" IDENTIFIED BY 'TutorLogin2017!;
- Skriv kommando: FLUSH PRIVILEGES;
- Skriv kommando: sudo nano /etc/mysql/my.cnf
- udkommenter bind address med #
- Skriv kommando: sudo service mysql stop
- Skriv kommando: sudo service mysql start

- Åben mysql workbench og forbind til serveren(Kan hentes her: https://www.mysql.com/products/workbench/) for lettere at se data osv.
     
## Get the code // Set up for local development
- Start med at skrive git clone https://github.com/joacim12/SWSFS-Tutor-Chat.git i git bash
- Start netbeans eller hvad IDE du nu bruger til at kode java med og åben backend mappen i den klonede mappe.
- Vælg projektet og resolve problemer hvis der er nogle, og så kør clean and build.
- Nu kan du starte projektet men vi mangler stadig at forbinde til en database!
- Højreklik på projektet vælg new og find Persistence unit, kald den "PU"
- Lav en ny database connection til den database vi lavede tidligere med brugeren tutorChat (Brug MySQL Connector)
- Under Source Packages vælg pakken facade, og åben klassen UserFacade
- Kør filen og den opretter en bruger 'Tutor', samt 'Elev'
- Du er nu live, og klar til at bygge videre på systemet :-)
- Frontenden / React delen er i frontend mappen, og backenden i backend mappen.

## Deploy til server
- Sørg for at have npm installeret, kan hentes her: https://www.npmjs.com/
- naviger til frontend mappen, og kør npm install via en terminal.
- åben package.json og skift "serverURL":'url' til din servers ip adresse, i mit tilfælde "ws://192.168.0.103:8080/chat/", gem ændringer.
- Samt "homepage" til din url på serveren, i mit tilfælde "http://192.168.0.103:8080".
- åben App.js og i Router tagget fjern "basename={"/TutorChat"}
- kør npm run build
- i netbeans hvor du har projektet åbent find web pages og fjern alt udover 'META-INF' og 'WEB-INF'
- kopier herefter indholdet af build mappen fra frontend ind under webpages
- build projektet i netbeans
- Naviger til din servers ip:8080C/manager
- Login med de credentials du angav da du redigerede /opt/tomcat/conf/tomcat-users.xml
- Undeploy alt udover /manager
- Find ROOT.war filen i din target mappe, og deploy den.
- Systemet kan nu tilgås på 192:168.0.103:8080 !!

## SSL / Proxy / Domæne (Optionel)
#### SSL er godt, og nemt at installere på nginx, så lad os bruge nginx, samt erhverve et domæne.
- Skriv kommando: sudo apt-get install nginx
- Hvis du åbner ipen på din server vil du nu se en nginx side.
#### Viderstil websockets, og request mod manager til tomcat
- skriv kommando sudo nano /opt/tomcat/conf/server.xml
- find de to connector tags og tilføj: "address="127.0.0.1" tryk ctrl + x for at gemme, nu er det kun localhost der kan tilgå tomcat.
- skriv kommando: sudo service tomcat restart, du kan nu ikke længere tilgå tomcat via port 8080
#### Opsætning af nginx 
- Skriv kommando: sudo nano /etc/nginx/sites-available/default
- Start med at tilføje følgende upstream blok:
```
upstream tomcat{
  server 127.0.0.1:8080 fail_timeout=0;
}
```
- for at viderstille websocketen tilføj følgende inde i din serverblok:
```
location /chat/ {
                include proxy_params;
                proxy_pass http://tomcat/chat/;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection $http_connection;
                proxy_read_timeout 864000;

        }

```
- for at stadig kunne tilgå tomcat's manager tilføj følgende til server blokken:
```
location /manager/ {
                include proxy_params;
                proxy_pass http://tomcat/manager/;
        }

```



#### Domæne
Jeg har registreret domænet cphbusiness.tk og peget på min raspberry pi, domænet var gratis på dot.tk

#### ssl certifikat
Nu da jeg har et domæne kan jeg sætte ssl op, og bruge en wss websocket så alt data der bliver sendt er krypteret!
Først lad os tilføje domæne navnene til vores nginx config fil.
- Skriv kommando: sudo nano /etc/nginx/sites-available/default
- find server_name og tilføj dit domæne, i mit tilfælde: server_name cphbusiness.tk www.cphbusiness.tk
Installer certbot fra lets encrypt for at få et gratis ssl certifikat de har guides til de fleste os'er her: https://certbot.eff.org
For at score a+ hos ssllabs skal vi også bruge en DH gruppe, det gøres på følgende måde:
```
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
```
Vent nogle minutter og vi har en en DH gruppe placeret i ```Shell /etc/ssl/certs/dhparam.pem```
For at bruge certifikatet tast ```Shell sudo nano /etc/nginx/snippets/ssl-params.conf```
og kopier følgende ind og gem med ctrl + x:
```Shell
ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
ssl_prefer_server_ciphers on;
ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
ssl_ecdh_curve secp384r1;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
# Disable preloading HSTS for now.  You can use the commented out header line that includes
# the "preload" directive if you understand the implications.
#add_header Strict-Transport-Security "max-age=63072000; includeSubdomains; preload";
add_header Strict-Transport-Security "max-age=63072000; includeSubdomains";
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;

ssl_dhparam /etc/ssl/certs/dhparam.pem;
```
åben nginx konfigurations filen ```sudo nano /etc/nginx/sites-available/default``` og tilføj ```include snippets/ssl-params.conf;```
under server blok to.

Genstart nginx med ```sudo systemctl restart nginx```

Kør nu en test fra ssl labs, og du skulle gerne se et a+ :) 

## SSH ved hjælp af keys.
- For at sikre vores server lidt mere kan vi 

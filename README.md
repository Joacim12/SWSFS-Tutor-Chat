# SWSFS-Tutor-Chat

[![Build Status](https://travis-ci.org/Joacim12/SWSFS-Tutor-Chat.svg?branch=master)](https://travis-ci.org/Joacim12/SWSFS-Tutor-Chat)
[![Waffle.io - Columns and their card count](https://badge.waffle.io/Joacim12/SWSFS-Tutor-Chat.svg?columns=all)](https://waffle.io/Joacim12/SWSFS-Tutor-Chat)

[Indledning](#indledning)

[Demo](#demo)

[Kommandoer](#kommandoer)  

[Firebase](#firebase)

[Logging](#logging) 

[Forslag til manglende features](#forslag-til-features)

[How to alt](#how-to-part)

[Tomcat](#tomcat) 

[MySQL](#mysql)

[Getting the code / Local development](#local-development) 

[Deploying to server](#deploy-til-server)

[Nginx opsætning](#proxy-nginx)

[Domæne](#domæne)

[Sikring af SSH](#ssh-ved-hjælp-af-keys)

## Indledning
Dette er et chat system, hvor en elev kan kan skrive et spørgsmål og herefter kan en tutor se spørgsmålet, og hvis de føler de kan svare på det, vælge spørgsmålet og starte en chat med eleven.

Projektet er bygget op med en Java backend med jpa og en mysql database, en ReactJs frontend, og Firebase til authentication.
Når java delen bliver startet åbner den en websocket på 127.0.0.1/chat/{parameter}/{token}

Lige nu er der tre parametre systemet "lytter" efter, "register", "debug" ellers "{brugernavn}"
Hvis man kalder serveren på 127.0.0.1/chat/debug/null bliver der registreret en debgger session, hvor alle indgående chat beskeder samt brugere der logger ind/ud bliver sendt til.

Hvis man kalder serveren på 127.0.0.1/chat/register/null vil der blive åbnet en besked, og herefter lytter serveren efter en besked, med kommandoen "createUser" når den kommer vil der blive oprettet en ny bruger med det brugernavn der står en beskedens content.

Hvis man kalder serveren på 127.0.0.1/chat/etbrugernavn/gyldigtoken vil brugeren blive forbundet til serveren og tilføjet til en statisk liste med online brugere. Nu lytter serveren efter beskeder sendt i json format fra brugeren.

Det hele er bygget op omkring en Message klasse, den har følgende attributter:

| toProfile | fromProfile | command | content | profile | profiles |
| --- | --- | --- | --- | --- | --- |
| Hvem beskeden er til | Hvem afsenderen er | Kommando fx 'file' | Indholdet af beskeden | en profil, kunne være brugeren selv | en liste af profiler, kunne fx være online tutorer

## Demo
Åben https://cphbusiness.tk og log ind med demo@demo.dk // demo1234 skriv en besked og se den blive sendt til dig selv! åben evt en fane mere og login med tutor@cphbusiness.tk // tutor12 og se at du kan vælge demo@demo.dk og skrive/sende filer frem og tilbage + du får en push notifikation når tutor logger ind(Hvis du tillader meddelelser)

Hvis du åbner https://cphbusiness.tk/debug kan du også her se beskeder fra begge, samt hvem der er forbundet p.t

## Kommandoer

- needHelp
```javascript 
{"fromProfile":"brugernavn","command":"needHelp","content":"hej"} 
```
Bliver brugt når en bruger logger ind, for at tilføje ham til listen over brugere der ikke får hjælp lige nu, og denne liste vil hererefter blive broadcastet til alle tutorer, samt sender en besked retur til brugeren hvor der står "hej"
- Message
```javascript 
{"toProfile":"user","fromProfile":"user1","command":"message","content":"hej"} 
```
Vil sende en besked fra joacim@vetterlain.dk til tutor@cphbusiness.dk med indholdet "Hej tutor!"
- Take
```javascript 
{"fromProfile":"tutor","command":"take","content":"user"} 
```
Vil tage fat i useren "user" og sætte userens assignedTutor attribut til "tutor" samt fjerne "user" fra notGettingHelp listen
```javascript 
{"fromProfile":"user","command":"webNoti","content":"1782489uajhdfkuah389fha9u3agknfdg"} 
```
- webNoti
Hvis brugeren siger ja til at modtage beskeder fra siden, bliver denne besked sendt til serveren med brugerens web notifikations token, og token bliver tilknyttet brugeren i databasen, så vi kan sende push notifikationer til brugerens browser/telefon
```javascript 
{"fromProfile":"user","command":"webNoti","content":"1782489uajhdfkuah389fha9u3agknfdg"} 
```
- file
```javascript 
{"fromProfile":"user","toProfile":"tutor","command":"file","content":"fil.jpg"} 
```
Vil sende filen "fil.jpg" fra "user" til "tutor", max filstørrelse 25mb.

- setTutor
```javascript 
{"fromProfile":"Server","toProfile":"user","command":"setTutor","content":"tutor"} 
```
Vil blive send til "user" og i frontenden vil brugerens send til blive sat til "tutor"
- release
```javascript 
{"toProfile":"server","fromProfile":"Tutor","command":"release","content":"user"} 
```
sætter "user"'s assigned attribut til "" og tilføjer "user" til notGettingHelp listen i backend + sender en besked til alle tutorer om at der er en bruger der ikke får hjælp.
- removeTutor
```javascript
{"toProfile":"user","command":"removeTutor"} 
```
Finder brugeren "user" og sætter "assignedTutor" til "".
- getUsers
```javascript
{"fromProfile":"tutor","command":"getUsers"} 
```
Returnerer en liste af alle brugere til "tutor"
- updateUser
```javascript
{"fromProfile":"userprofile","command":"updateUser","profile":{"userprofile"}} 
```
tager hele profilen "userprofile" som json, og merger med "userprofile" i databasen, og returnerer herefter den opdaterede profil.
- getTutors
```javascript
{"command":"getTutors"} 
```
Returnerer antal tutorer online.


## Firebase
I frontenden samt backenden bliver firebase brugt. 
- Frontend:
I frontenden bruges firebase til at håndtere login, samt at registrere en service worker og sende push notifikationer.
Der er en en firebase.js fil placeret i js mappen, denne fil skal udfyldes med ens config fra firebase, sådan en config kan man få ved at registrere en app her https://console.firebase.google.com/ og herefter trykke på add firebase to your webapp, så vil der komme en modal frem med de forskellige nødvendige oplysninger.

I firebase konsollen skal authentication lige slåes til, det vælges ved at trykke på authenticaton og start using authentication.


I Register.js importeres firebase.js filen ```javascript    import firebase from "../js/firebase.js";``` og kan så bruge den på følgende måde til at registrere en bruger:
```javascript
  /**
     * Register user in firebase, and send a message to backend database, with the newly created user, so we can store the
     * username there aswell.
     */
    register = () => {
        let profile = {
            "command": "createUser",
            "content": this.state.email
        }

        firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then(() => {
                this.state.connection.send(JSON.stringify(profile));
                this.setState({error:"",success: true})
            })
            .catch(error => {
                this.setState({error})
            });
    }
```



i Chat.js bruges den til at sætte en webNotifikation op: 
```javascript
 requestWebNotificationPermission = () => {
        const messaging = firebase.messaging();
        messaging.requestPermission()
            .then(() => {
                messaging.getToken().then(token => {
                    let msg = JSON.stringify({
                        "toProfile": "",
                        'fromProfile': this.state.username,
                        'command': "webNoti",
                        'content': token
                    })
                    this.state.connection.send(msg);
                })
            }).catch((err) => {
            console.log(err) //No error handling :(
        })
    }
```
For at det virker er der en ``` firebase-messaging-sw.js``` i public mappen, der registrerer en serviceworker i klientens browser.

- Backend
I backenden bruges det til at sende push notifikationerne til de brugere der har tilladt det, det gøres i PushNotifier klassen, her har jeg implementeret en http klient der sender en post til firebase's server med et objekt der indeholder data til den notifikation jeg vil sende, det ser således ud:

```java 
public void sendTutorNotification(String token, String to,String tutor) {
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPost httpPost = new HttpPost("https://fcm.googleapis.com/fcm/send");
        httpPost.setHeader("Content-type", "application/json");
        httpPost.setHeader("Authorization", "key=AAAAdJe6NHg:APA91bGtqcE4d0Tpt8yZxdfA30wR7vsvUAHlO4IFJ6C1_UhU1WR-ToW_dOX5gdZPDYSSctWmA3YgYsUJNjEHLEUZ53zDS1qGHkRuiIpQ3mReeFK8nczo9ePDJDpaTxOd-3DVuR5bI1zZ");
        try {
            JsonObject j = new JsonObject();
            j.addProperty("to", token);
            JsonObject notification = new JsonObject();
            notification.addProperty("title", "TutorChat");
            notification.addProperty("body", "Hi " + to + "\n"+tutor+" is online now. \nClick to open TutorChat");
            notification.addProperty("icon", "https://www.vulgaris-medical.com/sites/default/files/styles/big-lightbox/public/field/image/actualites/2016/02/12/le-chat-source-de-bienfaits-pour-votre-sante.jpg"); 
            notification.addProperty("click_action", URL);
            j.add("notification", notification);
            StringEntity stringEntity = new StringEntity(j.toString());
            httpPost.getRequestLine();
            httpPost.setEntity(stringEntity);
            httpClient.execute(httpPost);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }
```
key'en der bliver brugt her, kan findes her: https://console.firebase.google.com/project/tutorchatcph/settings/cloudmessaging/

## Logging
Der er en del forskellige logs man kan kigge på, dem jeg har brugt mest er:
- nginx's access.log for at se hvilke ip adresser der har tilgået min webserver, samt set hvad request de har sendt.
Den kan findes her: ``` /var/log/nginx/acces.log ```
- Så er der tomcat's catalina.out, der bliver alle fejlbeskeder fra backenden logget.
Den kan findes her: ``` /opt/tomcat/logs/catalina.out```
- Og så er der min egen debugger side hvor jeg kan se meddelelser der bliver sendt til serveren.
Den kan findes her: https://cphbusiness.tk/debug

## Forslag til flere features
- Statistik
- Debugger kunne godt bruge flere funktioner, fx hente specifikke chat logs, se meddelelser sendt fra serveren, antal brugere logget ind osv.
- Admin/manager del, hvor man kan redigere brugere osv.
- Diverse error handling
- Lyd virker ikke ordenligt (loader ikke nogle gange)
- Se om der er nogle tutorer online
- Tests!
- Sikre frontenden.
- Settings i frontenden.
- Bedre support i edge/safari
- droppe mysql database og bruge firebase.
- En app?

## How to part:
#### Set up a system for local development:

Jeg bruger en raspberry pi, der kører debian 8 som server (Gør det nemmere for dig selv ved at leje en vps ved digitalocean.com)
sørg for ikke at sætte det hele op med root useren, men lav en ny bruger først.
skriv ```adduser tutorchat```
efterfulgt af ```usermod -a -G sudo tutorchat``` for at tilføje den nye bruger til sudo gruppen.

## TOMCAT
 - log ind på din server vha ```-ssh brugernavn@ipadresse```
 - sørg for at køre ```sudo apt-get update``` evt efterfulgt at ```sudo apt-get upgrade``` så den er opdateret.
 - installer java: ```sudo apt-get install default-jdk```
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
     
## Local development
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

## Proxy nginx
#### SSL er godt, og nemt at installere på nginx, så lad os bruge nginx
- Skriv kommando: sudo apt-get install nginx
- Hvis du åbner ipen på din server vil du nu se en nginx side.
#### Viderstil websockets, og requests mod manager til tomcat
- skriv kommando sudo nano /opt/tomcat/conf/server.xml
- find de to connector tags og tilføj: "address="127.0.0.1" tryk ctrl + x for at gemme, nu er det kun localhost der kan tilgå tomcat.
- skriv kommando: sudo service tomcat restart, du kan nu ikke længere tilgå tomcat via port 8080
#### Opsætning af nginx 
- Skriv kommando: sudo nano /etc/nginx/sites-available/default
Jeg har lavet følgende konfigurations fil der sørger for det hele, med kommentarer :) 
```Shell
# TutorChat NGINX Conf


# Tomcat serverens adresse
upstream tomcat{
  server 127.0.0.1:8080 fail_timeout=0;
}

# Viderstil alt trafik til https
server {
        listen 80 default_server;
        listen [::]:80 default_server;
        server_name cphbusiness.tk www.cphbusiness.tk;
        return 301 https://server_name$request_uri;
}


# SSL Konfiguration
server{
        listen 443 ssl default_server;
        listen [::]:443 ssl default_server;

        include snippets/ssl-cphbusiness.tk.conf;
        include snippets/ssl-params.conf;

        root /var/www/html;

        index index.html;

        server_name cphbusiness.tk www.cphbusiness.tk;


        # Standard lokation
        location / {
                try_files $uri $uri/ =404;
        }

        # /Chat/ viderstiller/opgraderer websockets til tomcat serveren
        location /chat/ {
                include proxy_params;
                proxy_pass http://tomcat/chat/;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection $http_connection;
                proxy_read_timeout 864000;

        }


        # Giver os adgang til tomcats manager interface
        location /manager/ {
                include proxy_params;
                proxy_pass http://tomcat/manager/;
        }
}

```
- Som det ses i Java backenden understøtter vi at sende filer op til 25mb, 
skriv ```sudo nano /etc/nginx/nginx.conf``` og tilføj linjen ``` client_max_body_size 25M; ``` under http blokken.


## Domæne
Jeg har registreret domænet cphbusiness.tk og peget på min raspberry pi, domænet var gratis på dot.tk

#### SSL Certifikat
Nu da jeg har et domæne kan jeg sætte ssl op, og bruge en wss websocket så alt data der bliver sendt er krypteret!
Først lad os tilføje domæne navnene til vores nginx config fil.
- Skriv kommando: sudo nano /etc/nginx/sites-available/default
- Installer certbot fra lets encrypt for at få et gratis ssl certifikat de har guides til de fleste os'er her: https://certbot.eff.org
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
- For at sikre vores server lidt mere kan vi sætte den op så vi skal bruge en ssh key for at logge ind.
Start med at generer en nøgle på din lokale maskine ved at skrive ```ssh-keygen```cd
- åben ssh.pub filen og kopier indholdet
- på din server som root brugeren skriv ``` su - tutorchat ``` for at skifte til brugeren
- Lav en ny mappe ``` mkdir .ssh ``` begræns adgangen til mappen med ``` chmod 700 .ssh```
- Lav en ny fil i mappen ``` ssudo nano .ssh/authorized_keys ``` indsæt indholdet af ssh.pub her og gem filen med ctrl + x, begræns herefter adgangen til filen ``` chmod 600 .ssh/authorized_keys ``` efterfulgt af ``` exit ```
- Åben ``` sudo nano /etc/ssh/sshd_config ``` og find linjerne erstat følgende
```Shell
#PermitRootLogin yes
#PasswordAuthentication yes
UsePAM yes
```
med
```
PermitRootLogin no
PasswordAuthentication no
UsePAM no
```
- Genstart ssh ``` sudo systemctl restart ssh ``` nu skulle det gerne kun være muligt at forbinde til din server med din public key.
eksempel: ``` ssh -i ssh tutorchat@cphbusiness.tk```


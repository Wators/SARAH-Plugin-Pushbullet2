exports.init = function(SARAH){
  info ( '\x1b[96mPushbullet2 is initializing ... \x1b[0m' );
};


exports.action = function(data, next) {

  /** Variable **/

    var config = Config.modules.pushbullet2;
    var access_token = config.access_token;
    var moment = require('moment');
    moment.locale('fr');

    var debug = config.debug;
    var fs = require('fs');
    xml2js = require('xml2js');

    var fileXML = 'plugins/pushbullet2/www/bin/devices.json';
    var json2 = JSON.parse(fs.readFileSync('plugins/pushbullet2/www/bin/devices.json', 'utf8'));
      
    var Debugday = moment().format("DD-MM-YYYY HH:mm:ss")
    var Debugtime = "      ********** " + moment().format("HH:mm:ss") + " Pushbullet2 : ";
    console.log('\n      '+ Debugday + ' Pushbullet2 : Activation');

    if (debug == true) { console.log(Debugtime + "Debug Actif")}


  /** Recherche iden si true dans le poshbullet2.prop **/

    if (config.device == true){
      getDevices(access_token, function(json){
      console.log(json)
        var info = "";
        for (var i=0 ; i< json.devices.length ; i++) {
            
            var nickname = json.devices[i].nickname;
            var iden = json.devices[i].iden;
            var number = i;
            var active = json.devices[i].active;

    /** Construction du fichier devices.json **/  

            if (active == true) {
                  info += '              {\n'
                  info += '                     "nickname" : "'+nickname+'",\n'
                  info += '                     "iden" : "'+iden+'"\n'
                  info += '              },\n' 
            }
        }

            var xml = fs.readFileSync(fileXML, 'utf8');
            replace = '},\n';
            replace += info;
            replace += '              {';
            var regexp = new RegExp('},\n[^*]+{', 'gm');
            var xml = xml.replace(regexp, replace);
            fs.writeFileSync(fileXML, xml, 'utf8');
            console.log(Debugtime +'Devices misent à jour dans devices.json');
      });
    };

  /** Id, Titre et Body du Push **/

      if ( !config.access_token ) {
        SARAH.speak("Access Token manquant")
        console.log( Debugtime + "Access Token manquant dans le fichier pushbullet2" );
      } else {
        if (!data){var data = {"title":"Title", "body": "Body"}
        }
        if (!data.title) data.title = "Title";
        if (!data.body) data.body = "Body";
        /**if (!data.device_iden) {
        if (config.device_iden) data.device_iden = config.device_iden;
        };**/
        for (var i=0 ; i< json2.devices.length ; i++) {
          var deviceId = json2.devices[i].nickname;
          var uid = json2.devices[i].iden;
          if (deviceId == data.id){ var ref = uid;}
          if (!data.id){ 
            if (!config.device_iden){var ref = ""};
            if (config.device_iden){var ref = config.device_iden};
            };
        }  
      };


  /** Requete à Pushbullet**/

    var request = require("request");

    var options = { method: 'POST',
      url: 'https://api.pushbullet.com/v2/pushes',
      headers: 
      { 
        'content-type':  'application/json',
        'access-token': access_token 
      },
      formData: 
      { title: data.title,
        body: data.body,
        type: 'note',
        device_iden : ref } };

    request(options, function (error, response, body) {
      if (error || response.statusCode != 200) {
            console.log(Debugtime +"ERROR ("+error+")");
            SARAH.speak("echec de l\'envoi");
            return;
      } else {
            console.log(Debugtime +"Notification Envoyé!");
            if (!data.id){console.log(Debugtime +"Message envoyé à "+ ref)}else{console.log(Debugtime +"Message envoyé à "+ data.id)}
      };
    });

    next({});
};

var getDevices = function(access_token, callback) {
  
    var request = require("request");
    var config = Config.modules.pushbullet2;
    var debug = config.debug;

    var moment = require('moment');
    moment.locale('fr');    

    var Debugtime = "      ********** " + moment().format("HH:mm:ss") + " Pushbullet2 : ";

    var options = { method: 'GET',
      url: 'https://api.pushbullet.com/v2/devices',
      headers: 
        { 
          'content-type':  'application/json',
          'access-token': access_token 
        } 
    };

      request(options, function (error, response, body) {
        if (error || response.statusCode != 200) {
            console.log(Debugtime +"ERROR Devices ("+error+")");
            return;
        } else {
          console.log(Debugtime +"Devices récupérés");
        };
  
      // 2. Sinon on parse le body
      var json = JSON.parse(body);
   
      // Et on retourne le JSON
      callback(json);

      });
}
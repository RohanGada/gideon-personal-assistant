var restify = require('restify');
var builder = require('botbuilder');
var _ = require("lodash");
var request = require("request");
var googleAPIKey = 'AIzaSyAr1qnV2I_Pg_Ck3kgaKXtO_ma5gw3Z1rg';
// -- OBJECT DEBUGGER
var objectDebugger = function (naughtyObject) {
  _.each(naughtyObject,function (value,property) {
    console.log(property,value)
  })
};
//
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: "ae68c3d8-dfc1-4fbf-933e-2fb61bf561ec",
    appPassword: "Sjj8r57qhDt3WK42cMOKUXQ"
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

// bot.dialog('/', function (session) {
//   // console.log(session.message);
//   // if(session.message){
//   //   if(session.message.text){
//   //     Math.random
//   //   }
//   // }else{
//   //
//   // }
//     session.send("Hello World");
// });
const LuisModelUrl = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/726fa9d8-330c-4cd1-8a33-12bae0048eb1?subscription-key=bb6999994fb84f67989084d8a36f2f22&verbose=true";
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.dialog('/', new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('greetings', [
        function (session) {
          // console.log("bhag bhenchod")
            // session.beginDialog('/support');
            session.send("Bhag bhenchod");
        },
        function (session, result) {
          console.log(result.response);
            var ticketNumber = result.response;
            session.send("Your ticket number is %s", ticketNumber);
            session.endDialog();
        }
    ])
    .matches('sendMeXNearMe', [
        function (session,result) {
            if(result.entities && _.find(result.entities,function (key) {
              return key.type == 'place_type'
            }) && _.find(result.entities,function (key) {
              return key.type == 'location'
            }))
            {
                // Google PLaces API
                request.post({
                  url:'https://maps.googleapis.com/maps/api/geocode/json?address='+_.find(result.entities,function (key) {
                    return key.type == 'location'
                  }).entity+'&key='+googleAPIKey
                },function (err,http,body) {
                  if(body){
                    body = JSON.parse(body);
                  }
                  if(err){
                    session.send("Couldn't retrieve the results.")
                  }else if(body && body.results){
                    // objectDebugger(body.results[0])
                    var query = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+body.results[0].geometry.location.lat+','+body.results[0].geometry.location.lng+'&radius=500&type='+_.find(result.entities,function (key) {
                      return key.type == 'place_type'
                    }).entity+'&key='+googleAPIKey;
                    console.log(query);
                    request.post({
                      url:query
                    },function (err,http,body) {
                      if(body){
                        body = JSON.parse(body);
                      }
                      if(err){
                        session.send("Couldn't retrieve the results.")
                      }else if(body && body.results){
                        console.log(body.results);
                        }else{
                        session.send("No results found.");
                      }
                    });
                  }else{
                    // console.log(body.results);
                    session.send("The location is in existent");
                  }
                });
              //
            }else if(_.find(result.entities,function (key) {
              return key.type == 'place_type'
            }) && !_.find(result.entities,function (key) {
              return key.type == 'location'
            })){
              session.send(_.find(result.entities,function (key) {
                return key.type == 'place_type'
              }).entity+" near what? ask me again.");
            }else if(!_.find(result.entities,function (key) {
              return key.type == 'place_type'
            })&& _.find(result.entities,function (key) {
              return key.type == 'location'
            })){
              session.send("What near "+_.find(result.entities,function (key) {
                return key.type == 'place_type'
              }).entity+"? ask me again.")
            }else{
              session.send("Brain freeze >_< Sorry");
            }
        }
    ])
    .onDefault([
        function (session) {
            session.send("Sorry I didn't get you.");
        }
    ])
);
bot.dialog('/support',function () {

});

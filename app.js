var restify = require('restify');
var builder = require('botbuilder');

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
// const LuisModelUrl = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/726fa9d8-330c-4cd1-8a33-12bae0048eb1?subscription-key=bb6999994fb84f67989084d8a36f2f22&verbose=true";
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.dialog('/', new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('greetings', [
        function (session) {
          // console.log("bhag bhenchod")
            // session.beginDialog('/support');
            session.send("Bhag bhenchod");
        },
        function (session, result) {
            var ticketNumber = result.response;
            session.send("Your ticket number is %s", ticketNumber);
            session.endDialog();
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

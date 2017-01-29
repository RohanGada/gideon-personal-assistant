var restify = require('restify');
var builder = require('botbuilder');
var _ = require("lodash");
var request = require("request");
var pluralize = require('pluralize');
var globe = {};
var googleAPIKey = 'AIzaSyAr1qnV2I_Pg_Ck3kgaKXtO_ma5gw3Z1rg';
// -- OBJECT DEBUGGER
var objectDebugger = function(naughtyObject) {
    _.each(naughtyObject, function(value, property) {
        console.log(property, value)
    })
};
//
//
var existentInObjectArray = function(arr, property, compare) {
    return _.find(arr, function(key) {
        return key[property] == compare;
    })
};
//
//
var valueFromObjectArray = function(arr, property, compare, getproperty) {
    // console.log(arr,property,compare,getproperty);
    return _.find(arr, function(key) {
        return key[property] == compare;
    })[getproperty];
}
//
// -- generateCardUIArray
var generateCardUIArray = function(session, arr) {
    var i = 0;
    var generated = _.map(arr, function(key) {
        var oneCard = new builder.HeroCard(session);
        if (key.title) {
            oneCard.title((i + 1) + ". " + key.title);
        }
        if (key.subtitle) {
            oneCard.subtitle(key.subtitle);
        }
        if (key.images) {

            oneCard.images([
                builder.CardImage.create(session, key.images[0])
            ])
        }
        if (key.googleimages) {
            oneCard.images([
                builder.CardImage.create(session, 'https://maps.googleapis.com/maps/api/place/photo?maxheight=400&maxwidth=400&photoreference=' + key.googleimages[0].photo_reference + '&key=' + googleAPIKey)
            ])
        }
        if (key.link) {
            oneCard.buttons([
                builder.CardAction.openUrl(session, key.link, 'Learn More')
            ]);
        }
        i++;
        return oneCard;
    });
    return generated;
};
//
var singleRichCard = function (session,obj) {
    return new builder.ReceiptCard(session)
        .title(obj.name)
        // .subtitle(obj.vicinity)
        .facts([
            builder.Fact.create(session, obj.rating+'/5', 'Rating'),
            builder.Fact.create(session, 'VISA 5555-****', 'Payment Method')
        ])
        .items([
            builder.ReceiptItem.create(session, '$ 38.45', 'Data Transfer')
                .quantity(368)
                .image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png')),
            builder.ReceiptItem.create(session, '$ 45.00', 'App Service')
                .quantity(720)
                .image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png'))
        ])
        .tax('$ 7.50')
        .total('$ 90.95')
        .buttons([
            builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/pricing/', 'More Information')
                .image('https://raw.githubusercontent.com/amido/azure-vector-icons/master/renders/microsoft-azure.png')
        ]);
}
//
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: "ae68c3d8-dfc1-4fbf-933e-2fb61bf561ec",
    appPassword: "Sjj8r57qhDt3WK42cMOKUXQ"
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

const LuisModelUrl = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/726fa9d8-330c-4cd1-8a33-12bae0048eb1?subscription-key=bb6999994fb84f67989084d8a36f2f22&verbose=true";
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.dialog('/', new builder.IntentDialog({
        recognizers: [recognizer]
    })
    .matches(/^[0-9]*$/,function(session){
      switch (parseInt(session.message.text)) {

          case 1:
              globe['selected'] = globe.select[0];

          case 2:
              globe['selected'] = globe.select[1];

          case 3:
              globe['selected'] = globe.select[2];

          case 4:
              globe['selected'] = globe.select[3];

          case 5:
              globe['selected'] = globe.select[4];

          case 6:
              globe['selected'] = globe.select[5];

          case 7:
              globe['selected'] = globe.select[6];

          case 8:
              globe['selected'] = globe.select[7];

          case 9:
              globe['selected'] = globe.select[8];

          case 10, 'one', 'First':
              globe['selected'] = globe.select[9];
              console.log(globe);
              break;
          default:
              {
                  session.send('Reselect between the 10 choices');
              }
      };
       session.send(globe['selected'].place_id);
       request.post({
         url:'https://maps.googleapis.com/maps/api/place/details/json?placeid='+globe['selected'].place_id+'&key='+googleAPIKey
       },function (err,http,body) {
         if(body){body = JSON.parse(body);}
         if(err){
           session.send("Couldn't retrieve the results.");
         }else if(!_.isEmpty(body)){
           var card = singleRichCard(session,body.result);

            // attach the card to the reply message
            var msg = new builder.Message(session).addAttachment(card);
            session.send(msg);
         }else{
           session.send("Couldn't retrieve this "+globe['selected'].place_id);
         }
       });


    })
    .matches('greetings', [
        function(session) {
            // console.log("bhag bhenchod")
            // session.beginDialog('/support');
            session.send("Hello there ..");
        },
        function(session, result) {
            // console.log(result.response);
            var ticketNumber = result.response;
            session.send("Your ticket number is %s", ticketNumber);
            session.endDialog();
        }
    ])
    .matches('sendMeXNearMe', [
        function(session, result) {
            if (result.entities && existentInObjectArray(result.entities, 'type', 'place_type') && existentInObjectArray(result.entities, 'type', 'location')) {
                // Google PLaces API
                request.post({
                    url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + valueFromObjectArray(result.entities, 'type', 'location', 'entity') + '&key=' + googleAPIKey
                }, function(err, http, body) {
                    if (body) {
                        body = JSON.parse(body);
                    }
                    if (err) {
                        session.send("Couldn't retrieve the results.")
                    } else if (body && body.results) {
                        // objectDebugger(body.results[0])
                        var query = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + body.results[0].geometry.location.lat + ',' + body.results[0].geometry.location.lng + '&radius=2000&type=' + pluralize.singular(valueFromObjectArray(result.entities, 'type', 'place_type', 'entity')).replace(' ', '_') + '&key=' + googleAPIKey;
                        console.log(query);
                        request.post({
                            url: query
                        }, function(err, http, body) {
                            if (body) {
                                body = JSON.parse(body);
                            }
                            if (err) {
                                session.send("Couldn't retrieve the results.")
                            } else if (body && body.results) {

                                var cards = generateCardUIArray(session, _.map(body.results, function(key) {
                                    return {
                                        title: key.name,
                                        googleimages: key.photos,
                                        subtitle: key.vicinity
                                    };
                                }));

                                // create reply with Carousel AttachmentLayout
                                if (cards.length > 0) {
                                    globe.select = _.map(body.results, function(key) {
                                        return {
                                            place_type: pluralize.singular(valueFromObjectArray(result.entities, 'type', 'place_type', 'entity')),
                                            place: key.name,
                                            place_id:key.place_id
                                        };
                                    });
                                    // console.log(globe);
                                    var reply = new builder.Message(session)
                                        .attachmentLayout(builder.AttachmentLayout.carousel)
                                        .attachments(cards);

                                    session.send(reply);
                                } else {
                                    session.send("No results");
                                }
                            } else {
                                session.send("No results found.");
                            }
                        });
                    } else {
                        // console.log(body.results);
                        session.send("The location is inexistent");
                    }
                });
                //
            } else if (existentInObjectArray(result.entities, 'type', 'place_type') && !existentInObjectArray(result.entities, 'type', 'location')) {
                session.send(valueFromObjectArray(result.entities, 'type', 'place_type', 'entity') + " near what? ask me again.");
            } else if (!existentInObjectArray(result.entities, 'type', 'place_type') && existentInObjectArray(result.entities, 'type', 'location')) {
                session.send("What near " + valueFromObjectArray(result.entities, 'type', 'location', 'entity') + "? ask me again.")
            } else {
                session.send("Brain freeze >_< Sorry");
            }
        }
    ])

    .onDefault([
        function(session) {
            session.send("Sorry I didn't get you.");
        }
    ])
);
bot.dialog('/abc', function(session) {
    console.log(session.message);
    if (session.message.text) {
        console.log(session.message.text);
        switch (parseInt(session.message.text)) {

            case 1:
                globe['selected'] = globe.select[0];

            case 2:
                globe['selected'] = globe.select[1];

            case 3:
                globe['selected'] = globe.select[2];

            case 4:
                globe['selected'] = globe.select[3];

            case 5:
                globe['selected'] = globe.select[4];

            case 6:
                globe['selected'] = globe.select[5];

            case 7:
                globe['selected'] = globe.select[6];

            case 8:
                globe['selected'] = globe.select[7];

            case 9:
                globe['selected'] = globe.select[8];

            case 10, 'one', 'First':
                globe['selected'] = globe.select[9];
                console.log(globe);
                break;
            default:
                {
                    session.beginDialog('/act')
                }
        };
    } else {
        session.send("Some error occurred");
    }
});

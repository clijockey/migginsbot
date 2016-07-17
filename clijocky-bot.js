//=================================================================
// Title:               clijockey-bot.js
// Description:         This is a chat bot for Cisco Spark that
//                      helps automate things. Based on the messaes
//                      posted in the room will result in various
//                      actions. The purpose is to be used as a PoC
//                      and demo various capabilities of Cisco offerings.
//
//                      It used in the integration capabilities of
//                      Spark rather than just the simple webhooks.
//
// Author:              Rob Edwards (@clijockey/robedwa@cisco.com)
// Date:                21/06/2016
// Version:             0.1
// Dependencies:        sparkbot-starterkit
//                      node-sparky (version 3+)
// Limitations/issues:
//=================================================================
var SparkBot = require("sparkbot-starterkit");
var spark = require("node-sparky");

var config = {
    // Required for the bot to send messages
    token: process.env.SPARK_TOKEN,

    attach_as: "integration",
    port: 8080,
    URI: "/integration",

    name: "RobBot",
    peopleId: "Y2lzY29zcGFyazovL3VzL1BFT1BMRS80NTczMTFmMS00ZjVkLTQ2ZDQtOWJjMy03MGFlODZmMDhiOTg"
};

//curl -v -X GET https://staging--migginsbot--migginsbot--e5fdb8.gce.shipped-cisco.com/ping
console.log("The Spark Token being used is " + process.env.SPARK_TOKEN);

// Starts your integration
var bot = new SparkBot(config);

// Create a Spark client to send messages back to the Room
var spark = new spark({
    token: config.token
});

// This function will be called every time a new message is posted into Spark
bot.register(function(message) {
    console.log("New message from " + message.personEmail + ": " + message.text + message.roomId)

    // If the message comes from the bot, do nothing
    if (message.personId === config.peopleId) {
        console.log("bot is writing => ignoring");
        return;
    }

    // Convert the message string into lowercase and also turn it into an array
    var lower = message.text.toLowerCase().split(" ");
    //var lower = message.text.toLowerCase();
    //testMessage(message.roomId);
    //sendText(roomId, "This is a test message!")

    // Test to check all is working as expected by having a hello message posted.
    if (lower.indexOf("hello") > -1) {
        sayHello(message.roomId);
        return;
    }

    if ((message.text == "openstack") || (message.text == "metacloud")) {
        console.log("Detected Openstack call");
        getOSServers();
        return;
    }

    // Need help?
    if ((message.text == "help") || (message.text == "man")) {
        help(message.personEmail, message.roomId);
        //idToName(message.personId);
        return;
    }

    // Syntax to create a VM in UCSD
    if ((lower.indexOf("create") > -1) || (lower.indexOf("make") > -1) || (lower.indexOf("build") > -1)) {
        // Work out the flaour of OS wanted, DEFAULT to debian
        if (lower.indexOf("debian") > -1) {
            osType = "debian";
        } else if (lower.indexOf("centos") > -1) {
            osType = "centos";
        } else {
            osType = "debian";
        }

        // Work out the number of cores, or DEFAULT to 1
        if (lower.indexOf("cores") > -1) {
            posCores = lower.indexOf("cores");
            cores = lower[posCores - 1];
        } else {
            cores = "1";
        }

        // Work out the RAM size, or DEFAULT to 1
        if (lower.indexOf("ram") > -1) {
            posRam = lower.indexOf("ram");
            ram = lower[posRam - 1].replace("gb", "");
            //ram.replace("gb","");
        } else {
            ram = "1";
        }

        // Work out the name of the server to be created, or DEFAULT to blank
        if (lower.indexOf("called") > -1) {
            posName = lower.indexOf("called");
            name = lower[posName + 1];
        } else {
            name = "";
        }

        ucsdCreate(message.roomId, osType, cores, ram, name);
        return;
    }

    // Rollback of workflow
    if (lower.indexOf("rollback") > -1) {
        words = lower.indexOf("rollback");
        srId = lower[words + 1]

        rollback(message.roomId, srId);
    }

    // Send a piture of a sandwich || pie
    if ((lower.indexOf("have") > -1) || (lower.indexOf("pour") > -1) || (lower.indexOf("need") > -1)) {

        if (lower.indexOf("pie") > -1) {
            picture = "http://sparkle-bot.fragilegeek.com/cheese-sandwich.jpg";
        } else if (lower.indexOf("sandwich") > -1) {
            picture = "";
        } else if (lower.indexOf("beer") > -1){
            picture = "";
        }

        sendImage(message.roomId, picture);
        return;
    }
});

// Messaging functions
function sendText(roomId, message) {
    /**
     * @summary Send Message to a room
     * Sends a message to a specifc Spark room using its ID. The message will be text only and WILLNOT send images.
     * @param {string} roomId - The Spark room ID
     * @param {string} message - The message to send to Spark
     * @return {xxx} xxx
     */
    spark.messageSendRoom(roomId, {
        text: message
    }, function(err, results) {
        if (err) {
            console.log("could not send the text back to the room: " + err);
        } else {
            console.log("sendText command successful");
        }
    });
}

function sendToPerson(email, message) {
    spark.messageSendPerson(email, {
        text: message
    }, function(err, results) {
        if (err) {
            console.log("could not send the text back to the person: " + err);
        } else {
            console.log("sendToPerson command successful");
        }
    });
}

function sendImage(roomId, url) {
    spark.messageSendRoom(roomId, {
        file: url
    }, function(err, results) {
        if (err) {
            console.log("could not send the image back to the room: " + err);
        } else {
            console.log("sendImage command successful");
        }
    });
    return;
}

// Action Functions based on inupt
function randomId() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    // randomId = '_' + Math.random().toString(36).substr(2, 9);
    this.max = 7000000000
    this.min = 6000000000
    this.id = Math.floor(Math.random() * (max - min + 1)) + min;

    return this.id;
}

// function choosePic() {
//     var myPix = new Array("https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQcEvN2HZDqq8h8El2XaWJL5eUXJv-NYxJ7LohriUhBqvDzMB1F","https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQiBaaRMbbOLtEQVqPDxnUyBRqhu9cKeGcudNu91_E57BJbrR_x");
//
//     randomNum = Math.floor((Math.random() * myPix.length));
// 	document.getElementById("myPicture").src = myPix[randomNum];
// }

function sayHello(roomId, toPersonId) {
    /**
     * @summary Test hello message
     * Checks to see if the bot is functioning by posting a response to "hello"
     * @param {string} roomId - The Spark room ID, used to post hold message in original room
     * @param {string} toPersonId -
     */
    sendText(roomId, "Why hello, how are you? This is a test message to confirm all is good!");
    return;
}

function ucsdCreate(roomId, osType, cores, ram, sname) {
    /**
     * @summary
     *
     * @param {string} xx -
     * @param {string} xx -
     */
    // Build up the URL based on the parm passed
    //$qs = 'c='.$cores.'&r='.$ram.'&t='.$os_type.'&n='.$name.'&id='.$id;
    //	$message .= 'If this is correct, please confirm by going here: http://shellserver.ukidcv.cisco.com/req?'.$qs;
    //		$body['roomId'] = $roomId;

    url = "http://shellserver.ukidcv.cisco.com/req?c=" + cores + "&r=" + ram + "&t=" + osType + "&n=" + sname + "&id=" + randomId();
    text = "Please click the following link to proceed with the instantiation of the VM - " + url;
    //console.log(roomId, text);
    sendText(roomId, text);
    return;
}

function rollback(roomId, srId) {
    /**
    * @summary
    *
    * @param {string} xx -
    * @param {string} xx -
    */

    url = "http://shellserver.ukidcv.cisco.com/rollback?sr=" + srId + "&id=" + randomId();
    text = "Rolling back service request ID: " + srId + ". To confirm, please go here:\n" + url;
    sendText(roomId, text);

}

function help(toPersonId, roomId) {
    /**
     * @summary Bot Help
     * When someone asks for help assistance will be provided. A new 1-2-1 room will be created and instructions posted to it.
     * @param {string} toPersonId - The ID of the person asking for help
     * @param {string} roomId - The Spark room ID, used to post hold message in original room
     */

    //this.name = idToName(toPersonId);
    // Want to tag the requester in the hold message post but not worked out how to do this yet. It cloud just be using the # but need to test
    //this.holdMessage = "@" + this.name + "I will help you in a seperate room....hold the line caller.";
    this.holdMessage = "I will help you in a seperate room....hold the line caller.";
    sendText(roomId, this.holdMessage);

    // Create 1-2-1 room and post help message. Must be a cleaner way of posting multi-line posts in a single call?
    sendToPerson(toPersonId, "You have asked the CLIJocky-Bot (version 0.1) for help. I will try and help you by providing rough guidance on how to interact with me and get me to do things. The following are the options currently available;")

    sendToPerson(toPersonId, " - create/make/build: This will create something in an automated way (say a VM)")
    sendToPerson(toPersonId, " -- create/make/build vm [called <name>] [<value> cores] [<value> ram]: This will create a vm with the specified spec.")
    sendToPerson(toPersonId, " - help/man: Well I assume you already know this one to have got this far!")
    return;
}

function idToName(personId) {
    /**
     * @summary Convert Person ID to Name - TESTING
     * Converts the ID of a person in Spark to their name.
     * @param {string} personId - The Spark room ID
     * @return {string} name - The name of the user
     */
    name = spark.personGet(personId);
    //.then(function(person) {
    //console.log(person.displayName);
    console.log(name);
    //name = person.displayName;
    return name;
}
//.catch(function(err) {
// process error
//    console.log(err);
//});
//}

//=============================== Openstack Section ============================

const {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} = require('discord-interactions');
const axios = require('axios');
const getRawBody = require('raw-body');


const SLAP_COMMAND = {
  name: 'slap',
  description: 'Sometimes A you gotta slap a person with a large trout',
  options: [
    {
      name: 'user',
      description: 'The user to slap',
      type: 6,
      required: true,
    },
  ],
  type: 1, // This is a Slash Command
};

const INVITE_COMMAND = {
  name: 'invite',
  description: 'Get an invite link to add the bot to your server',
  type: 1, // This is a Slash Command
};

const SUPPORT_COMMAND = {
  name: 'support',
  description: 'Like this bot? Support me!',
  type: 1, // This is a Slash Command
};

const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${process.env.APPLICATION_ID}&scope=applications.commands`;

const registerCommands = async () => {
  const url = `https://discord.com/api/v8/applications/${process.env.APPLICATION_ID}/commands`;

  /*const commandData = [
    {
      name: 'support',
      description: 'Responds with support!',
      type: 1, // Slash command type
    },
    {
      name: 'invite',
      description: 'Generates an invite link',
      type: 1,
    },
    {
      name: 'slap',
      description: 'Slaps someone',
      type: 1,
    }
  ];*/

  const commandData = [
    SLAP_COMMAND,
    INVITE_COMMAND,
    SUPPORT_COMMAND
  ];


  try {
    const response = await axios.put(url, commandData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bot ${process.env.TOKEN}`, // Replace with your bot token
      },
    });

    if (response.status === 200) {
      console.log('Commands registered globally successfully!');
    } else {
      console.error('Failed to register commands:', response.statusText);
    }
  } catch (error) {
    console.error('Error registering commands:', error);
  }
};



/**
 * Gotta see someone 'bout a trout
 * @param {VercelRequest} request
 * @param {VercelResponse} response
 */
module.exports = async (request, response) => {
  if (request.method === 'POST') {
    const signature = request.headers['x-signature-ed25519'];
    const timestamp = request.headers['x-signature-timestamp'];

    //const rawBody = await getRawBody(request);
    const rawBody = await getRawBody(request);
      //const message = JSON.parse(rawBody.toString());  // Parse the raw body to JSON


    console.error('req coming');
    const isValidRequest = verifyKey(
      rawBody,
      signature,
      timestamp,
     "7bf5345a2e1cf33b93f41d841b499584e2a205d7b88306eb7b9017ff9aab1c24"
    );

    if (!isValidRequest) {
      console.error('Invalid Request');
      return response.status(401).send({ error: 'Bad request signature ' });
    }

     const message = JSON.parse(rawBody.toString());  // Parse the raw body to JSON
    //const message = request.body;

    if (message.type === InteractionType.PING) {
      console.log('Handling Ping request');
      response.send({
        type: InteractionResponseType.PONG,
      });
    } else if (message.type === InteractionType.APPLICATION_COMMAND) {
      switch (message.data.name.toLowerCase()) {
        case SLAP_COMMAND.name.toLowerCase():
          response.status(200).send({
            type: 4,
            data: {
              content: `*<@${message.member.user.id}> slaps <@${message.data.options[0].value}> around a bit with a large trout*`,
            },
          });
          console.log('Slap Request');
          break;
        case INVITE_COMMAND.name.toLowerCase():
          response.status(200).send({
            type: 4,
            data: {
              content: INVITE_URL,
              flags: 64,
            },
          });
          console.log('Invite request');
          break;
        case SUPPORT_COMMAND.name.toLowerCase():
          response.status(200).send({
            type: 4,
            data: {
              content:
                "Thanks for using my bot! Let me know what you think on twitter (@IanMitchel1). If you'd like to contribute to hosting costs, you can donate at https://github.com/sponsors/ianmitchell",
              flags: 64,
            },
          });
          console.log('Support request');
          break;
        default:
          console.error('Unknown Command');
          response.status(400).send({ error: 'Unknown Type' });
          break;
      }
    } else {
      console.error('Unknown Type');
      response.status(400).send({ error: 'Unknown Type' });
    }
  }else if (request.method === 'GET') {
    // Call registerCommands when the bot starts
    await registerCommands();
    response.status(200).send("test");
    
  }
};

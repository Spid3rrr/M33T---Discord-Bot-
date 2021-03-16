var participants = [] ; 
var participantsNum = 0 ;
var queue = [] ;
var queueCurrentIndex = -1 ;
var queueMaxIndex=-1;
var queueIsDone = true ;
var queue_msg;
var done_msg;
const BOT_NAME = 'M33T' ;
function reset(client,channel) { 
    queue = [] ;
    queueCurrentIndex = -1 ;
    queueMaxIndex=-1;
    queueIsDone = true ;
    unmuteall(client,channel);
}
function unmuteall(client,channel){
  for (const [memberID, member] of channel.members)
      { 
         member.voice.setMute(false);     
      }             
}
function refreshUsers(client,channel){
  participants=[];
  participantsNum=0;
  for (const [memberID, member] of channel.members)
          {
            participants[participantsNum]=member.user.username;
            participantsNum++;
          }
}
function addToQueue(client,channel,username){
          console.log("Added to Queue : " + username );
          queueMaxIndex++;
          queue[queueMaxIndex] = username;
          if(queueIsDone) {
            GoNext(client,channel);
            console.log("Starting the discussion" );
          }
}
function GoNext(client,channel){
  console.log(queue);
  queueCurrentIndex++;
  while( !participants.includes(queue[queueCurrentIndex]) && queueCurrentIndex<=queueMaxIndex) 
    {
      queueCurrentIndex++;
      console.log("Skipped one");
    }
  console.log("Speaking : "+ queue[queueCurrentIndex] );
  queueIsDone  =  ( queue[queueCurrentIndex] == undefined );
  if( queueIsDone ) {
    reset(client,channel) ;
    return ;
  }
  console.log("queue done : " + queueIsDone ) ;
  for (const [memberID, member] of channel.members)
          { 
            if(member.user.username!=queue[queueCurrentIndex]){
                  member.voice.setMute(true);
            }
            else member.voice.setMute(false);            
          }
}

module.exports = {
	name: 'begin',
	description: 'Begin Meeting !',
	execute(message, args, client ) {

    const ChannelID = message.member.voice.channelID;
    const channel = client.channels.cache.get(ChannelID);

        if (!channel) 
        {
          message.channel.send('User is not connected to any channel !');
          return console.error("User is not connected to any channel !");
        }
        channel.join().then(connection => {
            // Yay, it worked!
            console.log("Successfully connected.");
            refreshUsers(client,channel);
            message.channel.send('React here if you wish to speak next').then(function (message) {
              message.react("✋");
              queue_msg = message.id ;
            }).catch(function() {
            });
            message.channel.send('React here once you\'re done speaking !').then(function (message) {
              message.react("👍");
              done_msg = message.id ;
            }).catch(function() {
            });
        }).catch(e => {
            // Oh no, it errored! Let's log it to console :)
            console.error(e);
        });
        // Voice Channel Update ( join or leave )
        client.on('voiceStateUpdate', (oldMember, newMember) => {
          refreshUsers(client,channel);
        })

        client.on('messageReactionAdd', (reaction, user) => {
          let message = reaction.message, emoji = reaction.emoji
          if (message.content =='React here if you wish to speak next' && user.username!=BOT_NAME){
            console.log("Adding to queue" );
            addToQueue(client,channel,user.username);
            //reaction.remove(user);
            message.react("✋");
          }
          if (message.content =='React here once you\'re done speaking !' && user.username!=BOT_NAME ){
            //reaction.remove(user);
            message.react("👍");
            if(user.username==queue[queueCurrentIndex]){
              console.log("Going Nxt")
              GoNext(client,channel);
            }
          }
        });
        client.on('message', message => {
            if(message.content=='!done')
            {
              console.log(queue_msg);
              message.channel.messages.fetch(queue_msg)
                  .then(message => message.delete())
                  .catch(console.error);
              message.channel.messages.fetch(done_msg)
                  .then(message => message.delete())
                  .catch(console.error);
              message.channel.send("Meeting is over !").then(() => message.guild.me.voice.channel.leave()) ;
              reset(client,channel);
            }
        });

	},
};

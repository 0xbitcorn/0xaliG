////////////////////////////////////////////////////
//  ALI - G: AUCTION LISTING INTERACTIVE GANGSTA  //
////////////////////////////////////////////////////

const {Client, Intents, MessageEmbed, MessageAttachment} = require('discord.js');
const puppeteer = require('puppeteer');

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_PRESENCES],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});
const auth = require('./auth.json');

client.once('ready', () =>{
	console.log('Connected!')
	client.user.setStatus('online');
	client.user.setActivity('sumthin on me telly bout monkeys', {type: 'STREAMING', url: 'https://www.youtube.com/watch?v=LRZm9uLRiuE'});
	ClearDatabase();

	var duration = 0;
	var highbid = 0;
	
	client.channels.cache.get(queuechannel).send('queue check').then(tempmsg => {
		setTimeout(() => tempmsg.delete(), 2000)
	}).catch(/*Your Error handling if the Message isn't returned, sent, etc.*/);
	
})

client.on('error', console.log)

client.login(auth.token)

/////////////////
//  CONSTANTS  //
/////////////////
var timeouts = [];
const bitcorn = '416645304830394368';			// bitcorn user id
const server = '962059766388101301';			// server id
const auctionchannel = '974014169483452436';	// auction channel
const auctiontest = '976917431471710289';		// auction test channel
const queuechannel = '978340918061039656';		// queue channel
const databasechannel = '975829186063237140'; 	// database channel

const puzzlegang = '970758538681012315';		// puzzlegang role
const kernalcommander = '970723355097444482';	// kernalcommander role
const wingman = '970760443113111582';			// wingman role
const booyakasha = '976887843915964447';		// booyakasha role

const databasemsg = '975836495606849686'; 		// database message
const prizemsg = '977234646578376724'; 			// prize message
const queuemsg = '978341660507389952';			// queue message

const livecolor = '#00ab66';					// embed color when live
const endcolor = '#cf142b';						// embed color when auction ends
const testcolor = '#FAFA33';					// embed color when under maintenance or a help message
const isLive = false;							// true = live; false = maintenance


const sleep = (delay) => new Promise((resolve) => timeouts.push(setTimeout(resolve,delay)));

// bot avatar
const botimg = 'https://cdn.discordapp.com/attachments/962059766937567254/974343468350603274/aliG_1.png';

// bot start messages
const auction_start=[
"BooyaKORNsha, check it! Wheeze be bittin on dis fine azz BLT. Itz prolly got sum mayo up in dat lettuce an doncha fagetta bout dat wicked bakon! Lez see sum !bits boys and misses!",
"Check dis out... Me Julie say we takin bits on this dope azz shit. Can ya belief dat?!? I tell er to HODL cuz iz straight fire. Y'all best lay some !bits reel quick befor I snap dis up! Respek!",
"Yo, check it. Ders dis lil known techmology call MFtees... Now, u prolly nevr erd dis, but my main man, Carlos, tell me these ain't some bullshit t-shirt atcha local kmart. Deez be dope azz digiTees like dat one below. Now, lay it on me hot like sauss and !biddup yo self",
"Ahhhight... A proposition for ya. Dis wicked image below, be on this bran new thing call innernet. Zeros, ones, and shit all up in a LOOPRING... prolly one of dem space planets where lil blue speedy feets live. 'YO, SONIK! BRING ME DAT IMAGE!' wif dem dope azz sneakers he all... ZOOM... dere befor u know it.",
"I am not Ali A, not Ali B, Ali C, Ali D, Ali E, Ali F... but... Å╙ï-G! Respek! Now, lez get to dis awkshun! Ow many of dem spanish El RCs u got? show me dat !bid",
"Sorry I iz late, dere was sumthin on me telly bout monkeys. Lez do dis thang!" 
]

// bot hype messages
const auction_hype=[
"yo check it, u be a fool if u not gonna level up dis !bid",
"buy dis and da ladies'll luv u... and if you be one of dem fine azz misses, u best be comin to yer main boy Å╙ï 😉",
"doncha stop naw!!! !biddup yo self...",
"Dis iz criminal! And not even da good type wit drugs and drive-bys",
"U wanna know ow to gain R-E-S-T-E-C-P? Iz simple, two words: gimme doz !bit",
"Come one, diz be lik wicked awesome.",
"send feet and bits",
"Yo, all dis talk bout moass... if u win dis lil NiFTy, u will get mo azz",
"me want sum chicken nuggets bout as much as i wan a bid",
"puff puff bid!",
"RESPEK! biddup yo self!",
"Shout out to my main man, carl. He da best! love you carl!"
]

// bot end messages
const auction_end=[
"phat lady be singin yo!",
"Like dat ol geezer once said... dats all she wrote.",
"Wow, brown cow, yao like ming... we got dis done an AOLD dat thang!",
"Ok, check it! now just 10 mo minutes... nah, i gotchu!",
"Ya like TDs? Well, I gotz sumthin for yas... Wut starts wif a T an ends on a D ==> THE END"
]

// bot end gifs
const image_end=[
'https://c.tenor.com/O5gfTOAfzsQAAAAC/laugh.gif',
'https://c.tenor.com/Z9TS7r-0WD4AAAAC/ali-g-indahouse.gif',
'https://cdn.discordapp.com/attachments/962059766937567254/975993390716026900/ali-g-gaming.gif',
'https://i.makeagif.com/media/8-29-2015/s3caiq.gif',
'https://c.tenor.com/O5gfTOAfzsQAAAAC/laugh.gif' //repeated on purpose

]

// random selector
const randommsg = (str) => {
	switch(str){
		case 'start':
			str = auction_start[Math.floor(Math.random()*auction_start.length)];
			return str;
			break;
		
		case 'hype':
			str = auction_hype[Math.floor(Math.random()*auction_hype.length)];
			return str;
			break;
		
		case 'end':
			str = auction_end[Math.floor(Math.random()*auction_end.length)];
			return str;
			break;

		case 'imgend':
			str = image_end[Math.floor(Math.random()*image_end.length)];
			return str;
			break;
}}

//////////////////////
// GLOBAL VARIABLES //
//////////////////////

// RESET THESE VALUES WHEN CALLING NEXT AUCTION
global.seller = "seller";			// NFT SELLER
global.nfturl = undefined;			// NFT LINK ON EXPLORER
global.reserve = '0';				// SELLER SET RESERVE
global.title = "title";				// NFT TITLE
global.imgurl = undefined;			// IMG URL (STATIC => LINK TO NFT EXPLORER; ANIMATED => LINK TO DISCORD ATTACHMENT)

global.highbid = '0';				// CURRENT HIGH BID
global.highbidder = "N/A";			// CURRENT HIGH BIDDER

global.priorbid = '0';				// PREVIOUS HIGH BID
global.priorbidder = "N/A";			// PREVIOUS HIGH BIDDER

global.killauction = false;			// KILL AUCTION TRIGGER

/////////////////
//  FUNCTIONS  //
/////////////////

// retrieve last 100 messages from queue channel (doesn't seem to work the way i want)
async function getqueuecache(){
	await client.channels.cache.get(queuechannel).messages.fetch({limit: 100});
}

// scrape the nft link site to return title and image
async function scrape(nfturl){
	const browser = await puppeteer.launch({});
	const page = await browser.newPage();
	
	await page.goto(nfturl);
	var IMAGE_SELECTOR;
	var placeholder;
	var gotimage = false
	
	if(nfturl.includes('explorer.loopring.io')){
	IMAGE_SELECTOR = '#__next > main > div > div.pt-12 > div > div > img';
	placeholder = 'nft-placeholder.svg';
	}else{
		return 'only set up for explorer.loopring.io right now';
	}
   
	while(gotimage == false){
		await page.waitForTimeout(3000);
		var imageHref = await page.evaluate((sel) => {
			return document.querySelector(sel).getAttribute('src');
		}, IMAGE_SELECTOR);
				
		if(!(imageHref.includes(placeholder))){
			gotimage = true;
			var imageTitle = await page.evaluate((sel) => {
			return document.querySelector(sel).getAttribute('alt');
		}, IMAGE_SELECTOR);
		 
		} else{
			await page.waitForTimeout(1000);
		}
	}
	browser.close();
	//console.log(imageTitle + ' scraped');
	//console.log(imageHref + ' scraped');
	return imageTitle + ',' + imageHref;
}

// clear auction message in database 
async function ClearDatabase(){
	let dbchannel = await client.channels.cache.get(databasechannel);
	let dbmsg = await dbchannel.messages.fetch(databasemsg);
	dbmsg.edit('NO CURRENT AUCTION');
}

// process database message
function dbCurrent(str, delimiter = ",") {
  var arr = str.split(delimiter);
  return arr;
}

// set database message for auction details
async function dbSet(msgid, highbid, highbidder, reserve, updatemsg){//, auctionstart, auctionend) {
	var dbchannel = await client.channels.cache.get(databasechannel);
	var dbmsg = await dbchannel.messages.fetch(databasemsg);
	var db = dbCurrent(dbmsg.content);
	if (dbmsg.content == "NO CURRENT AUCTION"){
		this.startmsg = msgid;
		this.highbid = 0;
		this.highbidder = 'N/A';
		this.reserve = reserve;
		this.updatemsg = updatemsg;
		//this.start = auctionstart;
		//this.end = auctionend;
	}else{
	if(typeof msgid === "undefined" || msgid == "") {
			this.startmsg = db[0];
		} else{
			this.startmsg = msgid;
		}
		if(typeof highbid === "undefined" || highbid == "") {
			this.highbid = db[1];
		} else{
			this.highbid = highbid;
		}
		if(typeof highbidder === "undefined" || highbidder == "") {
			this.highbidder = db[2];
		} else{
			this.highbidder = highbidder;
		}
		if(typeof reserve === "undefined" || reserve == "") {
			this.reserve = db[3];
		} else{
			this.reserve = reserve;
		}
		if(typeof updatemsg === "undefined" || updatemsg == "") {
			this.updatemsg = db[4];
		} else{
			this.updatemsg = updatemsg;
		}
		/* 
		if(typeof auctionstart === "undefined" || auctionstart == "") {
			this.start = db[4];
		} else{
			this.start = auctionstart;
		}
		if(typeof auctionend !== "undefined" || auctionend == "") {
			this.end = db[5];
		} else{
			this.end = auctionend;
		} */

	}
	
		db[0] = this.startmsg;
		db[1] = this.highbid;
		db[2] = this.highbidder;
		db[3] = this.reserve;
		db[4] = this.updatemsg;
		//db[4] = this.start;
		//db[5] = this.end;
	
		var dbstr = Array.isArray(db) ? db.join(',') : "NO CURRENT AUCTION";
	
	return dbmsg.edit(dbstr);
}

// grab details for next auction
async function getNextAuction() {
	var dbchannel = await client.channels.cache.get(databasechannel);
	var dbmsg = await dbchannel.messages.fetch(queuemsg);
	var qmsg = dbmsg.content;
	if(qmsg.includes(',')){
		qmsg = qmsg.split(',')[0];
	}
	console.log('qmsg: ' +qmsg);
	
	var chan = await client.channels.cache.get(queuechannel);
	var queueitem = await chan.messages.fetch(qmsg);
	let qembed = await queueitem.embeds[0];
	
	let qseller = await qembed.fields[0].value;
	let qduration = await qembed.fields[1].value;
	let qreserve = await qembed.fields[2].value;
	let qimage = await qembed.thumbnail.url;
	let qtitle = await qembed.title;
	let qurl = await qembed.url;
	
	//console.log('seller: ' + qseller);
	//console.log('duration: ' + qduration);
	//console.log('reserve: ' + qreserve);
	//console.log('image url: ' + qimage);
	//console.log('title: ' + qtitle);
	//console.log('title url: ' + qurl);
	
	let auctiondetails = qseller + ', ' + qduration + ', ' + qreserve + ', ' + qimage + ', ' + qtitle + ', ' + qurl;
	
	return auctiondetails;
}

// check if string is valid url
function isValidURL(string) {
	var urlregex = /(http|https|ftp)+:\/\/([a-zA-Z]+(\.[a-zA-Z]+)+)*/;
    return urlregex.test(string);
};

// convert time into proper format
function setLength(time){
	let daysSL = 0;
	let hoursSL = 0;
	let minuteSL = 0;

		if(time.includes(':')){
			hoursSL = time.split(':')[0];
			minuteSL = time.split(':')[1];
			time ="";
			
			if(hoursSL >= 24){
				daysSL = Math.floor(hoursSL/24);
				hoursSL = hoursSL - daysSL*24;
				time = daysSL + 'd ';
				}else{
					time = 0 + 'd ';
				}
			
			if(hoursSL > 0){
					time = time + hoursSL + 'h ';
			}else{
				time = time + 0 + 'h ';
			}
			
			if (minuteSL > 0){
				time = time + minuteSL + 'm ';
			}
			return time;
			
		} else{
			let processtime = time;

			if(processtime.includes('d')){
				daysSL = processtime.split('d')[0];
				processtime = processtime.split('d')[1];
			}
			
			if(processtime.includes('h')){
				hoursSL = processtime.split('h')[0];
				processtime = processtime.split('h')[1];
				if(hoursSL >= 24){
					daysSL = daysSL + Math.floor(hoursSL/24);
					hoursSL = hoursSL % 24;
				}
			}			
			
			if(processtime.includes('m')){
				minuteSL = processtime.split('m')[0];
				
				if (minuteSL >= 1440){
					daysSL = daysSL + Math.floor(minuteSL/1440);
					minuteSL = minuteSL % 1440;
				}
				
				if(minuteSL >= 60){
					hoursSL = hoursSL + Math.floor(minuteSL/60);
					minuteSL = minuteSL % 60;
				}
			}	
				
	}
			time = daysSL + 'd ' + hoursSL + 'h ' + minuteSL + 'm ';   	
			return time;
}

// check if a string contains a word
function containsWord(str, word) {
  return str.match(new RegExp("\\b" + word + "\\b")) != null;
}

/////////////////////
//  messageCreate  //
/////////////////////

// whenever a message if created, run this process 
client.on("messageCreate", async message => {

	// if the message isn't in either the auction channel, test channel, or queue channel, exit
	if(!(message.channel.id == auctionchannel) && !(message.channel.id == auctiontest) && !(message.channel.id == queuechannel)) return;

	// check if the author is a bot and quit if so (unless in the queuechannel ==> for triggering the initial cache)	
	if(message.author.bot && !(message.channel.id == queuechannel)) return;

	// set initial variables
	var msg = message.content.toLowerCase();		// message content (converted to lowercase)
	var embedColor;
	var auctiontext;

// QUICK CHECK TO ALLOW SETTING SYSTEM TO MAINTANENCE 
if(isLive){	embedColor = livecolor; auctiontext = 'AUCTION';}
else{ embedColor = testcolor; auctiontext = 'FAKE AUCTION';}

// check if member has the necessary role for using commands
if(message.member.roles.cache.has(puzzlegang) ||  message.member.roles.cache.has(wingman) || message.member.roles.cache.has(kernalcommander) || message.member.roles.cache.has(booyakasha)){	
	if(message.author.id == bitcorn){
		// create a new database entry
		if(msg.includes('!createmsg')){
			client.channels.cache.get(databasechannel).send('NEW DATABASE MESSAGE CREATED');
		}

		// get next auction
		if(msg.includes('!next')){
			let nextauction = await getNextAuction();
			message.reply(nextauction + '');			
		}

		// count the number of winners in current prize message
		if(msg.includes('!count')){
			var dbchannel = await client.channels.cache.get(databasechannel);
			var dbmsg = await dbchannel.messages.fetch(prizemsg);
			let pmsg = dbmsg.content;
			message.reply(pmsg.split(',').length + '/42');
		}

		//scrape information from website
		if(msg.includes('!scrape')){
		var details = await scrape(msg.split(' ')[1]);
		var deTitle = details.split(',')[0];
		var deImg = details.split(',')[1];
		let sEmbed = new MessageEmbed()
							.setColor(testcolor)
							.setTitle(deTitle)
							.setDescription('Å╙ï-G SCRAPE TEST')
							.setImage(deImg)
				let scrapeEmbed = message.channel.send({ embeds: [sEmbed] });
		}

		// push edit to prize message (custom set below)
		if(msg.includes('!edit')){
			var dbchannel = await client.channels.cache.get(databasechannel);
			var dbmsg = await dbchannel.messages.fetch(prizemsg);
			let pmsg = '<@933803317019148348>\n<@930299609530662952>\n<@350491516893921301>\n<@197519618028339200>\n<@176420246989701121>\n<@939550468525396078>\n<@940260532139733023>\n<@135127522152022017>\n<@144923664335241216>\n<@229038935358046211>\n<@564797291635146753>';
			dbmsg.edit(pmsg);
		}

		// push a dm (custom set below)
		if(msg.includes('!dm')){
			var dbchannel = await client.channels.cache.get(databasechannel);
			var dbmsg = await dbchannel.messages.fetch(prizemsg);
			let userTodm = msg.split(' ')[1];
			userTodm = userTodm.replace(/\s/g, '').replace('<@', '').replace('>','');
			//console.log(userTodm + '');
			const user = await client.users.fetch(userTodm).catch(() => null);
			
			if (!user) return message.channel.send("User not found :(");
			let dmcontent = "uh... hi";
			//"Congrads! me Julie say i should let u know dat u wuz number 4/69, my man. U iz gonna getta BLT! DM BTCornBLAIQchnz with yo wallet address!";
			await user.send(dmcontent).catch(() => {
				message.channel.send("User has DMs closed or has no mutual servers with the bot:(");
			});
		}
		
		// remove a user from the prize message
		if(msg.includes('!remove')){
			var dbchannel = await client.channels.cache.get(databasechannel);
			var dbmsg = await dbchannel.messages.fetch(prizemsg);
			let pmsg = dbmsg.content;

			let userToRemove = '\n' + msg.split(' ')[1];
			//console.log(userToRemove);
			userToRemove = userToRemove.replace(/\s/g, '');
			//console.log(userToRemove);
			if(pmsg.includes(userToRemove)){
				pmsg = pmsg.replace(userToRemove,'');
				pmsg = pmsg.replace('\n',', ');
			}
			dbmsg.edit(pmsg);
		}
	}
	
	if(msg.includes('!queue')){
		try{
		var dbchannel = await client.channels.cache.get(databasechannel);
		var dbmsg = await dbchannel.messages.fetch(queuemsg);
		let qmsg = dbmsg.content;
		let inputs = msg.replace('!queue','').replace(/\s/g,'');
		let arr = new Array();
		arr = inputs.split(',');
		
		if (!(isValidURL(arr[0]))){
			message.reply('Sorry man, dat link u iz wack! Gotta giv it to me wif the http');
			throw 'Parameter is not a valid url!';}
		
		var details = await scrape(arr[0]);
		var qTitle = details.split(',')[0];
		var qImg = details.split(',')[1];
		qImg = encodeURI(qImg);

		var qduration = setLength(arr[1]);
		var qreserve = '0';
		if (!(typeof arr[2] === 'undefined')){qreserve = arr[2];}
			let qEmbed = new MessageEmbed()
				.setColor(testcolor)
				.setTitle(qTitle)
				.setURL(arr[0])
				.setThumbnail(qImg)
				.addFields(
					{ name: 'SELLER', value: '<@'+message.author+'>'},
					{ name: 'DURATION', value: qduration, inline: true},
					{ name: 'RESERVE', value: qreserve, inline: true}
				)
				.setFooter({text: 'BUYERS: Click the ✅ emoji for an alert when time is near \nSELLER|ADMIN: Click the ❌ emoji to remove this listing from the queue'})
			let queueEmbed = await client.channels.cache.get(queuechannel).send({ embeds: [qEmbed] });
			queueEmbed.react('✅').then(
				queueEmbed.react('❌'));			

			if(qmsg == 'NO QUEUE'){
				qmsg = queueEmbed.id;
			}else{
				qmsg = qmsg + ', ' + queueEmbed.id;
			}

			dbmsg.edit(qmsg);
			message.delete();
 
		} catch(err){
			message.react('❌');
			console.log(err);
		}
	}
}

if(msg == '!help'){
	let hEmbed = new MessageEmbed()
	.setColor(testcolor)
	.setTitle('[Å╙ï-G BASICS]')
	.addFields(
		{ name: '[BID COMMANDS]', value: '!bid, !bit, or !biddup <amount> \n *all perform the same function* \n \n '},
		{ name: '\u200B', value: '\u200B' },
		{ name: '[AUCTION COMMANDS]', value: '*Limited to certain roles, only one auction allowed at a time*'},
		{ name: 'START AUCTION', value: '1.) Post your image \n 2.) Reply to that image post with the command: \n      !auction **<NFT link>**, **<duration>**, <reserve> \n *<NFT link> is the link to the NFT on the explorer \n <duration> can be entered as HH:MM or as #d #h #m \n <items> in bold are required*'},								
		{ name: 'OVERRIDE BID', value: 'Admin can override the current bid by using the command: \n !override <amount>, <@biddername>'},
		{ name: 'KILL AUCTION', value: 'Admin can kill an auction by using the command: \n !auction kill \n '}
	)
	.setDescription('If you have any questions or suggestions,\n please DM @BTCornBLAIQchnz')
	.setThumbnail(botimg)
	.setFooter({text: 'Git lernt up den drop sum bits! Biddup yo self! Respek!'})
	try{
		await message.author.send({ embeds: [hEmbed] });
		message.react('📨');
	} catch(err){
		message.author.send("Yo, u iz haz dem DMs closed or sumthin.");
		message.channel.send({ embeds: [hEmbed] });
	}
}


	if (msg.includes('!auction')) {
		msg = msg.slice(8).replace(/\s/g,'');

	// limit these functions to approved auction roles				
	if(message.member.roles.cache.has(puzzlegang) ||  message.member.roles.cache.has(wingman) || message.member.roles.cache.has(kernalcommander) || message.member.roles.cache.has(booyakasha)){
			
			// kill function (limit to admin only)
			if(msg == 'kill'){
				if(message.member.roles.cache.has(puzzlegang) || message.member.roles.cache.has(kernalcommander)){
				var dbchannel = await client.channels.cache.get(databasechannel);
				var dbmsg = await dbchannel.messages.fetch(databasemsg);
				dbmsg.edit('NO CURRENT AUCTION');
				message.channel.send('Sorry, boyz and missez. One time when me was high, me sold me car for like 24 chicken McNuggets. I think I betuh stop this awkshun now. Gimme a bit.');
				client.user.setStatus('online');
				client.user.setActivity('dat sexy static channel', {type: 'WATCHING'});
				killauction = true;
				
				for (var i=0; i<timeouts.length; i++) {
				  clearTimeout(timeouts[i]);
				}} else{
					message.react('❌');
					message.reply('u iz need an adult fo dat');
				}

			// temporary workaround for auctionkill issue				
			} else if(killauction == true){
				message.reply('gimme one mo minute... i need to kill an awkshun and finnish me smoke')
				message.reply('!timer 1');
				setTimeout(() => {
					killauction = false;
					message.reply('ok, wut?');
				}, "59000");

			} else{	
				// Starting from a sent !auction message
				// set status to dnd and post initial message	

				if(client.user.presence.status == 'dnd'){
					if(dbmsg == 'NO CURRENT AUCTION'){
						client.user.setStatus('online');
						client.user.setActivity('dis blunt burn...', {type: 'WATCHING'});
						message.reply('sorry, me waz on the crapper... wut now?')
					}else{;
						message.react('❌');
						message.reply('Yo, my main man... one awkshun at a time. Check bak latr!')}
				} else{
		(async() => {
					nfturl = msg.split(",")[0];
					
					if (!(isValidURL(nfturl))){
						message.reply('Sorry man, dat link u iz wack! Gotta giv it to me wif the http');
						throw 'Parameter is not a valid url!';
					}
						scrapetext = await scrape(nfturl);
						title = scrapetext.split(',')[0];
						
						if(message.type === 'REPLY'){
						await message.fetchReference().then(repliedTo =>{
								if(repliedTo.attachments.size > 0){
									imgurl = repliedTo.attachments.first().url;		//if image is in replied message (convert to being in same message)
								}else{
									imgurl = scrapetext.split(',')[1];
								}
							}).catch (err =>{
								console.log(err);
								imgurl = scrapetext.split(',')[1];
							});
						}else{
							if(message.attachments.size >0){
								imgurl = message.attachments.first().url;
							} else{
								imgurl = scrapetext.split(',')[1];
							}
						}

						imgurl = encodeURI(imgurl);
						//console.log(imgurl + '');
						//console.log(title + '');	
					
					
					if (typeof msg.split(",")[1] === 'undefined'){
						duration = '5 min';
					} else{
						duration = msg.split(",")[1];
						duration = duration.replace(/\s/g, '');
						duration = setLength(duration);

						processtime = duration.replace(/\s/g, '');
						if(processtime.includes('d')){
							days = parseInt(processtime.split('d')[0]);
							processtime = processtime.split('d')[1];
						}
							
							if(processtime.includes('h')){
								var str1 = processtime.split('h')[0];
								hours = parseInt(processtime.split('h')[0]);
								processtime = processtime.split('h')[1];
							}
							
							if(processtime.includes('m')){
								minutes = parseInt(processtime.split('m')[0]);
							}
						}

						
						if (typeof msg.split(",")[2] === 'undefined'){
							reserve = '0';
						} else{
							reserve = msg.split(",")[2];
							reserve = reserve.replace(/\s/g, '');
						}

						let descript = randommsg('start');
						seller = message.author;
						
					//initial message						
						var authormsg = 'Åuction ╙isting ïnteractive Gangsta';
						let iEmbed = new MessageEmbed()
							.setColor(embedColor)
							.setTitle('['+ auctiontext + ' STARTED]')
							.setAuthor({name: authormsg})
							.setDescription(descript)
							.setThumbnail(botimg)
						let introEmbed = message.channel.send({ embeds: [iEmbed] });
						client.user.setStatus('dnd');
						client.user.setActivity('bids (LIVE)', {type: 'LISTENING'});

					//eventually want to convert this to a true time check system instead of using delays
						const auctionstart = new Date();
						var startTime = auctionstart.getTime();
						//console.log(days + 'd' + hours + 'h' + minutes + 'm');
						var minutesToAdd = (days * 24 * 60) + (hours * 60) + minutes;
						let auctionend = new Date(startTime + minutesToAdd*60000);
						duration = Math.ceil((auctionend - auctionstart)/1000)*1000;
						//console.log(duration + ' duration');
						var minsleft = Math.ceil(duration/(60*1000));
						//console.log(minsleft + ' minsleft');
						var hoursleft;
						var daysleft;
						if(minsleft >= 60){
							hoursleft = Math.floor(minsleft/60);
							if(hoursleft >= 24){
								daysleft = Math.floor(hoursleft/24);
								hoursleft = hoursleft % 24;
							}else{
								daysleft = 0;
							}
						}else{
							hoursleft = 0;
						}				
						
						minsleft = minsleft % 60;

						var timeleft = '';
						if(daysleft > 4){
							timeleft = daysleft + "d" + hoursleft + "h" + minsleft + "m";
						} else{
							hoursleft = daysleft * 24 + hoursleft;
							if(hoursleft>0) {
								timeleft = hoursleft + ":" + ('00'+minsleft).slice(-2);
							} else if(minsleft>1){
								timeleft = minsleft + " mins";
							} else{
								timeleft = minsleft + " min";
							}							
						}

						var footertxt = '[' + auctiontext + '] \n bid commands: !bid !bit !biddup';
						var authormsg = 'NO BIDS YET';
						//console.log(auctiontext + '');
						//console.log(title + '');
						//console.log(nfturl + '');
						//console.log(authormsg + '');
						//console.log(imgurl + '');
						//console.log(reserve + '');
						//console.log(highbidder + '');


						let aEmbed = new MessageEmbed()
							.setColor(embedColor)							
							.setTitle(title)
							.setURL(nfturl)
							.setAuthor({name: authormsg})
							.setImage(imgurl)
							.addFields(
								{ name: 'TIME LEFT: ' + timeleft, value: 'RESERVE: ' + reserve + ' LRC', inline: true },
								{ name: 'HIGH BIDDER', value: highbidder, inline: true}
								)
							.setTimestamp()
							.setFooter({text: ''+ footertxt});
						message.channel.send({ embeds: [aEmbed] }).then(auctionEmbed => {
							dbSet(auctionEmbed.id, "0", 'N/A', reserve,'N/A'); //, startTime, endTime);
						});
								
					
						
			
			// below code is for update intervals

							var nextupdate;	
							//message.reply('hours: ' + hoursleft + " & minutes: " + minsleft);
							if (duration/1000 > 60){
								nextupdate = duration % 60000 + 60000;
							} else {
								nextupdate = 50000;
							}
							
							//console.log('initial nextupdate: ' + nextupdate);
							//console.log('initial duration: ' + duration);
							
				while(duration > 0 && killauction == false){
								await sleep(nextupdate);
								var dbchannel = await client.channels.cache.get(databasechannel);
								var dbmsg = await dbchannel.messages.fetch(databasemsg);
								let amsg = dbmsg.content;
								
								startmsg = amsg.split(',')[0];
								highbid = amsg.split(',')[1];			// should this be pulled from database or left to global 
								highbidder = amsg.split(',')[2];		// should this be pulled from database or left to global 
								
								let chan = await client.channels.cache.get(auctionchannel); 
								let msgembed = await chan.messages.fetch(startmsg);
								let updateEmbed = await msgembed.embeds[0];
								
								duration = duration - nextupdate;
								//console.log(duration);				
								if(duration >= 3*60000){ //more than 2 minutes
									nextupdate = duration % 60000 + 60000;
								} else if(duration > 69000){ //between 1 and 2 minutes
									nextupdate = duration % 69000;
								} else if(duration == 69000){
									message.channel.send('69 SEX!!!');
									nextupdate = 9000;
								} else if(duration == 60000){
									message.channel.send('1 MINIT LEFF!!!');
									nextupdate = 15000;
								}  else if(duration == 45000){
									message.channel.send('45 SEX!!!');
									nextupdate = 15000;
								} else if (duration == 30000){
									message.channel.send('30 SEX!!!');
									nextupdate = 15000;
								} else if (duration == 15000){
									message.channel.send('15 SEX!!!');
									nextupdate = 5000;
								} else { //last 10 seconds
									nextupdate = 1000;
								}
								hoursleft = Math.floor(duration /(60*60*1000));
								minsleft = Math.floor((duration - (hoursleft*60*60*1000))/(60*1000)); 
								if(hoursleft>0) {
									timeleft = hoursleft + ":" + ('00'+minsleft).slice(-2);
								} else if(minsleft>1){
									timeleft = minsleft + " mins";
								} else if(minsleft>0){
									if(duration >59000){timeleft = minsleft + " min";
									} else{
										timeleft = "<1 min";
									}
								} else {
									if(duration == 0){
										dbmsg = await dbchannel.messages.fetch(databasemsg);
										amsg = dbmsg.content;
										var winningbid = amsg.split(',')[1];	// should this be pulled from database or left to global
										reserve = amsg.split(',')[3];			// should this be pulled from database or left to global
										var winningbidder;
										var titlemsg;
										var authormsg;
										authormsg = 'Å╙ï-G [' + auctiontext + ' ENDED]';
										authormsg = authormsg.split('').join(' ');
										var endmsg = randommsg('end');
										var endimage;
										
										updateEmbed.setColor(endcolor);
										msgembed.edit(new MessageEmbed(updateEmbed));
										msgembed.edit({embeds: [updateEmbed]});

										if (winningbid > 0){
											winningbidder = amsg.split(',')[2];		// should this be pulled from database or left to global
											titlemsg = 'HIGH BID = ' + winningbid + ' LRC';
											titlemsg = titlemsg.split('').join(' ');
											endimage = randommsg('imgend');
											if(+winningbid < +reserve){
												authormsg = '>>>RESERVE NOT MET (' + reserve + ' LRC)';
												endmsg = "Well shit... we ain't git over dat reserve. I'll let you figz dis one out.";
												endimage = 'https://i.gifer.com/76Gy.gif';
											}

										} else{
											winningbidder = 'Sum wak shiz! No bits';
											titlemsg = 'NO BIDS, NO SALE';
											titlemsg = titlemsg.split('').join(' ');
											endmsg = 'The bid wasnt high, but Im gonna be...';
											endimage = 'https://c.tenor.com/Dv1u3wqjGfIAAAAC/boring-bored.gif';
										}
										timeleft = "ENDED";
																				
										let eEmbed = new MessageEmbed()
											.setColor(endcolor)
											.setTitle(titlemsg)
											.setAuthor({name: authormsg})
											.setDescription(endmsg)
											.setThumbnail(botimg)
											.addFields(
												{ name: 'SELLER', value: '<@'+seller+'>', inline: true },
												{ name: 'HIGH BIDDER', value: winningbidder, inline: true}
											)
											.setFooter({text: 'Report any issues/suggestions via DM to @BTCornBLAIQchnz'})
										let endEmbed = await message.channel.send({ embeds: [eEmbed] });
										
										message.channel.send({files: [endimage]});
									
									dbmsg.edit('NO CURRENT AUCTION');
									client.user.setStatus('online');
									client.user.setActivity('Fantasia', {type: 'WATCHING'});

									
									} else{
											timeleft = '<1 min';
									}
								}	
									

									if(timeleft == "ENDED"){
										updateEmbed.setColor(endcolor);
									}
									
									updateEmbed.fields[0] = { name: 'TIME LEFT: ' + timeleft, value: 'RESERVE: ' + reserve + ' LRC', inline: true }
									if(winningbid > 0){
										authormsg = '>>>HIGH BID = ' + highbid + ' LRC';
										authormsg = authormsg.split('').join(' ');
										updateEmbed.setAuthor({name: authormsg})
										updateEmbed.fields[1] ={ name: 'HIGH BIDDER', value: highbidder, inline: true}
									}
									
									msgembed.edit(new MessageEmbed(updateEmbed));
									msgembed.edit({embeds: [updateEmbed]});
									updateEmbed.setThumbnail(imgurl);
									updateEmbed.setImage();

					
									
					if(duration/1000 > 69 || duration/1000 == 60){
							let dbchannel = await client.channels.cache.get(databasechannel);
							let dbmsg = await dbchannel.messages.fetch(databasemsg);
							let amsg = dbmsg.content;
							var updatemsg = amsg.split(',')[4];
							
							if(updatemsg == 'N/A'){
								await message.channel.send({ embeds: [updateEmbed] }).then(secondMessage => {
								dbSet(undefined, undefined, undefined, undefined, secondMessage.id); //, startTime, endTime);
								});
							} else{
								let chan = await client.channels.cache.get(auctionchannel); 
								let messages = await chan.messages.fetch({limit: 1});
								let lastMessage = messages.first();
								let secondMessage = await chan.messages.fetch(updatemsg);
								
								if (lastMessage.id == secondMessage.id){															
									secondMessage.edit(new MessageEmbed(updateEmbed));
									secondMessage.edit({embeds: [updateEmbed]});
								}else{
									secondMessage.delete();
									await message.channel.send({ embeds: [updateEmbed] }).then(secondMessage => {
									dbSet(undefined, undefined, undefined, undefined, secondMessage.id); //, startTime, endTime);
									});
								}
							}
					}
					if(duration/1000 > 60){
						if(Math.floor(Math.random() * 100) > 85){
							const attachment = new MessageAttachment(imgurl);
							let randomhype = '>>> ' + randommsg('hype');
							if(Math.floor(Math.random() * 100) > 50){
								message.channel.send({content: randomhype, files: [attachment]});
							} else{
								message.channel.send(randomhype);
							}
						}
					}

					if(duration/1000 == 10){									
						message.channel.send(duration/1000 + '...  *(HIGH BID: ' + highbid + ' LRC)*');
					} else{
						if(duration/1000 < 10 && duration/1000 > 0){
							message.channel.send(duration/1000 + '...  *(HIGH BID: ' + highbid + ' LRC)*');
						}
					}
					
					updateEmbed.setThumbnail();
					updateEmbed.setImage(imgurl);
				}		
					killauction = false;
			})();	
				}					
				
			}
		} else{
			message.react('❌');
			message.reply('yoo iz need an adult fo dat.');
		}			
	}

	
	try{
		
		if(msg.includes('booyakasha')){
			message.react('976603681850003486');
		}
		
		if(msg.includes('booyakornsha')){
			
			var dbchannel = await client.channels.cache.get(databasechannel);
			var dbmsg = await dbchannel.messages.fetch(prizemsg);
			let pmsg = dbmsg.content;
			var currentCount = pmsg.split(',').length;
			if(!(pmsg.includes(message.author)) && (currentCount < 42)){
				pmsg = pmsg.replace(/, ,/g,',') + ', ' + '<@'+message.author+'>';
				pmsg = pmsg.replace(/,,/g,',');
				dbmsg.edit(pmsg);
				currentCount = currentCount+1;
				message.react('🔥').then(msgd => {
					setTimeout(() => message.delete(), 2000);
					message.author.send("Congrads! u wuz number " + currentCount + "/42. u iz rekorded, my man. U iz gonna getta BLT! DM BTCornBLAIQchnz with yo wallet address!");
				}).catch(() => {
					message.channel.send("Yo, u iz haz dem DMs closed or sumthin. DM BTCornBLAIQchnz.");
				});
			}else{
				if(currentCount>42){
					await message.author.send("Sorry dude, if u iz lookin for dat BLT, me sent out the 42. Der will be more soon, my man.").catch(() => {
						message.author.send("Yo, u iz haz dem DMs closed or sumthin. I iz out tho.");
					});
				}else{
					message.delete();
				}
			}
		}

		if(msg.includes('!bid') || msg.includes('!bit') || msg.includes('!biddup') || msg.includes('!override')){
				var dbchannel = await client.channels.cache.get(databasechannel);
				var dbmsg = await dbchannel.messages.fetch(databasemsg);
				let amsg = dbmsg.content;
				let isOverride = false;

				if(amsg != 'NO CURRENT AUCTION'){
					if(!(client.user.presence.status == 'dnd')){
						client.user.setStatus('dnd');
						client.user.setActivity('bids (LIVE)', {type: 'LISTENING'});
					}
					
					var startmsg = amsg.split(",")[0];
					var currbid = amsg.split(",")[1];
					if(currbid > highbid){
						highbid = currbid;
					}
					var updatemsg = amsg.split(',')[4];
					highbidder = message.author.username.split("#")[0];
	// made an adjustment here to consider !bid69 (no spaces)
					bidamount = msg.replace('!biddup','').replace('!bid','').replace('!bit','').replace(/\s/g, '').replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');;
					
					
					if(msg.includes('!override')){
						if(message.member.roles.cache.has(puzzlegang)){
							isOverride = true;
							var override = msg.slice(10);
							override = override.replace(/\s/g, '');
							highbid = 0;
							bidamount = override.split(',')[0];
							highbidder = override.split(',')[1];
						} else{
							 message.react('❌');
							 message.reply('u iz need an adult for dat.');					
							 return;
						}
					}
					bidamount = bidamount.replace(/,/g, '');	
					let hasLetter = /[a-zA-Z]/.test(bidamount);				
					let isnum = /^\d+$/.test(bidamount);
					bid = parseInt(+bidamount);
					if(+bidamount > bid || +bidamount < 1374513896){
						var decimalbid = true; 
					}

				if(+bid > +highbid && +bid < 1374513896 && !(hasLetter)){

					let chan = await client.channels.cache.get(auctionchannel); 
					let msgembed = await chan.messages.fetch(startmsg);
					let updateEmbed = await msgembed.embeds[0];			
					if(bid > 0){

						highbid = bid

						authormsg = '>>>HIGH BID = ' + highbid + ' LRC';
						authormsg = authormsg.split('').join(' ');
						updateEmbed.setAuthor({name: authormsg})
						updateEmbed.fields[1] ={ name: 'HIGH BIDDER', value: highbidder, inline: true }
						msgembed.edit(new MessageEmbed(updateEmbed));
						msgembed.edit({embeds: [updateEmbed]});
						

						if(!(updatemsg == 'N/A')){
							let secondMessage = await chan.messages.fetch(updatemsg);															
							let secondEmbed = await secondMessage.embeds[0];
							authormsg = '>>>HIGH BID = ' + highbid + ' LRC';
							authormsg = authormsg.split('').join(' ');
							secondEmbed.setAuthor({name: authormsg})
							secondEmbed.fields[1] ={ name: 'HIGH BIDDER', value: highbidder, inline: true}
							secondMessage.edit(new MessageEmbed(secondEmbed));
							secondMessage.edit({embeds: [secondEmbed]});
						}
						
						var bidmsg;
						
						//override currently waits for update to refresh message... check if we can update sooner.
						
						if(msg.includes('!override')){
							bidmsg = 'Yo, check it... I set dat bid at ' + bid + ' for my man ' + highbidder + '. Now youze keep droppin dem bits!'
							dbSet(undefined, bid, highbidder); //, undefined, undefined ,undefined);
						}else{
							bidmsg = '[NEW HIGH BID] ' + bid +' LRC by <@' + message.author + '>';
							dbSet(undefined, bid, message.author); //, undefined, undefined ,undefined);
						}
						
						
						if(bid == 1){
							bidmsg = bidmsg + '\n *whoa nelly, gramma git u dat allowantz dis week? lookin lik mario puddin dat 1up*';
						} else if(bid == 13){
							bidmsg = bidmsg + '\n *Yo, iz dat numba 13 voodoo shiz... sumone gotta bit us pass dis!*';
						} else if(bid == 21){
							bidmsg = bidmsg + '\n *ahhight, dis awkshun can ofishaly drink... Git ya 40 an bottom up!*';
						} else if(bid == 40){
							bidmsg = bidmsg + '\n *ahh... a 40, me favorit way to start me day*';
						} else if(bid == 42){
							bidmsg = bidmsg + '\n *dis... iz the answer me been waitin for*';
						} else if(bid == 69){
							bidmsg = bidmsg + '\n *69... iz that a bit, oh a propazition?*';
						} else if(bid == 88){
							bidmsg = bidmsg + '\n *Doc say when dis hitz 88, weed see sum cereal shit...*';
						} else if(bid == 96){
							bidmsg = bidmsg + '\n *96... me got a mirror, I iz know wot u sayin*';
						} else if(bid == 99){
							bidmsg = bidmsg + '\n *♫ red baboons goed by.. ♫*';
						} else if(bid == 101){
							bidmsg = bidmsg + '\n *lik dem dalmashuns... me ant linda not look lik crewela, but she ax liker.*';
						} else if(bid == 121){
							bidmsg = bidmsg + '\n *1 point TWENTY ONE GIGGAWEEDZ*';
						} else if(bid == 180){
							bidmsg = bidmsg + '\n *wicka wicka 180... turn dis beat right round!*';
						} else if(bid == 222){
							bidmsg = bidmsg + '\n *luv dem twos, yo! Respek!*';
						} else if(bid == 350){
							bidmsg = bidmsg + '\n *I aint no god damn nessie, but ill take dat tree fitty!*';
						} else if(bid == 420){
							bidmsg = bidmsg + '\n *yo, dat reminz me. time fo me medication*';
						} else if(bid == 421){
							bidmsg = bidmsg + '\n *I call this my ***close enuff puff***';
						}else if(bid == 666){
							bidmsg = bidmsg + '\n *ooO, me cousin Rhonda haz dat tattoo. She a beast.*';
						} else if(bid == 741){
							bidmsg = bidmsg + '\n *yo, RC dat u?*';
						} else if(bid == 808){
							bidmsg = bidmsg + '\n *we gotz that 808 bump!*';
						} else if(bid == 828){
							bidmsg = bidmsg + '\n *828.. RIDE OR DIE...*';
						} else if(bid == 1337){
							bidmsg = bidmsg + '\n *b00y4k0rn5h4!*';
						} else if(bid == 9001){
							bidmsg = bidmsg + '\n *OVER 9000!!! BOOYAKORNSHA!*';
						} else if(bid == 80085){
							bidmsg = bidmsg + '\n *dem iz titties. Hopes u be akfordin dat!*';
						}
						message.reply(bidmsg);
					} 
					
					
					}else{
						if(decimalbid){
							message.reply('Wuts diz shiz? Check it yo, biddup in ho numberz. High bit iz ' + highbid);
						}else if(!(isnum)){
							message.reply('Gif me da money in strayt numberz... no oter fancy karacktrz. Biddup yo self! High bid iz ' + highbid + ' LRC.' );
						} else if(+bid > 1374513896){
							message.reply('Yo, Ow u haf mor El RCs dan dat max supply???' );	
						}
						else{
							message.reply('Me Julie says ' + bid + ' iz lower than ' + highbid + ' LRC. Get high...er!' );
						}
					}
				} else{
					message.reply('No current awkshun, so whatcha bittin on?');
				}

			}	
	} catch(err){
		console.log(err);
	}		
});

//////////////////////////
//  messageReactionAdd  //
//////////////////////////

client.on('messageReactionAdd', async (reaction, user) => {	
	if(reaction.message.partial) await reaction.message.fetch();
	if(reaction.partial) await reaction.fetch();
	if(user.bot) return;
	if (!reaction.message.guild) return;
	if(reaction.message.channel.id == queuechannel){
		if(reaction.emoji.name === '❌'){
			let qUser = reaction.message.embeds[0].fields[0].value;
			//console.log(reaction.message.guild.member(user).roles.cache.has(puzzlegang));
			var hasRole = await reaction.message.guild.members.cache.get(user.id).roles.cache.has(puzzlegang);
			
			console.log(hasRole);
			if(qUser.includes(user.id) || hasRole){
				var removemsgid = reaction.message.id;
				var dbchannel = await client.channels.cache.get(databasechannel);
				var dbmsg = await dbchannel.messages.fetch(queuemsg);
				let qmsg = dbmsg.content;
				if(qmsg.includes(removemsgid)){
					if(qmsg == removemsgid){
						qmsg = 'NO QUEUE';
					}else{
						qmsg = qmsg.replace(removemsgid,'').replace(', ,',',');
						
						if(qmsg.charAt(0)==','){
							qmsg=qmsg.slice(2);
						}
						
						if(qmsg.charAt(qmsg.length - 2) ==','){
							qmsg=qmsg.slice(0, qmsg.length - 2);
						}
					}
					dbmsg.edit(qmsg);
					
					//reaction.message.delete();
				} else{
					console.log('Queue message was not in database');
					//reaction.message.delete();
				}
				
				//console.log(removemsgid + '');
			}else{
				reaction.remove();
			}
		}
	}else{
		return;
	}
});
////////////////////////////////////////////////////
//  ALI - G: AUCTION LISTING INTERACTIVE GANGSTA  //
////////////////////////////////////////////////////

const {Client, Intents, MessageEmbed, MessageAttachment, Collection} = require('discord.js');
const puppeteer = require('puppeteer');
const moment = require('moment');
const auth = require('./auth.json');

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_PRESENCES],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.once('ready', () =>{
	console.log('Connected!')
	client.user.setStatus('online');
	client.user.setActivity('sumthin on me telly bout monkeys', {type: 'STREAMING', url: 'https://www.youtube.com/watch?v=LRZm9uLRiuE'});
	clearQueueMsg(); //clear current queue message (will repopulate)
	ClearDatabase(); //clear current auction message and start listener
})

client.on('error', console.log)
client.login(auth.token)

/////////////////
//  CONSTANTS  //
/////////////////
// ADD ABILITY TO REPLY TO GET A DESCRIPTION FIELD

var timeouts = [];
const gatewayipfs = 'https://gateway.pinata.cloud';
const loopringipfs = 'https://loopring.mypinata.cloud';
const queuelimit = 90;

const bitcorn = '416645304830394368';			// bitcorn user id
const alig = '974143111418765313';				// aliG user id
const server = '962059766388101301';			// server id
const auctionchannel = '974014169483452436';	// auction channel
const auctiontest = '976917431471710289';		// auction test channel
const queuechannel = '978340918061039656';		// queue channel
const databasechannel = '975829186063237140'; 	// database channel
const logchannel = '981929697791340564';		// error log channel
const pauseuntil = moment(1654185600000);		// pause nextauction until input time


//ROLES
const puzzlegang = '970758538681012315';		// puzzlegang role
const kernalcommander = '970723355097444482';	// kernalcommander role
const wingman = '970760443113111582';			// wingman role

/*initial thoughts on role limitations
Ali A - 3 auctions postings per day, 5 min max duration (max scheduling out 4 hours)
Ali B - 5 auctions postings per day, 5 min max duration (max scheduling out 8 hours)
Ali C - 7 auctions postings per day, 5 min max duration (max scheduling out 24 hours)
Ali D - 10 auctions postings per day, 5 min max duration (max scheduling out 48 hours) 
Ali E - special *E*vent limited access auctions (bidder special role only)
Ali F - Creators (no limitations on number of auctions or delay, duration max = 15 min)
*/
const aliA = '980663524361658488';				// auction role
const aliB = '980661146887536700';				// auction role
const aliC = '980663646453649468';				// auction role
const aliD = '980663669476196392';				// auction role
const aliE = '979840380851879996';				// for special Events
const aliF = '976887843915964447';				// creators auction role

const databasemsg = '975836495606849686'; 		// database message
const prizemsg = '977234646578376724'; 			// prize message
const queuemsg = '978341660507389952';			// queue message
const limitmsg = '980668627030278194';			// limit message for monitoring post amounts

const livecolor = '#00ab66';					// embed color when live
const endcolor = '#cf142b';						// embed color when auction ends
const infocolor = '#FAFA33';					// embed color when under maintenance or a help message
const isLive = true;							// true = live; false = maintenance
const isSpecialEvent = false;					// special event trigger
const dmAlertTime = 15;							// number of minutes before auction to start trying to send alerts 

const sleep = (delay) => new Promise((resolve) => timeouts.push(setTimeout(resolve,delay)));


// bot avatar
const botimg = 'https://cdn.discordapp.com/attachments/962059766937567254/974343468350603274/aliG_1.png';

// bot starting soon image
const soonImg = 'https://cdn.discordapp.com/attachments/962059766937567254/981263865570529350/SOON.gif';

// bot start messages
const auction_start=[
"BooyaKORNsha, check it! Wheeze be bittin on dis fine azz BLT. Itz prolly got sum mayo up in dat lettuce an doncha fagetta bout dat wicked bakon! Lez see sum !bits boys and misses!",
"Check dis out... Me Julie say we takin bits on this dope azz shit. Can ya belief dat?!? It iz straight fire. Y'all best lay some !bits reel quick befor I snap dis up! Respek!",
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

const monthAbbrev = {"Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12}

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
global.kill = false;				// KILL 2.0


/////////////////
// DATE FORMAT //
/////////////////

var token = /d{1,4}|D{3,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|W{1,2}|[LlopSZN]|"[^"]*"|'[^']*'/g;
var timezone = /\b(?:[A-Z]{1,3}[A-Z][TC])(?:[-+]\d{4})?|((?:Australian )?(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time)\b/g;
var timezoneClip = /[^-+\dA-Z]/g;
function dateFormat(date, mask, utc, gmt) {
    if (arguments.length === 1 && typeof date === "string" && !/\d/.test(date)) {
        mask = date;
        date = undefined
    }
    date = date || date === 0 ? date : new Date;
    if (!(date instanceof Date)) {
        date = new Date(date)
    }
    if (isNaN(date)) {
        throw TypeError("Invalid date")
    }
    mask = String(masks[mask] || mask || masks["default"]);
    var maskSlice = mask.slice(0, 4);
    if (maskSlice === "UTC:" || maskSlice === "GMT:") {
        mask = mask.slice(4);
        utc = true;
        if (maskSlice === "GMT:") {
            gmt = true
        }
    }
    var _ = function _() {
        return utc ? "getUTC" : "get"
    };
    var _d = function d() {
        return date[_() + "Date"]()
    };
    var D = function D() {
        return date[_() + "Day"]()
    };
    var _m = function m() {
        return date[_() + "Month"]()
    };
    var y = function y() {
        return date[_() + "FullYear"]()
    };
    var _H = function H() {
        return date[_() + "Hours"]()
    };
    var _M = function M() {
        return date[_() + "Minutes"]()
    };
    var _s = function s() {
        return date[_() + "Seconds"]()
    };
    var _L = function L() {
        return date[_() + "Milliseconds"]()
    };
    var _o = function o() {
        return utc ? 0 : date.getTimezoneOffset()
    };
    var _W = function W() {
        return getWeek(date)
    };
    var _N = function N() {
        return getDayOfWeek(date)
    };
    var flags = {
        d: function d() {
            return _d()
        },
        dd: function dd() {
            return pad(_d())
        },
        ddd: function ddd() {
            return i18n.dayNames[D()]
        },
        DDD: function DDD() {
            return getDayName({
                y: y(),
                m: _m(),
                d: _d(),
                _: _(),
                dayName: i18n.dayNames[D()],
                short: true
            })
        },
        dddd: function dddd() {
            return i18n.dayNames[D() + 7]
        },
        DDDD: function DDDD() {
            return getDayName({
                y: y(),
                m: _m(),
                d: _d(),
                _: _(),
                dayName: i18n.dayNames[D() + 7]
            })
        },
        m: function m() {
            return _m() + 1
        },
        mm: function mm() {
            return pad(_m() + 1)
        },
        mmm: function mmm() {
            return i18n.monthNames[_m()]
        },
        mmmm: function mmmm() {
            return i18n.monthNames[_m() + 12]
        },
        yy: function yy() {
            return String(y()).slice(2)
        },
        yyyy: function yyyy() {
            return pad(y(), 4)
        },
        h: function h() {
            return _H() % 12 || 12
        },
        hh: function hh() {
            return pad(_H() % 12 || 12)
        },
        H: function H() {
            return _H()
        },
        HH: function HH() {
            return pad(_H())
        },
        M: function M() {
            return _M()
        },
        MM: function MM() {
            return pad(_M())
        },
        s: function s() {
            return _s()
        },
        ss: function ss() {
            return pad(_s())
        },
        l: function l() {
            return pad(_L(), 3)
        },
        L: function L() {
            return pad(Math.floor(_L() / 10))
        },
        t: function t() {
            return _H() < 12 ? i18n.timeNames[0] : i18n.timeNames[1]
        },
        tt: function tt() {
            return _H() < 12 ? i18n.timeNames[2] : i18n.timeNames[3]
        },
        T: function T() {
            return _H() < 12 ? i18n.timeNames[4] : i18n.timeNames[5]
        },
        TT: function TT() {
            return _H() < 12 ? i18n.timeNames[6] : i18n.timeNames[7]
        },
        Z: function Z() {
            return gmt ? "GMT" : utc ? "UTC" : formatTimezone(date)
        },
        o: function o() {
            return (_o() > 0 ? "-" : "+") + pad(Math.floor(Math.abs(_o()) / 60) * 100 + Math.abs(_o()) % 60, 4)
        },
        p: function p() {
            return (_o() > 0 ? "-" : "+") + pad(Math.floor(Math.abs(_o()) / 60), 2) + ":" + pad(Math.floor(Math.abs(_o()) % 60), 2)
        },
        S: function S() {
            return ["th", "st", "nd", "rd"][_d() % 10 > 3 ? 0 : (_d() % 100 - _d() % 10 != 10) * _d() % 10]
        },
        W: function W() {
            return _W()
        },
        WW: function WW() {
            return pad(_W())
        },
        N: function N() {
            return _N()
        }
    };
    return mask.replace(token, function(match) {
        if (match in flags) {
            return flags[match]()
        }
        return match.slice(1, match.length - 1)
    })
}
var masks = {
    default: "ddd mmm dd yyyy HH:MM:ss",
    shortDate: "m/d/yy",
    paddedShortDate: "mm/dd/yyyy",
    mediumDate: "mmm d, yyyy",
    longDate: "mmmm d, yyyy",
    fullDate: "dddd, mmmm d, yyyy",
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:sso",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
    expiresHeaderFormat: "ddd, dd mmm yyyy HH:MM:ss Z"
};
var i18n = {
    dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    timeNames: ["a", "p", "am", "pm", "A", "P", "AM", "PM"]
};
var pad = function pad(val) {
    var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
    return String(val).padStart(len, "0")
};
var getDayName = function getDayName(_ref) {
    var y = _ref.y,
        m = _ref.m,
        d = _ref.d,
        _ = _ref._,
        dayName = _ref.dayName,
        _ref$short = _ref["short"],
        _short = _ref$short === void 0 ? false : _ref$short;
    var today = new Date;
    var yesterday = new Date;
    yesterday.setDate(yesterday[_ + "Date"]() - 1);
    var tomorrow = new Date;
    tomorrow.setDate(tomorrow[_ + "Date"]() + 1);
    var today_d = function today_d() {
        return today[_ + "Date"]()
    };
    var today_m = function today_m() {
        return today[_ + "Month"]()
    };
    var today_y = function today_y() {
        return today[_ + "FullYear"]()
    };
    var yesterday_d = function yesterday_d() {
        return yesterday[_ + "Date"]()
    };
    var yesterday_m = function yesterday_m() {
        return yesterday[_ + "Month"]()
    };
    var yesterday_y = function yesterday_y() {
        return yesterday[_ + "FullYear"]()
    };
    var tomorrow_d = function tomorrow_d() {
        return tomorrow[_ + "Date"]()
    };
    var tomorrow_m = function tomorrow_m() {
        return tomorrow[_ + "Month"]()
    };
    var tomorrow_y = function tomorrow_y() {
        return tomorrow[_ + "FullYear"]()
    };
    if (today_y() === y && today_m() === m && today_d() === d) {
        return _short ? "Tdy" : "Today"
    } else if (yesterday_y() === y && yesterday_m() === m && yesterday_d() === d) {
        return _short ? "Ysd" : "Yesterday"
    } else if (tomorrow_y() === y && tomorrow_m() === m && tomorrow_d() === d) {
        return _short ? "Tmw" : "Tomorrow"
    }
    return dayName
};
var formatTimezone = function formatTimezone(date) {
    return (String(date).match(timezone) || [""]).pop().replace(timezoneClip, "").replace(/GMT\+0000/g, "UTC")
};

/////////////////
//  FUNCTIONS  //
/////////////////

// scrape the nft link site to return title and image
async function scrape(nfturl, imgattached = false){
	console.log('New Queue Item added');
	const browser = await puppeteer.launch({});
	const page = await browser.newPage();
	console.log(nfturl);
	await page.goto(nfturl);
	var IMAGE_SELECTOR;
	var TITLE_SELECTOR;
	var getTitle;
	var imageTitle;
	var hasPlaceholder;
	var placeholder;
	var gotimage = imgattached
	
	if(nfturl.includes('explorer.loopring.io')){
		//console.log('explorer.loopring.io');
		IMAGE_SELECTOR = '#__next > main > div > div.pt-12 > div > div > img';
		TITLE_SELECTOR = IMAGE_SELECTOR;
		placeholder = 'nft-placeholder.svg';
		hasPlaceholder = true;
	}else if(nfturl.includes('lexplorer.io')){
		//console.log('lexplorer.io');
		IMAGE_SELECTOR = '.nft'; //'body > div.mud-layout.mud-drawer-open-responsive-lg-left.mud-drawer-left-clipped-docked > div > div > div.mud-table.mud-simple-table.mud-table-dense.mud-table-bordered.mud-table-striped.mud-elevation-1 > div > table > tbody > tr:nth-child(10) > td > img';
		TITLE_SELECTOR = 'tr:nth-child(1) > td > div > h6'; //"[class='mud-typography mud-typography-h6 mud-inherit-text']";
		hasPlaceholder = false;
	}else{
		return 'only set up for explorer.loopring.io and lexplorer.io';
	}
   
	if(hasPlaceholder){getTitle = false;
	}else{getTitle = true;}

	//allow a max of 5 checks
	var imgcheckcount = 0;
	while(gotimage == false && imgcheckcount < 6){
		imgcheckcount++;
		console.log('Finding Image...');
		await page.waitForTimeout(3000);
		console.log('waited for time out');
		var imageHref = await page.evaluate((sel) => {
			console.log('returning');
			var scrapedurl = document.querySelector(sel).getAttribute('src');
			if(!(scrapedurl.includes(' '))){
				scrapedurl = encodeURI(scrapedurl);
				console.log('had to invoke encodeURI');
			}
			return scrapedurl;
		}, IMAGE_SELECTOR);
console.log('hasPlaceholder: ' + hasPlaceholder);
		if(hasPlaceholder){
			if(!(imageHref.includes(placeholder))){getTitle = true;}
		}else{getTitle = true;}

		if(getTitle){
			console.log('Getting Title...');
			gotimage = true;
			if(nfturl.includes('explorer.loopring.io')){
				imageTitle = await page.evaluate((sel) => {return document.querySelector(sel).getAttribute('alt');}, TITLE_SELECTOR);
			}else{
				imageTitle = await page.$eval(TITLE_SELECTOR, el => el.textContent);   //uate((sel) => {return document.querySelector(sel).getProperty('textContent');}, TITLE_SELECTOR)).jsonValue();
			}
		} else{
			await page.waitForTimeout(1000);
		}
	}
	browser.close();
	if(gotimage == true){
		imageHref = imageHref.replace(gatewayipfs,loopringipfs);
		return imageTitle + ',' + imageHref;
	}else{
		return 'SCRAPEFAIL';
	}
}

async function limitCheck(message, qduration, qdelay){
	//used to check number of auction postings in 24 hr period

	var dbchannel = await client.channels.cache.get(databasechannel);
	var dbmsg = await dbchannel.messages.fetch(limitmsg);
	let lmsg = dbmsg.content;
/*
change to this when we get more busy
	var limitCount = 3;		// default to Ali A role (max 3 auctions per day)
	var maxduration = 5;	// default to Ali A role (5 min max duration)
	var maxdelay = 4;		// default to Ali A role (max scheduling out 4 hours) 
*/

//temporary default to promote usage
	var limitCount = 10;	// default to Ali D role (max 7 auctions per day)
	var maxduration = 5;	// default to Ali D role (5 min max duration)
	var maxdelay = 24;		// default to Ali D role (max scheduling out 24 hours) 
	
	//find user's auction limit (uncomment B and C when we get more busy)
	//if(message.member.roles.cache.has(aliB)){limitCount = 5;maxdelay = 8;}
	//if(message.member.roles.cache.has(aliC)){limitCount = 7;maxdelay = 24;}
	if(message.member.roles.cache.has(aliD)){limitCount = 10;maxdelay = 24;} //consider making this 48 hrs later
	//Ali E for special events only
	if(message.member.roles.cache.has(aliF)){limitCount = 741;maxduration = 5;maxdelay = 24;} //consider making this 48 hrs later and max duration = 15	

//check auction limit first
	if(lmsg.includes(message.author.id)){
		let lmsgArray = new Array();
		lmsgArray = lmsg.split(message.author.id);
		var currNum;
		var startofstr = '';
		if(lmsgArray[0].includes(',')){
			currNum = lmsgArray[0].slice(lmsgArray[0].lastIndexOf(','),-1);
			startofstr = lmsgArray[0].slice(0,-(text.length-lmsgArray[0].lastIndexOf(',')));
		}else{
			currNum = parseInt(lmsgArray[0].slice(0,-1));
			//console.log('currNum:' + currNum );
		}
		if(currNum + 1 > limitCount){
			return '[LIMIT REACHED] 24 hour auction limit: ' + limitCount;
		}else{
			currNum = +currNum + 1;
			if(startofstr == ''){
				lmsg = currNum + ':' + message.author.id + lmsgArray[1];
			}else{
				lmsg = startofstr + ',' + currNum + ':' + message.author.id + lmsgArray[1];
			}
			console.log(lmsg);
		}
	}else{
		if(lmsg = 'LIMIT RESET'){
			lmsg = '1:' + message.author.id; 
		}else{
			lmsg = lmsg + ',1:' + message.author.id;
		}
	}

//!queue <nftlink>, <duration>, <reserve>, <delay>
//check maxduration
	var days = qduration.split('d')[0];
	var inputduration = qduration.split('d')[1];
	var hours = inputduration.split('h')[0];
	var minutes = inputduration.split('h')[1].replace('m','').replace(/\s+/g,'');
	if((+days > 0) || (+hours  > 0) || (+minutes > +maxduration)){
		await message.reply('duration set to your max: ' + maxduration + 'm');
		console.log('user tried to run an auction with a duration of: ' + qduration + '(max = ' + maxduration + ')');
		qduration = '0d 0h ' + maxduration + 'm';
	}

//check maxdelay
if(!(qdelay == 'N/A')){
		if(qdelay > maxdelay){
			await message.reply('schedule exceeded limits, set delay to #hrs: ' + maxdelay);
			console.log('user tried to schedule an auction in #hrs = ' + qdelay);
			qdelay = maxdelay;
		}
}

var inputs = qduration + ',' + qdelay;
dbchannel = await client.channels.cache.get(databasechannel);
dbmsg = await dbchannel.messages.fetch(limitmsg);
await dbmsg.edit(lmsg);
return inputs;

}


//add item to queue
async function queueAdd(message){
// adding in attachment check

	try{
		var msg = message.content.toLowerCase();
		var dbchannel = await client.channels.cache.get(databasechannel);
		var dbmsg = await dbchannel.messages.fetch(queuemsg);
		let qmsg = dbmsg.content;
		if(qmsg.split(',').length > queuelimit){
			message.reply('Sorry man, me be cappt at 90 itemz in da Q... Upgraydz cumming soon!!');
			throw 'avoid 2000 character limit overrun, refuse queue item';
		}
		var inputs;
		if(msg.includes('!queue')){
			inputs = msg.replace('!queue','').replace(/\s+/g,'');
		}else{
			inputs = msg.replace('!auction','').replace(/\s+/g,'');
		}
		let arr = new Array();
		arr = inputs.split(',');
		
		if (!(isValidURL(arr[0]))){
			message.reply('Sorry man, dat link u iz wack! Gotta giv it to me wif the http');
			throw 'Parameter is not a valid url!';
		}
		
		var details = await scrape(arr[0]);
		if(details == 'SCRAPEFAIL'){
			message.reply('Sumthin be wack... Verify dem inputs and commas... if dat checks, maybe attach dat image.');
			throw details;
		}
		if(details == 'only set up for explorer.loopring.io and lexplorer.io'){
			message.replay(details);
			throw details;
		}
		var qTitle = details.split(',')[0];

		if(message.type === 'REPLY'){
			await message.fetchReference().then(repliedTo =>{
					if(repliedTo.attachments.size > 0){
						qImg = repliedTo.attachments.first().url;	
						//console.log(qImg + " from reply attachment");	//if image is in replied message (convert to being in same message)
					}else{
						qImg = details.split(',')[1];
						//console.log(qImg + " from scrape");
					}
				}).catch (err =>{
					console.log(err);
					//await client.channels.cache.get(logchannel).send(err).catch(/*Your Error handling if the Message isn't returned, sent, etc.*/);;
					qImg = details.split(',')[1];
				});
			}else{
				if(message.attachments.size >0){
					qImg = message.attachments.first().url;
					//console.log(qImg + " from attachment");
				} else{
					qImg = details.split(',')[1];
					//console.log(qImg + " from scrape");
				}
			}
			if(qImg.includes(' ')){
				qImg = encodeURI(qImg);
				console.log('had to invoke that encodeURI function.');
			}

		var qduration = setLength(arr[1]);
		var qreserve = '0';
		if (!(typeof arr[2] === 'undefined')){qreserve = arr[2];}
		var qdelay = 'N/A';
		if (!(typeof arr[3] === 'undefined')){qdelay = arr[3];}
		if(!(message.author.id == bitcorn)){
		var limiters = await limitCheck(message, qduration, qdelay);
		if(limiters.includes('[LIMIT REACHED]')){
			message.reply(limiters);
			throw limiters;
		}
			console.log(limiters);
			//console.log(qduration + ' vs. limit: ' + limiters.split(',')[0]);
			qduration = limiters.split(',')[0];
			//console.log(qdelay + ' vs. limit: ' + limiters.split(',')[1]);
			qdelay = limiters.split(',')[1];
		}

		if(!(qdelay == 'N/A')){
			var date = new Date();
			date = date.getTime() + (qdelay*60*60*1000);
			qdelay = dateFormat(date, "UTC:mmm d h:MM TT Z"); 
		}



			let qEmbed = new MessageEmbed()
				.setColor(infocolor)
				.setTitle(qTitle)
				.setURL(arr[0])
				.setImage(qImg)
				.addFields(
					{ name: 'SELLER', value: '<@'+message.author+'>'},
					{ name: 'DURATION: ' + qduration, value: 'RESERVE: ' + qreserve +' LRC', inline: true},
					//{ name: 'RESERVE', value: qreserve, inline: true},
					//{ name: 'NOT BEFORE', value: qdelay, inline: true}
				)
			if(!(qdelay == 'N/A')){
				qEmbed.setTimestamp(date);
				qEmbed.setFooter({text: '✅ to subscribe to auction alert (BUYERS)\n❌ to remove from the queue (SELLER/ADMIN)\nSCHEDULED AUCTION '});
			}else{
				qEmbed.setFooter({text: '✅ to subscribe to auction alert (BUYERS)\n❌ to remove from the queue (SELLER/ADMIN)'});
			}
				
			let queueEmbed = await client.channels.cache.get(queuechannel).send({ embeds: [qEmbed] });
			await queueEmbed.react('✅');
			await queueEmbed.react('❌');			

			if(qmsg == 'NO QUEUE'){
				qmsg = queueEmbed.id;
			}else{
				qmsg = qmsg + ',' + queueEmbed.id;
				qmsg = qmsg.replace(',,',',').replace(/\s+/g,'');
			}

			await dbmsg.edit(qmsg);
			return true;
			
		} catch(err){
			await message.react('❌');
			console.log(err);
			//await client.channels.cache.get(logchannel).send(err).catch(/*Your Error handling if the Message isn't returned, sent, etc.*/);;
			return false;
		}
}


// clear current auction message in database 
async function ClearDatabase(){
		let dbchannel = await client.channels.cache.get(databasechannel);
		let dbmsg = await dbchannel.messages.fetch(databasemsg);
		await dbmsg.edit('NO CURRENT AUCTION');
		await client.channels.cache.get(queuechannel).send('Iz awkshun time!').catch(/*Your Error handling if the Message isn't returned, sent, etc.*/);
	}

async function clearLimitMsg(){
		let dbchannel = await client.channels.cache.get(databasechannel);
		let dbmsg = await dbchannel.messages.fetch(limitmsg);
		await dbmsg.edit('LIMIT RESET');
}

async function clearQueueMsg(){
	let dbchannel = await client.channels.cache.get(databasechannel);
	let dbmsg = await dbchannel.messages.fetch(queuemsg);
	await dbmsg.edit('NO QUEUE');
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

async function fetchMore(channel, limit = 250) {
    //console.log(channel);
    if (!channel) {
        throw new Error(`Expected channel, got ${typeof channel}.`);
    }
    /* if (limit <= 100) {
        return channel.messages.fetch({ limit });
    } */

    let collection = new Collection();
    let lastId = null;
    let options = {};
    let remaining = limit;

    while (remaining > 0) {
        options.limit = remaining > 100 ? 100 : remaining;
        remaining = remaining > 100 ? remaining - 100 : 0;

        if (lastId) {
            options.before = lastId;
        }

        let messages = await channel.messages.fetch(options);
        if (!messages.last()) {
            break;
        }

        collection = collection.concat(messages);
        lastId = messages.last().id;
    }

    return collection.reverse();
}



async function queuemsgcheck(){
	console.log('Performing Queue Message Validation Check');
	//load up queue db msg
	var qupdated = false;
	var dbchannel = await client.channels.cache.get(databasechannel);
	var dbmsg = await dbchannel.messages.fetch(queuemsg);
	var qmsg = dbmsg.content;
	var qopposite = '';
	
	if(!(qmsg == 'NO QUEUE')){
		qopposite = qmsg.replace('dm','');
	}

	//load up queue channel
	var qchannel = await client.channels.cache.get(queuechannel);
	//queueitem = await qchannel.messages.fetch({limit: 100});
	
	const allFindNexts = [];
	//process all fetched messages

	try {
		const myChan = await client.channels.fetch(queuechannel);
		var list = new Collection();
		list = await fetchMore(myChan, 120);
		//const table_authors = list.map((msg) => msg.author.username);
		//const table_messages = list.map((msg) => msg.content);
	
		//for (let i = 0; i < list.size; i++) {
		   // How to get things from : 
		   // reactions: ReactionManager { message: [Circular *1] }
	
	}catch (err) {
		console.log(err);
	}

	list.forEach(async (msg) => {
		console.log(msg.id);

		//check time posted + delay and order by that
		//compute anticipated time before auction
		//send DMs when it's within the true 15 min zone

			// if qmsg isn't NO QUEUE, remove any found message ids while processing
			// this will result in helping find any ids that are in qmsg that don't exist
			if(!(qmsg == 'NO QUEUE')){
				//find any message id's that are in qmsg, but shouldn't be
				if(qopposite.includes(msg.id)){
					qopposite = qopposite.replace('dm'+msg.id,'').replace(msg.id,'').replace(',,',',');
					qopposite = qopposite.replace(',,',',');
					if(qopposite.charAt(0) == ','){qopposite.slice(1)}
					if(qopposite.charAt(qopposite.length) == ','){qopposite.slice(0,-1)}
					var endsWithNum = false;
					do{
						endsWithNum = isNaN(qopposite.slice(-1)) ? false : true;
						if(!(endsWithNum)){
							qopposite = qopposite.slice(0,-1);
						}
					}while(!(endsWithNum) && (qopposite.length > 0))
				}
			}

			//find any message id's that are NOT in qmsg, but should be (add missing ones to qmsg)
			//console.log('processing message: ' + msg.id);
			if(!(qmsg.includes(msg.id))){
				// if it finds a msg.id not in qmsg, check if it has an embed.
				try{
					if(msg.embeds.length > 0){
					//console.log('qmsg content before: ' + qmsg);
					if(qmsg == 'NO QUEUE'){
						qmsg = msg.id;
					}else{
						qmsg = qmsg + ',' + msg.id;
					}
					//console.log('qmsg content after: ' + qmsg);
					qupdated = true;
				}else{
					console.log('message found in queue channel without embed.');
				};
			}catch{
				console.log(msg.id);
			}
			}
		});

	  // once all messages are processed, check if qmsg contains any that weren't found... if so, remove them
	if(qopposite.length > 0){
		console.log('qmsg contains message id not in queue channel, removing the following: ' + qopposite);
		var qoppArray = new Array();
		qoppArray = qopposite.split(',');
		for(const msgnum of qoppArray){
			qmsg = await qmsg.replace('dm'+msgnum,'').replace(msgnum,'').replace(',,',',');
		}
		if(qmsg.charAt(0) == ','){qmsg = qmsg.slice(1)}
		if(qmsg.charAt(qmsg.length) == ','){qmsg = qmsg.slice(0,-1)}
		qupdated = true;
	}

	//if qmsg needs updated, update message
	  if(qupdated){
		  if(+qmsg.length < 1){qmsg = 'NO QUEUE';}
		  console.log('Updating Queue Message to: ' + qmsg);
		  await dbmsg.edit(qmsg);
	  }

	  console.log('Processing Auction Alerts');
	  dbchannel = await client.channels.cache.get(databasechannel);
	  dbmsg = await dbchannel.messages.fetch(queuemsg);
	  qmsg = dbmsg.content;
	  await findNext(qmsg);

}

//no longer used
function processDateFormat(str){
	let monthlookup = str.split(' ')[0].replace(/\s+/g, '');
	let month = monthAbbrev[monthlookup] ? monthAbbrev[monthlookup] : monthlookup;
	month = month -1; //adjustment for moment.js
	let day = str.split(' ')[1].replace(/\s+/g, '');
	let time = str.split(' ')[2];
	let hours = parseInt(time.split(':')[0]);
	if(str.split(' ')[3].includes('PM')){ hours = hours + 12;}
	let minutes = time.split(':')[1];
	return month + ',' + day + ',' + hours + ',' + minutes;
}


// asyncSome function for processing arrays with async
const asyncSome = async (arr, predicate) => {
	for (let e of arr) {
		if (await predicate(e)) return true;
	}
	return false;
};


async function findNext(qmsg){
	//console.log('finding on deck: ' + qmsg);
	var qentries = new Array();
		if(qmsg == 'NO QUEUE'){return qmsg;}
		qmsg = qmsg.replace(/\s+/g, '');

		if(qmsg.includes(',')){
			qentries = qmsg.split(',');
		}else{
			qentries[0] = qmsg;
		}

	var qembed;
	var queueitem;
	var iSchedule = new Array();
	var firstItem = true;
	var iMin = 0;
	let now = moment();
	var minTime = moment();

	await asyncSome(qentries, async (i) => {
		
		var qchannel = await client.channels.cache.get(queuechannel);
		try{

			if(!(i.includes('dm'))){ //check if message has already had alert
				queueitem = await qchannel.messages.fetch(i+'');
				qembed = await queueitem.embeds[0];
		
				if(qembed.timestamp == null){
					minTime = now;
					if(firstItem){
						iMin = 0;
						firstItem=false;
					}else{
						iMin++;
					}
					iSchedule.push(i);
				}else{
					var embedTime = moment(qembed.timestamp);
					if(firstItem){
						minTime = embedTime;
						iMin = 0; //set min next auction as the first entry in the array.
						iSchedule.push(i);
	
						//console.log('current min time:' + minTime);
						firstItem = false;
					}else{
						if(embedTime.isBefore(minTime)){
							minTime = moment(qembed.timestamp);
							iMin++;
							iSchedule.push(i);
							//console.log('current min time:' + minTime);
							//console.log('time diff between now and next item in queue: ' + now.diff(qembed.timestamp));
						}
					}
				}
			}else{
				console.log('alert already sent for message id: ' + i);				
			}
		}catch(err){
			console.log('had error: ' + err);
			//await client.channels.cache.get(logchannel).send(err).catch(/*Your Error handling if the Message isn't returned, sent, etc.*/);;
		}
	});

	//insert alert function... 
	//if time is null or within the specific dmAlertTime variable (in minutes), send alert to seller and those who have tagged with ✅
	var dmcheck = iSchedule[iMin];
	//console.log(dmcheck);
	if(!(dmcheck == undefined)){
		if(!(dmcheck.includes('dm'))){
			//console.log('alert time check for: ' + dmcheck);
			if(minTime.diff(now,"seconds") < dmAlertTime*60 ){
				await dmAuctionAlerts(dmcheck);
			}
		}
	}
}

async function dmAuctionAlerts(alertMsg) {
	console.log('Sending DM alerts for: ' + alertMsg);
	var qchannel = await client.channels.cache.get(queuechannel);
	var amsg = await qchannel.messages.fetch(alertMsg);
	var reaction = await amsg.reactions.cache.get('✅');
	var users = await reaction.users.fetch();
	var sellerEmoji = await amsg.reactions.cache.get('976603681850003486');
	var sellerDMd = false;
	
	var aEmbed = await amsg.embeds[0];
	await aEmbed.setThumbnail(soonImg);
	var qseller = aEmbed.fields[0].value;
	qseller = qseller.replace('<@','').replace('>','');
	const seller = await client.users.fetch(qseller).catch(console.error);

	//check to see if it has booyakasha from ali-g already, if so, don't send to seller again.
	if(!(sellerEmoji == undefined)){
		var sellerCheck = await sellerEmoji.users.fetch();
		if(!(sellerCheck.has(alig))){
			await seller.send({ embeds: [aEmbed] }).catch(() => {
				console.log("Unable to alert seller: " + seller.id);
			});
			await seller.send('Yo, my main man! Yer awkshun iz startin SOON! Lez sling dis dope shit!\n> <https://discord.com/channels/962059766388101301/974014169483452436>').catch(() => {});
			await amsg.react('976603681850003486');	
		}
	}else{
		await seller.send({ embeds: [aEmbed] }).catch(() => {
			console.log("Unable to alert seller: " + seller.id);
		});
		await amsg.react('976603681850003486');	
		await seller.send('Yo, my main man! Yer awkshun iz startin SOON! Lez sling dis dope shit!\n> <https://discord.com/channels/962059766388101301/974014169483452436>').catch(() => {});
	}

	if(reaction.count > 1){
	users.each(async(user) =>{
		if(!(user.id == alig)){
			await user.send({ embeds: [aEmbed] }).catch(() => {
					console.log("User has DMs closed or no mutual servers: " + user.id);
				});
				await user.send('👆👆 STARTING SOON, YO!!! 🔥🔥🔥\n> <https://discord.com/channels/962059766388101301/974014169483452436>').catch(() => {});
				await reaction.users.remove(user);
				console.log('DM sent to: ' + user.id);
			}	
	});
	var dbchannel = await client.channels.cache.get(databasechannel);
	var dbmsg = await dbchannel.messages.fetch(queuemsg);
	var qmsg = dbmsg.content;
	console.log(alertMsg);
	qmsg = await qmsg.replace(alertMsg,'dm' + alertMsg);
	await dbmsg.edit(qmsg);
}
	


}



// grab details for next auction
async function getNextAuction() { 
	var dbchannel = await client.channels.cache.get(databasechannel);
	do{
		//validate queue message entries and update if needed
		await queuemsgcheck();

		var dbmsg = await dbchannel.messages.fetch(queuemsg);
		var qmsg = dbmsg.content;
		var qentries = new Array();
		
		if(qmsg == 'NO QUEUE'){return qmsg;}
		qmsg = qmsg.replace(/\s+/g, '');

		if(qmsg.includes(',')){
			qentries = qmsg.replace('dm','').split(',');
		}else{
			qentries[0] = qmsg.replace('dm','');
		}
		var qembed;
		var itemselected = 'N/A';
		var queueitem;

		await asyncSome(qentries, async (i) => {
			var qchannel = await client.channels.cache.get(queuechannel);
			
			try{
				//console.log('fetching msg: ' + i);
				queueitem = await qchannel.messages.fetch(i.replace('dm',''));
				qembed = await queueitem.embeds[0];

				if(qembed.timestamp == null){
					itemselected = i;
					return true;}
				let now = moment();

				if(now.isSameOrAfter(qembed.timestamp)){
					itemselected = i;
					return true;
				}; 
			}catch(err){
				console.log('had error: ' + err);
				//await client.channels.cache.get(logchannel).send(err).catch(/*Your Error handling if the Message isn't returned, sent, etc.*/);;
				try{
					queueitem = await qchannel.messages.fetch(i.replace('dm',''));
				}catch{
					console.log('removing item: ' + i);
					console.log('qmsg: ' + qmsg)
					qmsg = qmsg.replace(/\s+/g, '');
					var endsWithNum = false;
					do{
						endsWithNum = isNaN(qmsg.slice(-1)) ? false : true;
						if(!(endsWithNum)){
							qmsg = qmsg.slice(0,-1);
							console.log('trimmed last character from qmsg: ' + qmsg);
						}
					}while(endsWithNum)

					if(qmsg == i || qmsg == 'dm'+i){
						console.log('qmsg removing via method 1');
						qmsg = 'NO QUEUE';
						await dbmsg.edit(qmsg);
					}else{
						console.log('qmsg removing via method 2');
						qmsg = qmsg.replace('dm'+i,'').replace(i,'').replace(',,',',').replace(', ','');
						if(qmsg.charAt(0) == ','){qmsg = qmsg.slice(1);}
						if(qmsg.charAt(qmsg.length) == ' '){
							qmsg = qmsg.slice(0,-1);
						}
						if(qmsg.charAt(qmsg.length) == ','){
							qmsg = qmsg.slice(0,-1);
						}
						await dbmsg.edit(qmsg);
					}
				}				
			}
		});

		if(itemselected == 'N/A'){
			var daybefore = moment.utc().dayOfYear();
			await sleep(15000); //wait 15 seconds 
			var dayafter = moment.utc().dayOfYear();
			if(!(daybefore == dayafter)){
				clearLimitMsg();
				console.log('NEW DAY: Limits Reset!');
			}
			console.log('Listening for new queue items...');
		}

	}while(itemselected == 'N/A');

if(qmsg == 'NO QUEUE'){ return qmsg;}

	if(qmsg == itemselected){
		qmsg = 'NO QUEUE';
	}{
		qmsg = qmsg.replace(',dm'+itemselected,'').replace(','+itemselected,'').replace('dm' + itemselected,'').replace(itemselected,'').replace(',,',',');
		if(qmsg.charAt(0) == ','){
			qmsg = qmsg.slice(1);
		}
	}

	
	
	let qseller = await qembed.fields[0].value;
	let qduration = await qembed.fields[1].name.replace('DURATION: ','');
	//console.log('qduration: '+ qduration);
	let qreserve = await qembed.fields[1].value.replace('RESERVE: ','').replace(' LRC','');
	//console.log('qreserve: '+ qreserve);
	let qurl = await qembed.url;
	let qimage = await qembed.image.url;
	let qtitle = await qembed.title;
	
	qimage = qimage.replace(gatewayipfs,loopringipfs);
	
	// add these when ready to go live //
	await dbmsg.edit(qmsg);
	await queueitem.delete();
	
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

			if(!(processtime.includes('d') || processtime.includes('h')) || processtime.includes ('m')){
				processtime= processtime + 'm';
			}

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
var nextauction;
var startup = false;
	// if the message isn't in either the auction channel, test channel, or queue channel, exit
	if(!(message.channel.id == auctionchannel) && !(message.channel.id == auctiontest) && !(message.channel.id == queuechannel)) return;

	// ALI-G STARTUP
	if(message.author == alig && message.content.includes('Iz awkshun time!')){
		console.log('Startup Message Sent');
		await message.delete();
		startup = true;
	}else{
		// check if the author is a bot and quit if so (unless in the queuechannel ==> for triggering the initial cache)	
		if(message.author.bot && !(message.channel.id == queuechannel)) return;
	}

	// set initial variables
	var msg = message.content.toLowerCase();		// message content (converted to lowercase)
	var embedColor;
	var auctiontext;

// QUICK CHECK TO ALLOW SETTING SYSTEM TO MAINTANENCE 
if(isLive){	embedColor = livecolor; auctiontext = 'AUCTION';}
else{ embedColor = infocolor; auctiontext = 'FAKE AUCTION';}

if(!startup){
	// check if member has the necessary role for using commands
	if(message.member.roles.cache.has(puzzlegang) ||  message.member.roles.cache.has(wingman) || message.member.roles.cache.has(kernalcommander) || message.member.roles.cache.has(aliF)){	
		if(msg.includes('!count')){
			var dbchannel = await client.channels.cache.get(databasechannel);
			var dbmsg = await dbchannel.messages.fetch(queuemsg);
			let qmsg = dbmsg.content;
			message.reply('Current items in queue: ' + qmsg.split(',').length);
			
			/* let qchan = await client.channels.cache.get(queuechannel); 
			let check = await qchan.messages.fetch('981801275811303424');
			let checkEmbed = await check.embeds[0];
			let checkimg = checkEmbed.image.url;
			console.log(checkimg);
			checkimg = checkimg.replace(gatewayipfs, loopringipfs).replace(/\s+/g,'');
			checkEmbed.setImage(checkimg);
			check.edit(new MessageEmbed(checkEmbed));
			check.edit({embeds: [checkEmbed]}); */
		}
		
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
			/* if(msg.includes('!count')){
				var dbchannel = await client.channels.cache.get(databasechannel);
				var dbmsg = await dbchannel.messages.fetch(queuemsg);
				let qmsg = dbmsg.content;
				message.reply(pmsg.split(',').length + '/42');
			} */

			if(msg.includes('!reset')){
				await clearLimitMsg();
				await ClearDatabase();
				await clearQueueMsg();
			}

			//scrape information from website
			if(msg.includes('!scrape')){
			var details = await scrape(msg.split(' ')[1]);
			var deTitle = details.split(',')[0];
			var deImg = details.split(',')[1];
			let sEmbed = new MessageEmbed()
								.setColor(infocolor)
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
				userTodm = userTodm.replace(/\s+/g, '').replace('<@', '').replace('>','');

				const user = await client.users.fetch(userTodm).catch(() => null);
				
				if (!user) return message.channel.send("User not found :(");
				let dmcontent = "uh... hi";
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
				userToRemove = userToRemove.replace(/\s+/g, '');
				if(pmsg.includes(userToRemove)){
					pmsg = pmsg.replace(userToRemove,'');
					pmsg = pmsg.replace('\n',', ');
				}
				dbmsg.edit(pmsg);
			}
		}
	}

	if(msg == '!help'){
		var helptext = "<a:BOOYAKASHA:976603681850003486> **[Åuction ╙isting ïnteractive Gangsta]** <a:BOOYAKASHA:976603681850003486>\n> *For more information, including how to submit items for auction, see the pinned message in the auction haus channel.*\n> *<https://discord.com/channels/962059766388101301/974014169483452436/981783418117451816>*\n**BID COMMANDS** <:AWWYISS:963859479135416360>\n> `!bid`, `!bit`, and `!biddup`\n> All commands do the same thing, just different options for fun\n> Follow command with the bid amount in LRC\n> EXAMPLE: `!bid 69` would submit a bid of 69 LRC\n\n**THE QUEUE** <:NFT:964673439849922560>\n> Once an item is submitted, it goes to the auction-queue channel to await its turn.\n> If it's a scheduled auction, the time it's scheduled for is located at the bottom of the embed.\n> \n> *NEED TO REMOVE YOUR ITEM?*\n> Use the :x: emoji\n> FYI: Only admin or the actual seller can remove an item\n> \n> *WANT AN ALERT BEFORE AN AUCTION STARTS?*\n> Use the :white_check_mark:  emoji\n> FYI: Sellers automatically get a DM alert for their own auctions";

		/* let hEmbed = new MessageEmbed()
		.setColor(infocolor)
		.setTitle('[Å╙ï-G BASICS]')
		.addFields(
			{ name: '[BIDDING]', value: '!bid, !bit, or !biddup <amount> \n *all perform the same function* \n \n '},
			//{ name: '\u200B', value: '\u200B' },
			{ name: '[SUBMIT AN AUCTION]', value: '!queue **<NFT link>**, **<duration>**, <reserve>, < \n *<NFT link> is the link to the NFT on the explorer \n <duration> can be entered as HH:MM or as #d #h #m \n <items> in bold are required*'},								
			//{ name: 'OVERRIDE BID', value: 'Admin can override the current bid by using the command: \n !override <amount>, <@biddername>'},
			//{ name: 'KILL AUCTION', value: 'Admin can kill an auction by using the command: \n !auction kill \n '}
		)
		.setDescription('If you have any questions or suggestions,\n please DM @BTCornBLAIQchnz. For more information, see the pinned message in the auction haus channel.')
		.setThumbnail(botimg)
		.setFooter({text: 'Git lernt up den drop sum bits! Biddup yo self! Respek!'}) */
		try{
			//await message.author.send({ embeds: [hEmbed] });
			await message.author.send(helptext);
			await message.react('📨');
		} catch(err){
			message.reply("Yo, u iz haz dem DMs closed or sumthin. Check pinned message!");
			//message.channel.send({ embeds: [hEmbed] });
		}
	}

	if(msg.includes('!queue') || msg.includes('!auction')){
		var addedtoqueue = queueAdd(message);
		if(addedtoqueue){await message.react('976603681850003486');}
		if(!(addedtoqueue)){await message.react('❌');}
	}
} else{

	// limit these functions to approved auction roles				
	if(startup || message.member.roles.cache.has(puzzlegang) ||  message.member.roles.cache.has(wingman) || message.member.roles.cache.has(kernalcommander) || message.member.roles.cache.has(aliF)){
			if(killauction == true){
				message.reply('gimme one mo minute... i need to kill an awkshun and finnish me smoke')
				message.reply('!timer 1');
				setTimeout(() => {
					killauction = false;
					message.reply('ok, wut?');
				}, "59000");
			} else{	
				// Starting from a sent !auction message
				// set status to dnd and post initial message	

				if(!startup && client.user.presence.status == 'dnd'){
					if(dbmsg == 'NO CURRENT AUCTION'){
						client.user.setStatus('online');
						client.user.setActivity('dis blunt burn...', {type: 'WATCHING'});
						message.reply('sorry, me waz on the crapper... wut now?')
					}else{
						var addedtoqueue = await queueAdd(message);
						if(addedtoqueue){await message.react('976603681850003486');}
						if(!(addedtoqueue)){await message.reply('Yo, my main man... Added that to the queue!');}
	}} else{
		(async() => {
			do{		
					if(!startup){console.log('nextauction: ' + nextauction);}
						
					if(startup){
							console.log('Starting Auction Listener');
							startup = false
							do{
									//if(dbmsg.content == 'NO CURRENT AUCTION'){
									nextauction = await getNextAuction();
									kill = false; //reset if last auction was killed
									//if(nextauction == 'live auction'){
									//console.log('encountered live auction, aborting secondary process.');
									//break;
									//}
									//console.log(nextauction);
									//console.log('last queue ping: ' + Date.now());
									
									if(nextauction == 'NO QUEUE'){
										var daybefore = moment.utc().dayOfYear();
										await sleep(15000); //wait 15 seconds 
										var dayafter = moment.utc().dayOfYear();
										if(!(daybefore == dayafter)){
											clearLimitMsg();
											console.log('NEW DAY: Limits Reset!');
										}
									}
									//}
									//else{
									//console.log('encountered live auction, aborting secondary process.');
									//}
							}while(nextauction == 'NO QUEUE');
						}

					console.log('starting next auction');
					var dbchannel = await client.channels.cache.get(databasechannel);
					var dbmsg = await dbchannel.messages.fetch(databasemsg);
					console.log('nextauction: ' + nextauction);

							let auctionDeets = new Array();
							auctionDeets = nextauction.split(',');
							sellerid = auctionDeets[0].replace('<@','').replace('>','');		// NFT SELLER
								let user = await client.users.cache.get(sellerid);
								seller = user.username;
							duration = auctionDeets[1];		// AUCTION DURATION
								days = parseInt(duration.split('d')[0]);
								duration = duration.split('d')[1];
								hours = parseInt(duration.split('h')[0]);
								duration = duration.split('h')[1];
								minutes = parseInt(duration.split('m')[0]);
							reserve = auctionDeets[2];		// SELLER SET RESERVE
							imgurl = auctionDeets[3];		// IMG URL (STATIC => LINK TO NFT EXPLORER; ANIMATED => LINK TO DISCORD ATTACHMENT)
							console.log('imgurl: ' + imgurl);
							imgurl = imgurl.replace(/\s+/g,'');
							imgurl = imgurl.replace(gatewayipfs, loopringipfs);
							title = auctionDeets[4];		// NFT TITLE
							nfturl = auctionDeets[5];		// NFT LINK ON EXPLORER
	
							highbid = '0';					// CURRENT HIGH BID
							highbidder = "N/A";				// CURRENT HIGH BIDDER
	
							priorbid = '0';				// PREVIOUS HIGH BID
							priorbidder = "N/A";			// PREVIOUS HIGH BIDDER
	
							killauction = false;			// KILL AUCTION TRIGGER

							let descript = randommsg('start');
												
						//initial message						
							var authormsg = 'Åuction ╙isting ïnteractive Gangsta';
							let iEmbed = new MessageEmbed()
								.setColor(infocolor)
								.setTitle('['+ auctiontext + ' STARTED]')
								.setAuthor({name: authormsg})
								.setDescription(descript)
								.setThumbnail(botimg);
								//.setFooter({text: 'SELLER: ' + seller });
								let achan = await client.channels.cache.get(auctionchannel);
								let introEmbed = achan.send({ embeds: [iEmbed] });
								achan.send('Yo! <@' + sellerid + '>... u iz up!!! Lez do dis!');

							//save intro id and update embed color
							
							client.user.setStatus('dnd');
							client.user.setActivity('bids (LIVE)', {type: 'LISTENING'});
	
						//eventually want to convert this to a true time check system instead of using delays
							let auctionstart = new Date();
							var startTime = auctionstart.getTime();
							var minutesToAdd = (days * 24 * 60) + (hours * 60) + minutes;
							let auctionend = new Date(startTime + minutesToAdd*60000);
							duration = Math.ceil((auctionend - auctionstart)/1000)*1000;
							var minsleft = Math.ceil(duration/(60*1000));
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
	
							var footertxt = '[' + auctiontext + '] \n' + 'SELLER: ' + seller +'\nbid commands: !bid !bit !biddup\naliG.loopring.eth';
							var authormsg = 'NO BIDS YET';
	
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
								.setFooter({text: ''+ footertxt});
							achan.send({ embeds: [aEmbed] }).then(auctionEmbed => {
								dbSet(auctionEmbed.id, "0", 'N/A', reserve,'N/A'); //, startTime, endTime);
							});
				
				// below code is for update intervals
	
								var nextupdate;	
								//message.reply('hours: ' + hoursleft + " & minutes: " + minsleft);
								if (duration/1000 > 60){
									nextupdate = duration % 60000 + 60000;
								} else {
									nextupdate = 30000;
								}
															
					while(duration > 0 && killauction == false){
								if(kill == true){duration = 0; nextupdate = 0;}			
									await sleep(nextupdate);			
								if(kill == true){duration = 0; nextupdate = 0;}
								else{
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
									if(duration >= 3*60000){ //more than 2 minutes
										nextupdate = duration % 60000 + 60000;
									} else if(duration > 69000){ //between 1 and 2 minutes
										nextupdate = duration % 69000;
									} else if(duration == 69000){
										chan.send('69 SEX!!!');
										nextupdate = 9000;
									} else if(duration == 60000){
										chan.send('1 MINIT LEFF!!!');
										nextupdate = 15000;
									}  else if(duration == 45000){
										chan.send('45 SEX!!!');
										nextupdate = 15000;
									} else if (duration == 30000){
										chan.send('30 SEX!!!');
										nextupdate = 15000;
									} else if (duration == 15000){
										chan.send('15 SEX!!!');
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
													{ name: 'SELLER', value: '<@' + sellerid + '>', inline: true },
													{ name: 'HIGH BIDDER', value: winningbidder, inline: true}
												)
												.setFooter({text: 'Report any issues/suggestions via DM to @BTCornBLAIQchnz'})
											let endEmbed = await achan.send({ embeds: [eEmbed] });
											
											let endImg = await achan.send({files: [endimage]});
										
										dbmsg.edit('NO CURRENT AUCTION');
										client.user.setStatus('online');
										client.user.setActivity('Fantasia', {type: 'WATCHING'});
	
										
										} else{
												timeleft = '<1 min';
										}
									}	
										
	
										if(timeleft == "ENDED"){
											updateEmbed.setColor(endcolor);
											//iEmbed.setColor(endcolor);
											//introEmbed.edit(new MessageEmbed(iEmbed));
											//introEmbed.edit({embeds: [iEmbed]});
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
									await achan.send({ embeds: [updateEmbed] }).then(secondMessage => {
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
										await achan.send({ embeds: [updateEmbed] }).then(secondMessage => {
										dbSet(undefined, undefined, undefined, undefined, secondMessage.id); //, startTime, endTime);
										});
									}
								}
						}
						if(duration/1000 > 60){
							if(Math.floor(Math.random() * 100) > 85){
								const attachment = new MessageAttachment(imgurl);
								let randomhype = randommsg('hype');

								if(Math.floor(Math.random() * 100) > 50){
									var hypetop = '[' + auctiontext + '] ' + 'HIGH BID: ' + highbid;
									var hypefooter = 'bid commands: !bid !bit !biddup\naliG.loopring.eth';
									let hypeEmbed = new MessageEmbed()
													.setColor(embedColor)
													.setAuthor({name: hypetop})
													.setThumbnail(botimg)
													.setTitle(title)
													.setURL(nfturl)
													.setDescription(randomhype)
													.setImage(imgurl)
													.setFooter({text: ''+ hypefooter});
									await achan.send({ embeds: [hypeEmbed] });
								} else{
									achan.send(':fire: ' + randomhype);
								}
							}
						}
	
						if(duration/1000 == 10){									
							achan.send(duration/1000 + '...  *(HIGH BID: ' + highbid + ' LRC)*');
						} else{
							if(duration/1000 < 10 && duration/1000 > 0){
								achan.send(duration/1000 + '...  *(HIGH BID: ' + highbid + ' LRC)*');
							}
						}
						
						updateEmbed.setThumbnail();
						updateEmbed.setImage(imgurl);
					}
					}	

					await sleep(30000);
					nextauction = await getNextAuction();
					if(nextauction == 'NO QUEUE'){
						console.log('queue empty');
						await client.channels.cache.get(auctionchannel).send('any more out there? queue empty.');
						startup = true;
					}
//		}
		} while(killauction == false)   //consider changing to when no queue
		
	})();
		}						
		}
		} else{
			await message.react('❌');
			message.reply('yoo iz need an adult fo dat.');
		}	
		
		
		
	
	}

	
	try{
		
		if(msg.includes('booyakasha') || msg.includes('booyakornsha')){
			await message.react('976603681850003486');
		}

		if(msg.includes('!bid') || msg.includes('!bit') || msg.includes('!biddup') || msg.includes('!override')){
			var userCanBid = true;
			if(isSpecialEvent && !(message.member.roles.cache.has(aliE))){userCanBid = false;}
			
			if(userCanBid){
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
					bidamount = msg.replace('!biddup','').replace('!bid','').replace('!bit','').replace(/\s+/g, '').replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');;
					
					
					if(msg.includes('!override')){
						if(message.member.roles.cache.has(puzzlegang)){
							isOverride = true;
							var override = msg.slice(10);
							override = override.replace(/\s+/g, '');
							highbid = 0;
							bidamount = override.split(',')[0];
							highbidder = override.split(',')[1];
						} else{
							 await message.react('❌');
							 message.reply('u iz need an adult for dat.');					
							 return;
						}
					}
					bidamount = bidamount.replace(/,/g, '');	
					let hasLetter = /[a-zA-Z]/.test(bidamount);				
					let isnum = /^\d+$/.test(bidamount);
					bid = parseInt(+bidamount);
					if(+bidamount > bid){
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
						} else if(bid == 123){
							bidmsg = bidmsg + '\n *noice countin my man... wanna try 456 now?*';
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

			}else{
				console.log('ineligible bidder: special event');
				let sorrybra = await message.reply('Sorry bra, dis iz a limited access event.');
				await message.delete();
				await sleep(2000);
				await sorrybra.delete();
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
	try{
		if(reaction.message.channel.id == auctionchannel){
			if(reaction.emoji.name === '❌'){
				var auctionToKill = reaction.message.id;
				var dbchannel = await client.channels.cache.get(databasechannel);
				var dbmsg = await dbchannel.messages.fetch(databasemsg);
				let amsg = dbmsg.content;
				var initialmsg = amsg.split(',')[0];
				var secondmsg = amsg.split(',')[4];
				if(auctionToKill == initialmsg || auctionToKill == secondmsg){
					let qUser = reaction.message.embeds[0].fields[0].value;
					var hasRole = await reaction.message.guild.members.cache.get(user.id).roles.cache.has(puzzlegang);
				

				if(qUser.includes(user.id) || hasRole){
					kill = true;  //wonder if deleting the embed message would work, but we'll try kill first	
					var dbchannel = await client.channels.cache.get(auctionchannel);
					await client.channels.cache.get(auctionchannel).send('MUrrrrrrdurrrr! I iz killin it!').catch(/*Your Error handling if the Message isn't returned, sent, etc.*/);
				}else{
					console.log('unauthorized user trying to kill auction');
					reaction.users.remove(user);
				}
			}
			}
		}
	}catch(err){
		console.log(err);
		reaction.users.remove(user);
	}

	if(reaction.message.channel.id == queuechannel){
		if(reaction.emoji.name === '✅'){
			console.log('Auction Alert Subscriber Added');
			var reactmsgid = reaction.message.id;
			var dbchannel = await client.channels.cache.get(databasechannel);
			var dbmsg = await dbchannel.messages.fetch(queuemsg);
			let qmsg = dbmsg.content;
			if(qmsg.includes('dm'+reactmsgid)){
				qmsg = qmsg.replace('dm'+reactmsgid,reactmsgid);
				await dbmsg.edit(qmsg);
			}
		}else if(reaction.emoji.name === '❌'){
			let qUser = reaction.message.embeds[0].fields[0].value;
			console.log(qUser);
			var hasRole = await reaction.message.guild.members.cache.get(user.id).roles.cache.has(puzzlegang);
			console.log(hasRole);

			if(qUser.includes(user.id) || hasRole){
				var removemsgid = reaction.message.id;
				var dbchannel = await client.channels.cache.get(databasechannel);
				var dbmsg = await dbchannel.messages.fetch(queuemsg);
				let qmsg = dbmsg.content;
				console.log(removemsgid + ' ' + qmsg);
				if(qmsg.includes(removemsgid)){
					if(qmsg == removemsgid){
						qmsg = 'NO QUEUE';
					}else{
						qmsg = qmsg.replace(removemsgid,'').replace(',,',',');
						
						if(qmsg.charAt(0)==','){
							qmsg=qmsg.slice(2);
						}
						
						if(qmsg.charAt(qmsg.length - 1) ==','){
							qmsg=qmsg.slice(0, -2);
						}

						if(qmsg.charAt(qmsg.length) == ','){
							qmsg=qmsg.slice(0, -1);
						}
					}
					await dbmsg.edit(qmsg);
				} else{
					console.log('Queue message was not in database');
				}
				await reaction.message.delete();
			}else{
				reaction.users.remove(user);
			}
		}
	}else{
		return;
	}
});
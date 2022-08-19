// Include support for decoding various address formats.
cashaddr = require('cashaddrjs');
base58check = require('base58check');

// Polyfill padStart when needed.
if(!String.prototype.padStart)
{
	String.prototype.padStart = function padStart(targetLength, padString)
	{
		targetLength = targetLength >> 0;
		padString = String(typeof padString !== 'undefined' ? padString : ' ');
	
		if(this.length >= targetLength)
		{
			return String(this);
		}
		else
		{
			targetLength = targetLength - this.length;

			if(targetLength > padString.length)
			{
				padString += padString.repeat(targetLength / padString.length);
			}

			return padString.slice(0, targetLength) + String(this);
		}
	};
}

// Polyfill padEnd when needed.
if(!String.prototype.padEnd)
{
	String.prototype.padEnd = function padEnd(targetLength,padString)
	{
		targetLength = targetLength >> 0;

		padString = String((typeof padString !== 'undefined' ? padString : ' '));

		if(this.length > targetLength)
		{
			return String(this);
		}
		else
		{
			targetLength = targetLength-this.length;

			if(targetLength > padString.length)
			{
				padString += padString.repeat(targetLength/padString.length);
			}

			return String(this) + padString.slice(0,targetLength);
		}
	};
}

// Helper functions to convert to/from hexstrings and bytearrays.
arrayFromHex = hexString => new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
arrayToHex = intArray => intArray.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

// Helper function that allows deep assignments without need to create intermediate empty objects.
deepSet = (input) => 
{
	handler = {
		get: (obj, prop) => {
			obj[prop] = obj[prop] || {};
			return deepSet(obj[prop]);
		}
	};
	return new Proxy(input, handler);
};

//
protocol = 
{
	// Configure the protocol starting point.
	heightModifier: 563620,

	// Define a list of emojis to use as identicons.
	emojiHexList: [ '1f47b', '1f412', '1f415', '1f408', '1f40e', '1f404', '1f416', '1f410', '1f42a', '1f418', '1f401', '1f407', '1f43f', '1f987', '1f413', '1f427', '1f986', '1f989', '1f422', '1f40d', '1f41f', '1f419', '1f40c', '1f98b', '1f41d', '1f41e', '1f577', '1f33b', '1f332', '1f334', '1f335', '1f341', '1f340', '1f347', '1f349', '1f34b', '1f34c', '1f34e', '1f352', '1f353', '1f95d', '1f965', '1f955', '1f33d', '1f336', '1f344', '1f9c0', '1f95a', '1f980', '1f36a', '1f382', '1f36d', '1f3e0', '1f697', '1f6b2', '26f5', '2708', '1f681', '1f680', '231a', '2600', '2b50', '1f308', '2602', '1f388', '1f380', '26bd', '2660', '2665', '2666', '2663', '1f453', '1f451', '1f3a9', '1f514', '1f3b5', '1f3a4', '1f3a7', '1f3b8', '1f3ba', '1f941', '1f50d', '1f56f', '1f4a1', '1f4d6', '2709', '1f4e6', '270f', '1f4bc', '1f4cb', '2702', '1f511', '1f512', '1f528', '1f527', '2696', '262f', '1f6a9', '1f463', '1f35e' ],
	emojiCodepoints: [ 128123, 128018, 128021, 128008, 128014, 128004, 128022, 128016, 128042, 128024, 128000, 128007, 128063, 129415, 128019, 128039, 129414, 129417, 128034, 128013, 128031, 128025, 128012, 129419, 128029, 128030, 128375, 127803, 127794, 127796, 127797, 127809, 127808, 127815, 127817, 127819, 127820, 127822, 127826, 127827, 129373, 129381, 129365, 127805, 127798, 127812, 129472, 129370, 129408, 127850, 127874, 127853, 127968, 128663, 128690, 9973, 9992, 128641, 128640, 8986, 9728, 11088, 127752, 9730, 127880, 127872, 9917, 9824, 9829, 9830, 9827, 128083, 128081, 127913, 128276, 127925, 127908, 127911, 127928, 127930, 129345, 128269, 128367, 128161, 128214, 9993, 128230, 9999, 128188, 128203, 9986, 128273, 128274, 128296, 128295, 9878, 9775, 128681, 128099, 127838 ],
	emojiNames: { "8986":"watch","9728":"sun","9730":"umbrella","9775":"yin yang","9824":"spade suit","9827":"club suit","9829":"heart suit","9830":"diamond suit","9878":"balance scale","9917":"soccer ball","9973":"sailboat","9986":"scissors","9992":"airplane","9993":"envelope","9999":"pencil","11088":"star","127752":"rainbow","127794":"evergreen tree","127796":"palm tree","127797":"cactus","127798":"hot pepper","127803":"sunflower","127805":"ear of corn","127808":"four leaf clover","127809":"maple leaf","127812":"mushroom","127815":"grapes","127817":"watermelon","127819":"lemon","127820":"banana","127822":"red apple","127826":"cherries","127827":"strawberry","127838":"bread","127850":"cookie","127853":"lollipop","127872":"ribbon","127874":"birthday cake","127880":"balloon","127908":"microphone","127911":"headphone","127913":"top hat","127925":"musical note","127928":"guitar","127930":"trumpet","127968":"house","128000":"rat","128004":"cow","128007":"rabbit","128008":"cat","128012":"snail","128013":"snake","128014":"horse","128016":"goat","128018":"monkey","128019":"rooster","128021":"dog","128022":"pig","128024":"elephant","128025":"octopus","128029":"honeybee","128030":"lady beetle","128031":"fish","128034":"turtle","128039":"penguin","128042":"camel","128063":"chipmunk","128081":"crown","128083":"glasses","128099":"footprints","128123":"ghost","128161":"light bulb","128188":"briefcase","128203":"clipboard","128214":"open book","128230":"package","128269":"magnifying glass tilted left","128273":"key","128274":"locked","128276":"bell","128295":"wrench","128296":"hammer","128367":"candle","128375":"spider","128640":"rocket","128641":"helicopter","128663":"automobile","128681":"triangular flag","128690":"bicycle","129345":"drum","129365":"carrot","129370":"egg","129373":"kiwi fruit","129381":"coconut","129408":"crab","129414":"duck","129415":"bat","129417":"owl","129419":"butterfly","129472":"cheese wedge" },

	paymentTypeNames:
	{
		'01': "Key Hash",
		'02': "Script Hash",
		'03': "Payment Code",
		'04': "Stealth Keys"
	},

	paymentTypeCodes:
	{
		'01': "P2PKH",
		'02': "P2SH",
		'03': "P2PC",
		'04': "P2SK"
	},

	paymentCodeNumbers:
	{
		"P2PKH": '01',
		"P2SH": '02',
		"P2PC": '04',
		"P2SK": '03'
	},

	//
	accountRegExp: /^([a-zA-Z0-9_]+)(#([0-9]+)(\.([0-9]+))?)?/,

	//
	queryTemplate:
	{
		"v": 3,
		"q": 
		{
			"db": ["u", "c"],
			"limit": 99,
			"find": 
			{
				"out.h1": "01010101"
			}
		},
		"r":
		{
			"f": "[ .[] | ( .out[] | select(.b0.op==106) ) as $outWithData | { blockheight: .blk.i?, blockhash: .blk.h?, transactionhash: .tx.h?, name: $outWithData.s2, data: $outWithData.h3 } ]"
		}
	},

	queryBlockHeight: function()
	{
		let query = JSON.parse(JSON.stringify(this.queryTemplate));

		query.q.db = ["c"]
		query.q.limit = 1;
		query.q.find = {};

		return this.queryBitDB(query);
	},

	queryRegistrations: function(accountName, accountNumber, collisionHash, limit)
	{
		// Make a copy of the default query template.
		let query = JSON.parse(JSON.stringify(this.queryTemplate));

		// Set the limit.
		query.q.limit = limit;

		// If a blockheight was supplied, add it to the query.
		if(typeof accountNumber === 'number' && accountNumber > 0)
		{
			query.q.find["blk.i"] = accountNumber + protocol.heightModifier;
		}

		// If an account name was supplied, add it to the query.
		if(typeof accountName === 'string' && accountName.length > 0)
		{
			query.q.find["out.s2"] = { "$regex": "^" + accountName, "$options": "i" };
		}
		else
		{
			query.q.find["out.s2"] = { "$regex": "^.", "$options": "i" };
		}
		
		return this.queryBitDB(query);
	},

	//
	queryBitDB: function(query)
	{
		// Encode the query.
		let base64_query = btoa(JSON.stringify(query));

		// Set the URL of the query request.
		let url = "https://bitdb.bch.sx/q/" + base64_query;

		// Configure the bitDB API key in the request header.
		// let header = { headers: { key: "qqdd9rf6uf2l2h4uzjdkqgqqeg4rpw25e53lus6qrt" } };
		let header = { headers: {} };

		// Return the result set.
		return fetch(url, header).then(response => response.json());
	},
	
	//
	calculateAccountIdentity: function(blockhash, transactionhash)
	{
		// Step 1: Concatenate the block hash with the transaction hash
		let account_hash_step1 = blockhash + transactionhash;

		// Step 2: Hash the results of the concatenation with sha256
		let account_hash_step2 = sha256(arrayFromHex(account_hash_step1));

		// Step 3: Take the first and last four bytes and discard the rest
		let account_hash_step3 = account_hash_step2.substring(0, 8);
		let account_emoji_step3 = account_hash_step2.substring(account_hash_step2.length - 8);

		// Step 4a: Convert to decimal notation and store as a string
		let account_hash_step4 = parseInt(account_hash_step3, 16);

		// Step 4b: Select an emoji from the emojiHexList
		let emoji_index = parseInt(account_emoji_step3, 16) % this.emojiCodepoints.length;

		// Step 5: Reverse the the string so the last number is first
		let account_hash_step5 = account_hash_step4.toString().split("").reverse().join("").padEnd(10, '0');

		// Step 5b: calculate the integer codepoint for the emoji
		let emoji_codepoint = this.emojiCodepoints[emoji_index];
		
		// Return the final account identity.
		return { collisionHash: account_hash_step5, accountEmoji: emoji_codepoint };
	},

	// Helper function to choose a suitable OP_PUSH opcode.
	pushcode: function(length)
	{
		if(length == 0) { return false; }
		if(length <= 75) { return length.toString(16).padStart(2, '0').toUpperCase(); }
		if(length <= 256) { return "4c" + length.toString(16).padStart(4, '0').toUpperCase(); }
		if(length <= 256*256) { return "4d" + length.toString(16).padStart(6, '0').toUpperCase(); }
		if(length <= 256*256*256*256) { return "4e" + length.toString(16).padStart(10, '0').toUpperCase(); }
	},

	// Default request parameters.
	callParams:
	{
		mode: "no-cors", // no-cors, cors, *same-origin
		cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
		credentials: "omit", // include, *same-origin, omit
		redirect: "follow", // manual, *follow, error
		referrer: "no-referrer", // no-referrer, *client
		headers:
		{
			"Content-Type": "application/json; charset=utf-8"
		}
	},

	// Function that makes an AJAX request.
	requestCall: function(url, data, type)
	{
		/// Make a copy of the default call parameters.
		let fetchParams = this.callParams;

		// Set the requested type and data.
		fetchParams.method = type;
		fetchParams.body = JSON.stringify(data);

		// Make the call and return the JSON-encoded response.
		return fetch(url, fetchParams).then(response => response.json());
	},

	// Wrappers for convenience.
	requestGet: function(url, data) { return this.requestCall(url, data, 'GET'); },
	requestPost: function(url, data) { return this.requestCall(url, data, 'POST'); },

	// Creates a registration with the backend.
	create_registration: function()
	{
		let data =
		{
			"requested_alias": document.getElementById('alias_create_transaction').getAttribute('alias'), 
			"payment_data": document.getElementById('alias_create_transaction').getAttribute('payload')
		}

		protocol.requestPost('https://www.cashaccount.info/alias', data).then
		(
			function(data)
			{
				if(typeof data.err !== 'undefined')
				{
					alert(data.err);
				}

				if(typeof data['alias']['_id'] !== 'undefined')
				{
					// Mark fieldsets as active/inactive.
					document.getElementById('fieldset_create_transaction').className = 'complete';
					document.getElementById('fieldset_broadcast_transaction').className = 'active';

					// Mark form elements as enabled/disabled.
					document.getElementById('alias_broadcast_transaction').disabled = false;
					document.getElementById('alias_name').disabled = true;
					document.getElementById('alias_payload').disabled = true;
					document.getElementById('alias_create_transaction').disabled = true;

					// Update the registration status
					document.getElementById('alias_registration_status').innerHTML = 'Created';
					document.getElementById('alias_registration_status').setAttribute('title', 'Waiting to be broadcast to the network.');

					// Store the registration id on the broadcast button.
					document.getElementById('alias_broadcast_transaction').setAttribute('data-registration-id', data['alias']['_id']);
				}
			}
		);
	},
	
	broadcast_registration: function()
	{
		let registration_id = document.getElementById('alias_broadcast_transaction').getAttribute('data-registration-id');

		// Broadcast the transaction
		protocol.requestPost('https://www.cashaccount.info/alias/' + registration_id + '/broadcast', { 'id': registration_id }).then
		(
			function(data)
			{
				if(typeof data.txid === 'undefined')
				{
					alert('Backend failed to create transaction.');
				}
				else
				{
					// Mark fieldsets as active/inactive.
					document.getElementById('fieldset_broadcast_transaction').className = 'complete';
					document.getElementById('fieldset_confirm_transaction').className = 'active';

					// Mark form elements as enabled/disabled.
					document.getElementById('alias_broadcast_transaction').disabled = true;

					// Update the registration status
					document.getElementById('alias_registration_status').innerHTML = 'Broadcasted';
					document.getElementById('alias_registration_status').setAttribute('title', 'Waiting for inclusion in a block.');

					// Update the TXID
					document.getElementById('alias_transaction_hash').innerHTML = data.txid.toUpperCase();

					// 
					let query = 
					{
						"v": 3,
						"q": 
						{
							"db": ["c"],
							"find": { "tx.h": data.txid }
						},
						"r": { "f": "[ .[] | { blockheight: .blk.i? } ]" }
					};

					//
					let b64 = Buffer.from(JSON.stringify(query)).toString("base64");

					//
					let bitsocket = new EventSource('https://bitsocket.bch.sx/s/' + b64);

					//
					bitsocket.onmessage = function(message)
					{
						console.log(message);
						let eventMessage = JSON.parse(message.data);

						if(eventMessage.type != 'open' && eventMessage.data.length >= 1)
						{
							console.log(eventMessage);

							document.getElementById('alias_registration_status').innerHTML = 'Confirmed';
							document.getElementById('alias_registration_status').setAttribute('title', 'Registration is complete.');
							document.getElementById('alias_lookup_transaction').disabled = false;
							document.getElementById('fieldset_confirm_transaction').className = 'complete';
						}
					};
				}
			}
		);
	}
};

website = 
{
	/* Triggered when typing in a new account name for registration */
	update_name: function()
	{
		// Remove whitespace.
		document.getElementById('alias_name').value = document.getElementById('alias_name').value.trim();

		// Get the name string as a blob for further processing.
		let name = new Blob([document.getElementById('alias_name').value]);

		// Create a file reader to get data from the blob.
		let fileReader = new FileReader();

		// When the file reader has loaded the blob data..
		fileReader.onload = function()
		{
			// Store the name as a byte array.
			let nameBytes = new Uint8Array(fileReader.result);

			// Update the OP_PUSH byte length indicator.
			document.getElementById('alias_name_length').setAttribute('title', 'Push ' + fileReader.result.byteLength + ' bytes');
			document.getElementById('alias_name_length').innerHTML = protocol.pushcode(fileReader.result.byteLength);

			// Update the OP_PUSH byte data for the name string.
			document.getElementById('alias_name_hex').setAttribute('title', 'UTF-8 encoded name from: ' + document.getElementById('alias_name').value);
			document.getElementById('alias_name_hex').innerHTML = arrayToHex(nameBytes).toUpperCase();

			// Update the predicted identifiers name part.
			document.getElementById('alias_name_predication').innerHTML = document.getElementById('alias_name').value;

			// alias_name_lookup_button
			document.getElementById('alias_lookup_transaction').innerHTML = 'Lookup: ' + document.getElementById('alias_name').value;

			// Set the alias name property on the create registration button.
			document.getElementById('alias_create_transaction').setAttribute('alias', document.getElementById('alias_name').value);

			// Calculate if both alias and payload have been properly entered.
			let entry_status = (document.getElementById('alias_create_transaction').getAttribute('alias') && document.getElementById('alias_create_transaction').getAttribute('payload'));

			// Update the create registration buttons enable/disable status.
			document.getElementById('alias_create_transaction').disabled = !entry_status;
		};

		// Load the name blob.
		fileReader.readAsArrayBuffer(name);
	},


	//
	update_payload: function()
	{
		// Remove whitespace.
		document.getElementById('alias_payload').value = document.getElementById('alias_payload').value.trim();

		let address_types =
		{
			"P2PKH": "Key Hash",
			"P2SH": "Script Hash",
			"P2PC": "Payment Code",
			"P2SK": "Stealth Keys"
		}
		let address_codes =
		{
			"P2PKH": "01",
			"P2SH": "02",
			"P2PC": "03",
			"P2SK": "04"
		}

		try
		{
			let payload = '';
			try
			{
				//console.log('Trying to decode as CashAddr');

				let source_value = document.getElementById('alias_payload').value;
				console.log('raw:'  + source_value);
				if(document.getElementById('alias_payload').value.substring(0, 12) != 'bitcoincash:')
				{
					source_value = 'bitcoincash:' + document.getElementById('alias_payload').value;
					console.log('prepend:'  + source_value);
				}

				let address = cashaddr.decode(source_value);
				console.log('addr:'  + address);
				payload_hex = arrayToHex(address.hash).toUpperCase();
				payload_type = address.type;
			}
			catch (e)
			{
				//console.log('Trying to decode as Base58Check');

				let address = base58check.decode(document.getElementById('alias_payload').value);

				if(address.prefix.toString('hex') === '47' && address.data.length == 80)
				{
					payload_hex = address.data.toString('hex');
					payload_type = 'P2PC';
				}
			}
			
			// Update the OP_PUSH byte length indicator.
			document.getElementById('alias_payload_length').setAttribute('title', 'Push ' + (1 + payload.length) + ' bytes');
			document.getElementById('alias_payload_length').innerHTML = protocol.pushcode((1 + payload.length));

			// Update the OP_PUSH byte data for the name string.
			document.getElementById('alias_payload_type').setAttribute('title', 'Type: ' + address_types[payload_type]);
			document.getElementById('alias_payload_type').innerHTML = address_codes[payload_type];

			// Update the OP_PUSH byte data for the name string.
			document.getElementById('alias_payload_hex').setAttribute('title', 'Hex encoded payment data from: ' + document.getElementById('alias_payload').value);
			document.getElementById('alias_payload_hex').innerHTML = payload_hex;

			// Set the payload property on the create registration button.
			document.getElementById('alias_create_transaction').setAttribute('payload', document.getElementById('alias_payload').value);
		}
		catch (e)
		{
			// Remove the payload property on the create registration button.
			document.getElementById('alias_create_transaction').setAttribute('payload', '');
		}

		// Calculate if both alias and payload have been properly entered.
		let entry_status = (document.getElementById('alias_create_transaction').getAttribute('alias') && document.getElementById('alias_create_transaction').getAttribute('payload'));

		// Update the create registration buttons enable/disable status.
		document.getElementById('alias_create_transaction').disabled = !entry_status;
	},

	//
	update_expected_identifier: function(blockheight)
	{
		if(document.getElementById('fieldset_confirm_transaction').className !== 'complete')
		{
			document.getElementById('alias_expected_blockheight').innerHTML = (blockheight - protocol.heightModifier + 1) + ";";
		}
	},

	update_scroll_positions: function()
	{
		let temp_navigation_nodes = document.getElementById('navigation_list').childNodes;

		window['navigation_nodes'] = {};

		for(let index = 0, count = temp_navigation_nodes.length; index < count; index += 1)
		{
			if(typeof temp_navigation_nodes[index].href !== 'undefined')
			{
				let id = temp_navigation_nodes[index].href.split('#')[1];
				let element = document.getElementById(id);
				if(element !== null && typeof element.getBoundingClientRect === 'function')
				{
					window['navigation_nodes'][id] = 
					{
						id: id,
						starts_at: element.getBoundingClientRect().top + window.scrollY,
						ends_at: element.getBoundingClientRect().bottom + window.scrollY
					};
				}
			}
		}

		if(!window['scroll_ready'])
		{
			window['scrolling_prev'] = 0;
			window['scrolling_next'] = 0;
			window['nav_current'] = 'introduction';

			window['scroll_ready'] = true;
		}
	},

	lookup_identifier: function(searchString = null, limit)
	{
		if(searchString)
		{
			document.getElementById('lookup_search_string').value = searchString;
		}

		let accountParts = [null];
		let identifier = document.getElementById('lookup_search_string').value.trim();

		// If an identifier was supplied, parse it.
		if(identifier !== '')
		{
			accountParts = protocol.accountRegExp.exec(identifier);
		}

		protocol.queryRegistrations(accountParts[1], parseInt(accountParts[3]), accountParts[4], limit).then
		(
			function(results)
			{
				// Clear previous result.
				document.getElementById('result_list').innerHTML = "";

				let transaction_types = ['u', 'c'];
				let payment_types =
				{
					'01': "Key Hash",
					'02': "Script Hash",
					'03': "Payment Code",
					'04': "Stealth Keys"
				}

				let payment_data_types =
				{
					'01': "P2PKH",
					'02': "P2SH",
					'03': "????",
					'04': "????"
				}

				//console.log(results);

				// Set up a collision table.
				let collisionTable = {};

				// Populate the collision table.
				for(index in results['c'])
				{
					let collisionHash = protocol.calculateAccountIdentity(results['c'][index]['blockhash'], results['c'][index]['transactionhash']).collisionHash;

					// Add this collision to the collision list for this name at this blockheight.
					deepSet(collisionTable)[results['c'][index]['blockheight']][results['c'][index]['name'].toLowerCase()]['collisions'][collisionHash] = collisionHash;
				}

				// Calculate the shortest identifiers.
				for(index in results['c'])
				{
					// Make temporary copies for code legibility reasons.
					let blockHeight = results['c'][index]['blockheight'];
					let accountName = results['c'][index]['name'];
					let currentTXID = results['c'][index]['transactionhash'];
					let collisionHash = protocol.calculateAccountIdentity(results['c'][index]['blockhash'], results['c'][index]['transactionhash']).collisionHash;
					let collisionMinimal = 0;
					
					// For each collision registered to this name and blockheight..
					for(collision in collisionTable[blockHeight][accountName.toLowerCase()]['collisions'])
					{
						// Make a temporary copy for code legibility reasons.
						let currentCollision = collisionTable[blockHeight][accountName.toLowerCase()]['collisions'][collision];

						// Start at collision length of 10 and work backwards until we discover the shortest collision..
						let length = 10;
						while(length > collisionMinimal)
						{
							// .. but only compare with actual collisions, not with ourselves.
							if(collisionHash != currentCollision)
							{
								// If this collision is the same from the start up to this tested collision length..
								if(collisionHash.substring(0, length) == currentCollision.substring(0, length))
								{
									// .. and since this is the first full collision, break and move on with this collision length.
									break;
								}
							}
							length -= 1;
						}
						
						collisionMinimal = length;
					}

					// Set the collision length if there was at least one collision.
					if(Object.keys(collisionTable[blockHeight][accountName.toLowerCase()]['collisions']).length > 1)
					{
						collisionTable[currentTXID] = 1 + collisionMinimal;
					}
				}

				//
				for(type in transaction_types)
				{
					let max_limit = 90;
					let cur_limit = 1;

					for(index in results[transaction_types[type]])
					{
						//
						cur_limit += 1;

						if(cur_limit < max_limit)
						{
							// Create an account template for an unconfirmed registration transaction.
							let account_name = results[transaction_types[type]][index]['name'];
							let transaction_id = results[transaction_types[type]][index]['transactionhash'];
							let account_number = '????';
							let block_height = 'Pending';
							let block_hash = 'Pending';
							let account_hash = '??????????';
							let account_emoji = "<span class='emoji'>&nbsp;</span>";
							let account_class = 'unconfirmed';

							// Update the template based on data from the mined registration transaction.
							if(results[transaction_types[type]][index]['blockheight'] !== null)
							{
								account_number = results[transaction_types[type]][index]['blockheight'] - protocol.heightModifier;
								block_height = results[transaction_types[type]][index]['blockheight'];
								block_hash = results[transaction_types[type]][index]['blockhash'];

								account_class = 'confirmed';
								account_hash = protocol.calculateAccountIdentity(block_hash, transaction_id).collisionHash;
								account_emoji_code = protocol.calculateAccountIdentity(block_hash, transaction_id).accountEmoji;
								account_emoji = "<span class='emoji' title='" + protocol.emojiNames[account_emoji_code] + "'>&#" + account_emoji_code + ";</span>";
							}

							if(results[transaction_types[type]][index]['blockheight'] === null || account_number >= 100)
							{
								if(typeof account_collision === 'undefined' || account_hash.startsWith(account_collision.substring(1)))
								{
									let account_identifier = "<td><span>" + account_name + "</span></td><td><a href='https://www.cashexplorer.com/transaction/" + transaction_id + "'>#" + account_number;
									if(typeof collisionTable[transaction_id] !== 'undefined' && collisionTable[transaction_id] > 0)
									{
										account_identifier += "<i title='Due to a naming collision the account number has been extended by " + collisionTable[transaction_id] + " digits.'>." + account_hash.substring(0, collisionTable[transaction_id]) + "</i><i title='The remaining numbers are also part of the account but is not needed to uniquely identify the account.'>" + account_hash.substring( collisionTable[transaction_id]) + "</i></a></td>";
									}
									else
									{
										account_identifier += "<i></i><i title='These number are part of the account but is not needed to uniquely identify the account.'>." + account_hash.substring( collisionTable[transaction_id]) + "</i></a></td>";
									}

									let payment_type = '<i>Unknown payment type</i>';
									let payment_data = 'Unknown';
									let account_address_type = 'Unknown';
									let account_address = '';

									try
									{
										if(parseInt(results[transaction_types[type]][index]['data'].substring(0,2)) !== 0 && parseInt(results[transaction_types[type]][index]['data'].substring(0,2)) <= 4)
										{
											payment_type_code = results[transaction_types[type]][index]['data'].substring(0,2);
											payment_type = payment_types[results[transaction_types[type]][index]['data'].substring(0,2)];
											payment_data = results[transaction_types[type]][index]['data'].substring(2);
											account_address_type = payment_data_types[results[transaction_types[type]][index]['data'].substring(0,2)];

											if(payment_type_code == '01' || payment_type_code == '02')
											{
												account_address = cashaddr.encode('bitcoincash', account_address_type, arrayFromHex(payment_data)).substring(12);
											}
											
											if(payment_type_code == '03')
											{
												account_address = base58check.encode(payment_data, '47');
											}
										}
									}
									catch (e)
									{
									}

									document.getElementById('result_list').innerHTML += "<li id='" + transaction_id + "' class='" + account_class + "'><span class='account_identifier'>" + account_identifier + "</span>" + account_emoji + "<span class='account_payment_link'><a href='https://www.cashexplorer.com/address/" + account_address + "'>	" + account_address + "</a></span>";

									setTimeout
									(
										function()
										{
											if(account_address)
											{
												$('#' + transaction_id).qrcode(account_address);
											}
											else
											{
												document.getElementById(transaction_id).innerHTML += "<p>Unable to parse payment information</p>";
											}
										}, 100
									);
								}
							}
						}
					}
				}
			}
		);
	}
}

// Make a default lookup for the latest registered accounts.
window.addEventListener
(
	"load", 
	function()
	{
		// Assign events to automatically react to user input for the alias.
		document.getElementById('alias_name').addEventListener("click", website.update_name);
		document.getElementById('alias_name').addEventListener("change", website.update_name);
		document.getElementById('alias_name').addEventListener("paste", website.update_name);
		document.getElementById('alias_name').addEventListener("keyup", website.update_name);

		// Assign events to automatically react to user input for the payload.
		document.getElementById('alias_payload').addEventListener("click", website.update_payload);
		document.getElementById('alias_payload').addEventListener("change", website.update_payload);
		document.getElementById('alias_payload').addEventListener("paste", website.update_payload);
		document.getElementById('alias_payload').addEventListener("keyup", website.update_payload);

		// Assign events to handle button functions.
		document.getElementById('alias_create_transaction').addEventListener("click", protocol.create_registration);
		document.getElementById('alias_broadcast_transaction').addEventListener("click", protocol.broadcast_registration);

		// Update the scroll position regulary.
		setInterval(website.update_scroll_positions, 0.667);

		// Make an initial identifier lookup to populate the result list.
		website.lookup_identifier(null, 9);

		protocol.queryBlockHeight().then
		(
			function(results)
			{
				website.update_expected_identifier(results.c[0].blockheight);
			}
		);
		
		let queryTemplate = 
		{
			"v": 3,
			"q": 
			{
				"db": ["c"],
				"find": {}
			},
			"r":
			{
				"f": "[ .[] | ( .out[] | select(.b0.op==106) ) as $outWithData | { blockheight: .blk.i?, blockhash: .blk.h?, transactionhash: .tx.h?, name: $outWithData.s2, data: $outWithData.h3 } ]"
			}
		};

		//
		let b64 = Buffer.from(JSON.stringify(queryTemplate)).toString("base64");

		//
		let bitsocket = new EventSource('https://bitsocket.bch.sx/s/' + b64);

		//
		bitsocket.onmessage = function(message)
		{
			let eventMessage = JSON.parse(message.data);

			if(eventMessage.type != 'open')
			{
				website.update_expected_identifier(eventMessage.index);
			}
		}
	}
);

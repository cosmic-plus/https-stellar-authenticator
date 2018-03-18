
var sdk = StellarSdk

var global = {
	cosmicLink: null,
	query: null,
	xdr: null,
	setting: null
}

/*** helpers ***/
function checkSecretSeed(seed) {
	try { sdk.Keypair.fromSecret(seed) }
	catch(error) { console.log(error); throw new Error("Invalid secret seed") }
}

var publicServer = new sdk.Server("https://horizon.stellar.org")
var testingServer = new sdk.Server("https://horizon-testnet.stellar.org")
function getServer(network) {
	switch(network) {
		case undefined:
		case "public": return publicServer
		case "test": return testingServer
		default: throw new Error("Invalid network: " + network)
	}
}

function accountExist(publicKey, network) {
	return new Promise(function(success){
		getServer(network).loadAccount(publicKey)
			.then(function(){ success(true) })
			.catch(function(){ success(false) })
	})
}

function accountNetwork(name) {
	if(name.substr(0,7) == "(test) ") return "test"
	else return "public"
}

/*** Crypto primitives ***/

// Compatibility with Stellar Port keystore
var latestScryptOptions = {
    N: 16384,
    r: 8,
    p: 1,
    dkLen: nacl.secretbox.keyLength,
    encoding: 'binary'
}

function deriveKey(password, salt, scryptOptions) {
	return new Promise(function(success, failure) {
		if(!password || !salt || !scryptOptions) throw new Error("Missing argument")
		try { scrypt(password, salt, scryptOptions, success) }
		catch(error) { console.log(error); failure(error) }
	})
}

function encryptString(string, password){
	return new Promise(function(success, failure){
		if(!string || !password) throw new Error("Missing argument")
		var salt = nacl.randomBytes(32)
		deriveKey(password, salt, latestScryptOptions)
			.then(function(key) {
				var nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
				var ciphertext = nacl.secretbox(nacl.util.decodeUTF8(string), nonce, key)
				success({
					ciphertext: nacl.util.encodeBase64(ciphertext),
					nonce: nacl.util.encodeBase64(nonce),
					salt: nacl.util.encodeBase64(salt),
					scryptOptions: latestScryptOptions
				})
			})
			.catch(failure)
	})
}

function decryptString(encryptedObject, password) {
	return new Promise(function(success, failure) {
		if(!encryptedObject || !password) throw new Error("Missing argument")
		var ciphertext  = nacl.util.decodeBase64(encryptedObject.ciphertext)
		var nonce = nacl.util.decodeBase64(encryptedObject.nonce)
		var salt = nacl.util.decodeBase64(encryptedObject.salt)
		var scryptOptions = encryptedObject.scryptOptions

		deriveKey(password, salt, scryptOptions)
			.then(function(key){
				var seed = nacl.secretbox.open(ciphertext, nonce, key)
				if(!seed) failure(new Error("Decryption failed"))
				success(nacl.util.encodeUTF8(seed))
			})
			.catch(failure)
	})
}

function encryptObject(object, password) {
	return encryptString(JSON.stringify(object), password)
}

function decryptObject(encryptedObject, password) {
	return decryptString(encryptedObject, password)
		.then(function(string){ return JSON.parse(string) })
}


/*** Encrypted accounts database implementation ***/

var database = {
	create: function(password) {
		return new Promise(function(success, failure) {
			database._checkNonEmptyPassword(password)

			var newdb = {}
			newdb.public = { reserved: "" }
			newdb.private = ["reserved"]

			encryptObject(newdb.public, password)
				.then(function(publicCrypted) {
					newdb.publicCrypted = publicCrypted
					success(newdb)
				})
				.catch(failure)
		})
	},

	open: function(DB, password) {
		return new Promise(function(success, failure) {
			database._checkDB(DB)
			database._checkNonEmptyPassword(password)

			if(DB.public) success(DB)
			else {
				decryptObject(DB.publicCrypted, password)
					.then(function(public) {
						DB.public = public
						success(DB)
					})
					.catch(function(error){
						console.log(error)
						failure(new Error("Wrong password"))
					})
			}
		})
	},

	fromString: function(string) {
		try {
			var DB = JSON.parse(string)
			database._checkDB(DB)
			return DB
		} catch(error) {
			throw new Error("Can't parse database")
		}

	},

	toString: function(DB) {
		database._checkDB(DB)
		var copiedDB = JSON.parse(JSON.stringify(DB))
		delete copiedDB.public
		return JSON.stringify(copiedDB)
	},

	_updatePublicCrypted: function(DB, password) {
		return encryptObject(DB.public, password)
			.then(function(publicCrypted) {
				DB.publicCrypted = publicCrypted
				return DB
			})
	},

	addAccount: function(DB, password, name, seed)
	{
		return new Promise(function(success, failure) {
			database._checkOpened(DB)
			database._checkAccountDoesntExist(DB, name)

			try {
				var keypair = sdk.Keypair.fromSecret(seed)
				var publicKey = keypair.publicKey(keypair)
			} catch(error) {
				console.log(error)
				failure(new Error("Invalid seed"))
			}

			database._checkPassword(DB, password)
				.then(function() {
					return encryptObject([name, seed], password)
				})
				.then(function(cryptedSeed){
					DB.private.push(cryptedSeed)
					DB.public[name] = publicKey
					return database._updatePublicCrypted(DB, password)
				})
				.then(success)
				.catch(failure)

		})
	},

	_accountIndex: function(DB, name) {
		database._checkAccountExist(DB, name)
		return Object.keys(DB.public).indexOf(name)
	},

	_checkSeedAndPass: function(DB, password, name) {
		return new Promise(function(success, failure){
			var index = database._accountIndex(DB, name)
			decryptObject(DB.private[index], password)
				.then(function(seedObject) {
					if(name = seedObject[0]) success(seedObject[1])
					else {
						failure(new Error("Corrupted database. This should not happen.\n" +
							"please contact developpers for further help."))
					}
				})
				.catch(function(error) {
					console.log(error)
					failure(new Error("Wrong password"))
				})
		})
	},

	removeAccount: function(DB, password, name) {
		return database._checkSeedAndPass(DB, password, name)
			.then(function() {
				var index = database._accountIndex(DB, name)
				delete DB.public[name]
				DB.private.splice(index, 1)
				return database._updatePublicCrypted(DB, password)
			})
	},

	listAccounts: function(DB) {
		database._checkOpened(DB)
		return Object.keys(DB.public).slice(1)
	},

	publicKey: function(DB, name) {
		database._checkAccountExist(DB, name)
		return DB.public[name]
	},

	secretSeed: function(DB, password, name) {
		return database.open(DB, password)
			.then(function(DB) {
				return database._checkSeedAndPass(DB, password, name)
			})
	},

	keypair: function(DB, password, name) {
		return database.secretSeed(DB, password, name)
			.then(function(secretSeed) {
				return sdk.Keypair.fromSecret(secretSeed)
			})
	},

	_checkDB: function(DB) {
		if(!DB.publicCrypted || !DB.private) throw new Error("Invalid database")
	},

	_checkNonEmptyPassword: function(password) {
		if(!password) throw new Error("Missing password")
	},

	_checkPassword: function(DB, password)
	{
		return new Promise(function(success, failure) {
			database._checkDB(DB)
			database._checkNonEmptyPassword(password)
			decryptString(DB.publicCrypted, password)
				.then(success)
				.catch(function(){ failure(new Error("Invalid password")) })
		})
	},

	_checkNonEmptyName: function(name) {
		if(!name) throw new Error("Missing name")
	},

	_checkAccountExist: function(DB, name)
	{
		database._checkNonEmptyName(name)
		database._checkOpened(DB)
		if(!DB.public[name]) throw new Error("Account doesn't exist: " + name)
	},

	_checkAccountDoesntExist : function(DB, name)
	{
		database._checkNonEmptyName(name)
		if(DB.public[name]) throw new Error("Account already exists: " + name)
	},

	_checkOpened: function(DB) {
		database._checkDB(DB)
		if(!DB.public) throw new Error("Database is not open")
	}
}


/*** User Interface ***/

var accounts =
{
	DB: null,

	load: function(password)
	{
		var DB = database.fromString(localStorage.accounts, password)
		return database.open(DB, password).then(function(DB) {
				accounts.DB = DB
				return DB
			})
	},

	save: function(DB)
	{
		if(!DB) DB = accounts.DB
		var string = database.toString(DB)
		localStorage.accounts = string
	},

	current: function() {
		var index = localStorage.index
		var current = database.listAccounts(accounts.DB)[index - 1]
		return current
	},

	select: function(account) {
		var index = database._accountIndex(accounts.DB, account)
		localStorage.index = index
	},

	create: function(name, password) {
		var keypair = sdk.Keypair.random()
		return database.addAccount(accounts.DB, password, name, keypair.secret())
			.then(function() { accounts.save() })
	},

	checkPassword: function(password) {
		return database._checkPassword(accounts.DB, password)
	},

	checkAccountDoesntExist: function(name) {
		database._checkAccountDoesntExist(accounts.DB, name)
	}
}

var UI = {
	init: function() {
		global.query = location.search
		node.grab("sorry").style.display = "none"
		UI.showSetting(node.grab("accountInfo"))

		if(localStorage.accounts) { UI.login() }
		else { UI.firstWelcome() }
	},

	about: function() {
		node.grab("title").style.display = "block"
		node.grab("header").style.display = "none"
		node.grab("main").style.display = "none"
		node.grab("welcome").style.display = "block"
		node.grab("aboutLink").style.display = "none"
		node.grab("gotItLink").onclick = UI.closeAbout
		scroll(0,0)
	},

	closeAbout: function()
	{
		node.grab("title").style.display = "none"
		node.grab("header").style.display = "block"
		node.grab("main").style.display = "block"
		node.grab("welcome").style.display = "none"
		node.grab("aboutLink").style.display = "block"
		scroll(0,0)
	},

	firstWelcome: function() {
		node.grab("welcome").style.display = "block"
		scroll(0,0)
	},

	signIn: function() {
		node.grab("welcome").style.display = "none"
		node.grab("signIn").style.display = "block"
		scroll(0,0)

		var form = new Form(node.grab("signIn"))
		form.addSeparator()
			.addLabel("Please choose a password")
			.putErrorNode()
			.addPasswordBox("password1", "New password")
			.addPasswordBox("password2", "New password confirmation")
			.addSubmit()
			.addValidator(function(){
				var password = form.inputs.password1.value
				var confirmation = form.inputs.password2.value
				if(password != confirmation) throw new Error("Password mismatch")
				database.create(password)
					.then(function(DB){
						accounts.DB = DB
						return accounts.create("(test) New Account", password)
					})
					.then(function(){
						accounts.save()
						accounts.select("(test) New Account")
						node.grab("signIn").style.display = "none"
						UI.open()
					})
			})
	},

	login: function() {
		var popupNode = popup.create("Welcome back!", "Please enter your password to start")
		node.grab("shadow").style.opacity = 0
		node.grab("shadow").onclick = null
		node.grab("settingPanel").classList.remove("blur")
		node.grab("disclaimer").style.display = "block"

		var form = new Form(popupNode)
		form.addPasswordBox("password", "Authenticator password")
			.addSubmit("Open")
			.select()
			.addValidator(function(){ return accounts.load(form.inputs.password.value) })
			.addValidator(function(){
				popup.destroy()
				UI.open()
			})
	},

	open: function() {
		node.grab("title").style.display = "none"
		node.grab("header").style.display = "block"
		node.grab("main").style.display = "block"
		node.grab("disclaimer").style.display = "none"
		node.grab("aboutLink").style.display = "block"
		scroll(0,0)

		UI.refreshHeader()

	},

	setQuery: function(query) {
		if(history && history.replaceState) {
			history.replaceState(
				{},
				"Stellar Authenticator",
				location.href.substr(0, location.href.length - location.search.length) + query
			)
		}
		global.query = query
	},

	handleQuery: function(){
		if(global.query.length > 2) {
			UI.parseQuery(global.query)
		} else if(global.xdr) {
			UI.parseXdr(global.xdr)
		} else {
			UI.makeOpeningForms()
		}
		scroll(0,0)
	},

	parseQuery: function(query){
		node.clear(node.grab("forms"))
		node.grab("openTransaction").style.display = "none"
		node.grab("readTransaction").style.display = "block"
		node.grab("closeTransaction").style.display = "block"

		var account = accounts.current()
		var network = accountNetwork(account)
		var publicKey = database.publicKey(accounts.DB, account)
		global.cosmicLink = new CosmicLink(query, network, publicKey)
		UI.setQuery(query)

		UI.makeUrlViewer("https://cosmic.link/" + query)

		accountExist(publicKey, network)
			.then(function(bool) {
				if(bool) UI.makeSigningInterface()
				else UI.makeXdrViewer("Can't compute XDR when account is empty.", "error")
			})
	},

	parseXdr: function(xdr) {
		node.clear(node.grab("forms"))
		node.grab("openTransaction").style.display = "none"
		node.grab("readTransaction").style.display = "block"
		node.grab("closeTransaction").style.display = "block"

		var account = accounts.current()
		var network = accountNetwork(account)
		var publicKey = database.publicKey(accounts.DB, account)
		global.cosmicLink = new CosmicLink(xdr, network, publicKey)
		global.xdr = xdr

		var viewer = UI.makeUrlViewer("Not yet available")
		viewer.inputs.url.disabled = true
		viewer.inputs.url.onclick = null

		accountExist(publicKey, network)
			.then(function(bool) {
				if(bool) UI.makeSigningInterface()
			})
	},

	makeSigningInterface: function(){
		var viewer = UI.makeXdrViewer("Computing...", "computing")
		var xdrBox = viewer.inputs.xdr
		global.cosmicLink.getXdr()
			.then(function(xdr) {
				xdrBox.value = xdr
				xdrBox.disabled = false
				xdrBox.onclick = function(){ node.copyContent(xdrBox) }
				UI.makeSigningButtons()
			})
			.catch(function(error) {
				xdrBox.value = error
			})
	},

	makeUrlViewer: function(url) {
		var form = new Form(node.grab("forms"))
		form.addSeparator()
			.addLabel("Cosmic Link / Transaction URL")
			.addTextBox("url")

		var urlBox = form.inputs.url
		urlBox.readOnly = true
		urlBox.value = url
		urlBox.onclick = function(){ node.copyContent(urlBox) }

		return form
	},

	makeXdrViewer: function(xdr) {
		var form = new Form(node.grab("forms"))
		form.addSeparator()
			.addLabel("Transaction XDR")
			.addTextArea("xdr", "", 3)

		var xdrBox = form.inputs.xdr
		xdrBox.readOnly = true
		xdrBox.value = xdr
		xdrBox.disabled = true

		return form
	},

	makeSigningButtons: function() {
		var form = new Form(node.grab("forms"))
		form.addSeparator()
			.putErrorNode()
			.addSubmit("Sign & send")
			.select()
			.addValidator(function() {
				popup.password("Sign & send transaction", function(password){
					form.inputs.submit.disabled = true
					var seedPromise = database.secretSeed(accounts.DB, password, accounts.current())
					seedPromise
						.then(function(seed) {
							return global.cosmicLink.sign(seed)
						})
						.then(function() {
							global.cosmicLink.send()
						})
				})
			})
	},

	closeTransaction: function() {
		UI.setQuery("")
		global.xdr = null
		UI.handleQuery()
		return false
	},


	makeOpeningForms: function(){
		node.grab("openTransaction").style.display = "block"
		node.grab("readTransaction").style.display = "none"
		node.grab("closeTransaction").style.display = "none"
		node.clear(node.grab("forms"))

		UI.makeUrlForm()
		UI.makeXdrForm()
	},

	makeUrlForm: function() {
		var form = new Form(node.grab("forms"))
		form.addSeparator()
			.addLabel("Cosmic Link / Transaction URL")
			.putErrorNode()
			.addTextBox("url", "Copy here")
			.addSubmit("Open")
			.addValidator(function() {
				var a = node.create("a")
				a.href = form.inputs.url.value
				if(a.search.length < 2) throw new Error("Not a transaction link")
				UI.parseQuery(a.search)
			})
	},

	makeXdrForm: function() {
		var form = new Form(node.grab("forms"))
		form.addSeparator()
			.addLabel("Transaction XDR")
			.putErrorNode()
			.addTextArea("xdr", "Copy here", 3)
			.addSubmit("Open")
			.addValidator(function() {
				try {
					var xdr = form.inputs.xdr.value
					var transaction = new sdk.Transaction(xdr)
					UI.parseXdr(xdr)
				} catch(error) {
					console.log(error)
					throw new Error("Invalid XDR")
				}
			})
	},

	showMenu: function() {
		node.grab("settings").style.display = "block"
		node.grab("settingPanel").style.minHeight = "100%"
		node.grab("settingPanel").style.position = "absolute"
		node.grab("main").style.display = "none"
		node.grab("menuButton").onclick = UI.hideMenu
		scroll(0,0)
	},

	hideMenu: function() {
		node.grab("settings").style.display = "none"
		node.grab("settingPanel").style.minHeight = null
		node.grab("settingPanel").style.position = "fixed"
		node.grab("main").style.display = "block"
		node.grab("menuButton").onclick = UI.showMenu
		scroll(0,0)
	},

	resetMenu: function() {
		node.grab("settings").reset()
		UI.hideSecret()
	},

	showSetting: function(setting) {
		UI.resetMenu()
		if(global.setting) global.setting.style.display = "none"
		global.setting = setting
		setting.style.display = "block"
	},

	selectAccount: function(account) {
		if(!account) {
			var accountSelector = node.grab("accounts")
			account = accountSelector.options[accountSelector.selectedIndex].value
		}

		accounts.select(account)
		UI.refreshHeader(account)
		UI.resetMenu()
	},

	showSecret: function() {
		var account = accounts.current()
		popup.password("Show secret seed for " + account, function(password) {
			return database.secretSeed(accounts.DB, password, account)
				.then(function(secret) {
					var secretBox = node.grab("secretSeed")
					secretBox.value = secret
					secretBox.style.display = "block"
					var button = node.grab("switchSecret")
					button.onclick = UI.hideSecret
					button.value = "Hide secret seed"
				})
		})
	},

	hideSecret: function() {
		var seedBox = node.grab("secretSeed")
		seedBox.value = null
		seedBox.style.display = "none"
		var button = node.grab("switchSecret")
		button.onclick = UI.showSecret
		button.value = "Show secret seed"
	},

	removeAccount: function() {
		var account = accounts.current()

		var messageNode = node.create("div")
		node.append(messageNode, "Remove account " + account)
		node.append(messageNode, node.create("hr"))
		node.append(messageNode, "Warning: if you didn't backed up this account " +
			"you'll completely loose access to the funds on it (if any).")

		popup.password(messageNode,function(password) {
			return database.removeAccount(accounts.DB, password, account)
				.then(function() {
					accounts.save()
					localStorage.index = 1
					UI.refreshHeader()
					UI.hideMenu()
				})

		})
	},

	importSeed: function() {
		var popupNode = popup.create("Import account", "Please enter following information")
		var form = new Form(popupNode)

		form.addTextBox("name", "Account name")
			.addTextBox("seed", "Secret seed")
			.addPasswordConfirmation()
			.select()
			.addValidator(function(){
				accounts.checkAccountDoesntExist(form.inputs.name.value)
			})
			.addValidator(function(){ checkSecretSeed(form.inputs.seed.value) })
			.addValidator(function() {
				var name = form.inputs.name.value,
					password = form.inputs.password.value,
					seed = form.inputs.seed.value

				return database.addAccount(accounts.DB, password, name, seed)
					.then(function(){
						accounts.save()
						UI.selectAccount(name)
						UI.hideMenu()
						popup.destroy()
					})
			})
	},

	createNewAccount: function() {
		var box = popup.create("Create new account",  "Please enter following information")
		var form = new Form(box)

		form.addTextBox("name", "Account name")
			.addPasswordConfirmation()
			.select()
			.addValidator(function(){
				accounts.checkAccountDoesntExist(form.inputs.name.value)
			})
			.addValidator(function() {
				var name = form.inputs.name.value,
					password = form.inputs.password.value

				return accounts.create(name, password)
					.then(function() {
						UI.selectAccount(name)
						UI.hideMenu()
						popup.destroy()
					})
			})
	},

	refreshHeader: function() {
		var accountSelector = node.grab("accounts")

		// Clear box content before populate it again.
		while(accountSelector.options.length){ accountSelector.remove(0) }

		// Generate box content.
		var accountsNames = database.listAccounts(accounts.DB).reverse()
		var current = accounts.current()
		while(accountsNames.length) {
			var next = accountsNames.pop()
			var accountNode = node.create("option")
			accountNode.textContent = next
			accountNode.value = next
			if(next == current) { accountNode.selected = "selected" }
			node.append(accountSelector, accountNode)
		}
		UI.refreshPublicKey(current)
	},

	refreshPublicKey: function(accountName) {
		node.grab("loadingAccount").style.display = "block"
		node.grab("emptyAccount").style.display = "none"

		var publicKey = database.publicKey(accounts.DB, accountName)
		node.grab("publicKey").value = publicKey
		accountExist(publicKey, accountNetwork(accountName))
			.then(function(bool) {
				node.grab("loadingAccount").style.display = "none"
				if(bool) {
				} else {
					node.grab("emptyAccount").style.display = "block"
				}
			})

		UI.handleQuery()
	},
}

var popup =
{
	current: null,

	show: function(el, exitThunk)
	{
		popup.hide()
		var shadow = node.grab("shadow")
		if(exitThunk) shadow.onclick = exitThunk
		else shadow.onclick = popup.hide
		shadow.style.display = "block"
		el.style.display = "block"
		popup.current = el
		node.appendClass(node.grab("settingPanel"), "blur")
		node.appendClass(node.grab("main"), "blur")
		node.grab("body").style.overflow = "hidden"
	},

	hide: function()
	{
		if(popup.current) {
			popup.current.style.display = "none"
			var shadow = node.grab("shadow")
			shadow.style.display= "none"
			popup.current = null
			node.grab("settingPanel").classList.remove("blur")
			node.grab("main").classList.remove("blur")
			node.grab("body").style.overflow = "auto"
		}
	},

	create: function(title, message, exitThunk) {
		var popupNode = node.create("div", "popup")

		var titleNode = node.create("span", "title")
		node.append(titleNode, title)
		node.append(popupNode, titleNode)

		var contentNode = node.create("div", "content")
		node.append(popupNode, contentNode)

		var messageNode = node.create("p", "message")
		node.append(messageNode, message)
		node.append(contentNode, messageNode)

		node.append(node.grab("body"), popupNode)
		popup.show(popupNode, exitThunk || popup.destroy)
		return contentNode
	},

	destroy: function()
	{
		var popupNode = popup.current
		popup.hide()
		node.destroy(popupNode)
	},

	message: function(title, message) {
		return new Promise(function(success) {
			var popupNode = popup.create(title, message)
			var form = new Form(popupNode)
			form.addCloseButton().addValidator(success)
		})
	},

	error: function(message) { popup.message("Error", message) },

	password: function(operation, continuation) {
		var popupNode = popup.create("Confirm operation", operation)
		var form = new Form(popupNode)
		form.addPasswordConfirmation("password")
			.select()
			.addValidator(function(){ return continuation(form.inputs.password.value) })
			.addValidator(popup.destroy)
	},
}

var Form = (function wrapper() {

	function _classCallCheck(instance, Constructor) {
		if(!(instance instanceof Constructor)){
			throw new TypeError("Cannot call a class as a function")
		}
	}

	function constructor(parent) {
		_classCallCheck(this, Form)

		var form = this

		form.node = node.create("form")
		form.node.autocomplete = "off"
		if(parent) node.append(parent, form.node)

		form.errorNode = node.create("span", "error")
		form.errorNode.style.display = "none"
		node.append(form.node, form.errorNode)

		form.node.onsubmit = function() {
			form.errorNode.style.display = "none"
			validate(form, form.validators)
			return false
		}

		form.inputs = {}
		form.validators = []

		form.addValidator = function(thunk) { addValidator(form, thunk); return form }
		form.putErrorNode = function() { putErrorNode(form); return form }
		form.select = function() {
			var firstInput = form.node.getElementsByTagName("input")[0]
			if(firstInput) {
				firstInput.focus()
				firstInput.select()
			}

		// This strange hack allow loading animation to be displayed
		addValidator(form, function(){
			return new Promise(function(success) {
				setTimeout(success, 20)
			})
		})


		return form
		}


		form.addInput = function(name, type) { addInput(form, name, type); return form }
		form.addButton = function(name, text, continuation) { addButton(form, name, text, continuation); return form }
		form.addSubmit = function(text) { addSubmit(form, text); return form }
		form.addTextBox = function(name, placeHolder) { addTextBox(form, name, placeHolder); return form }
		form.addPasswordBox = function(name, placeHolder) { addPasswordBox(form, name, placeHolder); return form }

		form.optional = function(nameArray) { optional(form, nameArray); return form }

		form.addNode = function(tag, name) { addNode(form, tag, name); return form }
		form.addSeparator = function() { addSeparator(form); return form }
		form.addLabel = function(text) { addLabel(form, text); return form }
		form.addTextArea = function(name, placeHolder, rows) { addTextArea(form, name, placeHolder, rows); return form }

		/*** Custom ***/
		form.addCloseButton = function() { addCloseButton(form); return form }
		form.addCancelConfirmButtons = function() { addCancelConfirmButtons(form); return form }
		form.addPasswordConfirmation = function(name) { addPasswordConfirmation(form, name); return form }
	}

	function addCloseButton() {
		addSubmit(form, "close")
		form.inputs.submit.focus()
	}


	function addCancelConfirmButtons(form) {
		addButton(form, "cancel", "✖ Cancel", popup.destroy)
		addSubmit(form)
	}

	function addPasswordConfirmation(form, name) {
		addSeparator(form)
		addPasswordBox(form, name || "password", "Authenticator password")
		addCancelConfirmButtons(form)
	}


	/*** End of custom ****/

	function setError(form, error) {
		if(error.message) form.errorNode.textContent = error.message
		else form.errorNode.textContent = error
		form.errorNode.style.display = "block"
		return form
	}

	function validate(form, validators, anim) {
		if(!anim && form.inputs.submit) {
			var anim = node.create("span", "loadingAnim")
			anim.style.position = "fixed"
			node.append(form.inputs.submit, anim)
		}

		while(validators.length) {
			try {
				var temp = validators[0]()
				validators = validators.slice(1)
			}
			catch(error) {
				console.log(error)
				setError(form, error)
				break
			}
			if(temp instanceof Promise) {
				temp.then(function(){ validate(form, validators, anim) })
					.catch(function(error) {
						console.log(error)
						setError(form, error)
						if(anim) node.destroy(anim)
					})
				return
			}
		}
		if(anim) node.destroy(anim)
	}

	function addValidator(form, thunk) {
		form.validators.push(thunk)
	}

	function putErrorNode(form) {
		node.append(form.node, form.errorNode)
	}

	function addNode(form, tag, name) {
		var element = node.create(tag)
		node.append(form.node, element)
		if(name) {
			element.id = name
			form.inputs[name] = element
		}
		return element
	}

	function addLabel(form, text) {
		var element = addNode(form, "label")
		element.textContent = text
	}

	function addTextArea(form, name, placeHolder, rows) {
		var textArea = addNode(form, "textarea", name)
		textArea.placeholder = placeHolder
		textArea.rows = rows
	}

	function addInput(form, name, type) {
		var input = addNode(form, "input", name)
		input.type = type
		input.required = true
		return input
	}

	function addButton(form, name, text, continuation) {
		var button = addInput(form, name, "button")
		button.value = text
		button.onclick = continuation
	}

	function addSubmit(form, text) {
		addNode(form, "button", "submit")
		form.inputs.submit.type = "submit"
		form.inputs.submit.textContent = text || "✔ Confirm"
	}

	function addTextBox(form, name, placeHolder) {
		addInput(form, name, "text")
		if(placeHolder) form.inputs[name].placeholder = placeHolder
	}

	function addPasswordBox(form, name, placeHolder) {
		addInput(form, name, "password")
		if(placeHolder) form.inputs[name].placeholder = placeHolder
	}

	function addSeparator(form) {
		node.append(form.node, node.create("hr"))
	}

	function optional(form, nameArray) {
		for(var index in nameArray) {
			var name = nameArray[index]
			form.inputs[name].required = false
		}
	}

	return constructor
}) ()


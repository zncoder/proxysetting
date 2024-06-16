let allowed

async function setUI() {
	let badge = ""
	let title = ""
	if (!allowed) {
		badge = "⚠"
		title = "need permission in private browsing to control proxy"
	} else {
		let res = await browser.proxy.settings.get({})
		switch (res.levelOfControl) {
		case "controlled_by_this_extension":
			badge = "Dir"
			title = "proxy disabled"
			break
		case "controllable_by_this_extension":
			badge = "Pry"
			title = "proxy restored"
			break
		case "controlled_by_other_extensions":
			badge = "..."
			title = "proxy controlled by other extensions"
		case "not_controllable":
			badge = "⚠"
			title = "need permission in private browsing to control proxy"
		}
	}
	await browser.browserAction.setBadgeText({text: badge})
	await browser.browserAction.setTitle({title: title})
}

async function storedState(op) {
	key = 'controlled_by_this_extension'
	switch (op) {
	case 'set':
		obj = {}
		obj[key] = true
		await browser.storage.local.set(obj)
		break
	case 'remove':
		await browser.storage.local.remove(key)
		break
	case 'get':
		let saved = await browser.storage.local.get(key)
		return saved[key]
	}
}

async function toggleState() {
	let res = await browser.proxy.settings.get({})
	switch (res.levelOfControl) {
	case "controlled_by_this_extension":
		// reset to default
		await browser.proxy.settings.clear({})
		await storedState('remove')
		break
	case "controllable_by_this_extension":
		// disable proxy
		await browser.proxy.settings.set({value: {proxyType: "none"}})
		await storedState('set')
		break
	}
	await setUI()
}

async function restoreState() {
	let controlled = await storedState('get')
	if (controlled) {
		await browser.proxy.settings.set({value: {proxyType: "none"}})
	}
}

async function init() {
	allowed = await browser.extension.isAllowedIncognitoAccess()
	if (allowed) {
		await browser.browserAction.onClicked.addListener(toggleState)
		await restoreState()
	}
	await setUI()
}

init()

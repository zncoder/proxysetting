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

async function setState() {
	let res = await browser.proxy.settings.get({})
	switch (res.levelOfControl) {
	case "controlled_by_this_extension":
		// reset to default
		await browser.proxy.settings.clear({})
		break
	case "controllable_by_this_extension":
		// disable proxy
		await browser.proxy.settings.set({value: {proxyType: "none"}})
		break
	}
	await setUI()
}

async function init() {
	allowed = await browser.extension.isAllowedIncognitoAccess()
	if (allowed) {
		await browser.browserAction.onClicked.addListener(setState)
	}
	await setUI()
}

init()

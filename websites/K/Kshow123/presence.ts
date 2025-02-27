const presence = new Presence({
		clientId: "614388233886760972",
	}),
	strings = presence.getStrings({
		play: "general.playing",
		pause: "general.paused",
	});

let browsingTimestamp = Math.floor(Date.now() / 1000),
	iFrameVideo: boolean,
	currentTime: number,
	duration: number,
	paused: boolean,
	lastPlaybackState: boolean,
	playback: boolean;

interface IFrameData {
	iframeVideo: {
		dur: number;
		iFrameVideo: boolean;
		paused: boolean;
		currTime: number;
	};
}

if (document.location.pathname.includes(".html")) {
	presence.on("iFrameData", (data: IFrameData) => {
		if (data.iframeVideo.dur) {
			({
				iFrameVideo,
				paused,
				currTime: currentTime,
				dur: duration,
			} = data.iframeVideo);
		}
	});
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: "https://i.imgur.com/xYJbv9k.png",
	};

	presenceData.startTimestamp = browsingTimestamp;

	if (lastPlaybackState !== playback) {
		lastPlaybackState = playback;
		browsingTimestamp = Math.floor(Date.now() / 1000);
	}

	if (
		document.location.pathname.includes(".html") &&
		document.location.pathname.includes("/pages/")
	) {
		presenceData.details = "Reading the FAQs";
		presenceData.smallImageKey = "reading";
	} else if (document.location.pathname.includes(".html")) {
		if (iFrameVideo === true && !isNaN(duration)) {
			presenceData.smallImageKey = paused ? "pause" : "play";
			presenceData.smallImageText = paused
				? (await strings).pause
				: (await strings).play;
			[presenceData.startTimestamp, presenceData.endTimestamp] =
				presence.getTimestamps(Math.floor(currentTime), Math.floor(duration));

			const views = document.querySelector(
				"#player > div.alert.alert-info.hidden-xs > div.media > div > p:nth-child(7)"
			);
			presenceData.details = document.querySelector(
				"#player > div.alert.alert-info.hidden-xs > div.media > div > a > h1"
			).textContent;

			const air = document.querySelector(
					"#player > div.alert.alert-info.hidden-xs > div.media > div > p:nth-child(9)"
				),
				air2 = document.querySelector(
					"#player > div.alert.alert-info.hidden-xs > div.media > div > p:nth-child(8)"
				);

			if (air && air.textContent.includes("Air on:")) {
				presenceData.state = `${views.textContent.replace(
					"Status: ",
					""
				)}, ${air.textContent.replace("Air", "Aired")}`;
			} else if (air2 && air2.textContent.includes("Air on:")) {
				presenceData.state = `${views.textContent.replace(
					"Status: ",
					""
				)}, ${air2.textContent.replace("Air", "Aired")}`;
			} else presenceData.state = views.textContent;

			if (paused) {
				delete presenceData.startTimestamp;
				delete presenceData.endTimestamp;
			}
		} else if (iFrameVideo === null && isNaN(duration)) {
			presenceData.details = "Looking at: ";
			presenceData.state = document.querySelector(
				"#player > div.alert.alert-info.hidden-xs > div.media > div > a > h1"
			).textContent;
			presenceData.smallImageKey = "reading";
		}
	} else {
		switch (document.location.pathname) {
			case "/": {
				presenceData.details = "Browsing through";
				presenceData.state = "the main page";
				presenceData.smallImageKey = "reading";

				break;
			}
			case "/show/latest/": {
				presenceData.details = "Browsing through";
				presenceData.state = "the latest shows";
				presenceData.smallImageKey = "reading";

				break;
			}
			case "/show/popular/": {
				presenceData.details = "Browsing through";
				presenceData.state = "the most popular shows";
				presenceData.smallImageKey = "reading";

				break;
			}
			case "/show/rated/": {
				presenceData.details = "Browsing through";
				presenceData.state = "the highest rated shows";
				presenceData.smallImageKey = "reading";

				break;
			}
			case "/show/": {
				presenceData.details = "Browsing through";
				presenceData.state = "a list of all shows";
				presenceData.smallImageKey = "reading";

				break;
			}
			default:
				if (document.location.pathname.includes("/show/")) {
					presenceData.details = "Browsing through all episodes of:";
					presenceData.state = document.querySelector(
						"#info > div.media > div > h1 > a"
					).textContent;
					presenceData.smallImageKey = "reading";

					presence.setActivity(presenceData);
				} else if (document.location.pathname.includes("/search/")) {
					presenceData.details = "Searching for:";
					presenceData.state = document.querySelector(
						"#featured > div.page-header > h3"
					).textContent;
					presenceData.smallImageKey = "search";
				}
		}
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});

let isHandlingPage = false;

function playIfPaused(video) {
    if (!video) return;

    video.muted = true;
    video.playbackRate = 2.0;

    const tryPlay = () => {
        if (video.ended) {
            console.log("✅ Video ended. Letting site handle next page...");

            clearInterval(interval);

            setTimeout(() => {
                console.log("🔁 Checking new page after video...");
                observeForVideoOrReading();
            }, 7000);

            return;
        }

        if (video.paused) {
            video.play().catch(err => console.log("Playback Error:", err));
        }

        if (video.playbackRate !== 2.0) {
            video.playbackRate = 2.0;
        }
    };

    tryPlay();
    const interval = setInterval(tryPlay, 2000);
}


function simulateClick(elem) {
    if (!elem) return;
    elem.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    elem.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    elem.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    elem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

function skipReadingPageIfNoVideo() {
    if (isHandlingPage) return;
    isHandlingPage = true;

    console.log("📝 No video found. Handling reading page...");

    const buttons = [...document.querySelectorAll('button')].filter(btn =>
        btn.querySelector('.cds-button-label')
    );

    const markCompleteBtn = buttons.find(btn =>
        btn.querySelector('.cds-button-label').innerText.toLowerCase().includes('mark as complete')
    );

    if (markCompleteBtn && !markCompleteBtn.disabled) {
        console.log("✅ Clicking 'Mark as complete'...");
        simulateClick(markCompleteBtn);

        setTimeout(() => {
            const nextBtn = buttons.find(btn =>
                /next|continue/i.test(btn.querySelector('.cds-button-label').innerText)
            );

            if (nextBtn) {
                console.log("➡️ Clicking 'Next' after 'Mark as complete'...");
                simulateClick(nextBtn);
            } else {
                console.log("⚠️ No 'Next' button found after 'Mark as complete'");
            }

            setTimeout(() => { isHandlingPage = false; }, 5000);
        }, 1500);

    } else {
        if (!markCompleteBtn) {
            console.log("❌ 'Mark as complete' button not found.");
        } else {
            console.log("❌ 'Mark as complete' button is disabled.");
        }

        const nextBtn = buttons.find(btn =>
            /next|continue/i.test(btn.querySelector('.cds-button-label').innerText)
        );

        if (nextBtn) {
            console.log("➡️ Clicking 'Next' directly as fallback...");
            simulateClick(nextBtn);
            setTimeout(() => { isHandlingPage = false; }, 5000);
        } else {
            console.log("❌ No 'Next' button found.");
            isHandlingPage = false;
        }
    }
}


function observeForVideoOrReading() {
    const video = document.querySelector('video');
    if (video) {
        console.log("🎬 Video detected (on immediate check).");
        playIfPaused(video);
        return;
    }

    setTimeout(() => {
        const stillNoVideo = !document.querySelector('video');
        if (stillNoVideo) {
            console.log("📝 No video found (on immediate check).");
            skipReadingPageIfNoVideo();
        }
    }, 1000);

    const observer = new MutationObserver(() => {
        const vid = document.querySelector('video');
        if (vid) {
            console.log("🎬 Video detected (via observer).");
            playIfPaused(vid);
            observer.disconnect();
        } else {
            console.log("👀 No video via observer yet...");
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

observeForVideoOrReading();

setInterval(observeForVideoOrReading, 5000);

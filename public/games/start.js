window.onload = function() {
    const nextButton = document.getElementById("next");
    const blinkingRozxie = document.getElementById("rozxie");
    const oilSpillNav = document.getElementById("oilSpill");
    const screens = ['start', 'litter', 'coral', 'marine', 'kelpie', 'curse', 'breakcurse'];
    const scream = document.getElementById("scream");
    const bgm = document.getElementById("bgm");
    const introScene = document.getElementById("introScene");
    const progressFill = document.getElementById("progressFill");
    const stepLabel = document.getElementById("stepLabel");
    
    let i = 0;

    const updateProgress = (step) => {
        const ratio = Math.min(step / screens.length, 1);
        progressFill.style.width = `${Math.round(ratio * 100)}%`;
        stepLabel.textContent = `Scene ${step} / ${screens.length}`;
    };

    const armBackgroundAudio = () => {
        if (!bgm) return;
        bgm.play().catch(() => {
            // Browser may still block autoplay until a valid interaction.
        });
    };

    document.body.addEventListener("pointerdown", armBackgroundAudio, { once: true });
    document.body.addEventListener("keydown", armBackgroundAudio, { once: true });

    updateProgress(0);

    nextButton.addEventListener("click", () => {
        if (i >= screens.length) return;

        if (i !== 0) {
            document.getElementById(screens[i - 1]).style.display = "none";
        }

        if (i === 0 && introScene) {
            introScene.style.display = "none";
        }

        if (i === 1 && blinkingRozxie) {
            blinkingRozxie.style.display = "none";
        }

        document.getElementById(screens[i]).style.display = "flex";
        if (screens[i] === "curse") scream.play();
        i++;

        updateProgress(i);

        if (i === screens.length) {
            nextButton.style.display = "none";
            oilSpillNav.style.display = "block";
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            if (nextButton.style.display !== "none") {
                event.preventDefault();
                nextButton.click();
            }
        }
    });
};
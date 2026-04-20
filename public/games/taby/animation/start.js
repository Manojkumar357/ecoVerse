window.onload = function() {
    const nextButton = document.getElementById("next");
    const blinkingRozxie = document.getElementById("rozxie");
    const screens = ['start', 'first', 'second', 'third']
    
    let i = 0;

    nextButton.addEventListener("click", () => {
        i++;
        if (i !== 0) document.getElementById(screens[i-1]).style.display = "none";
        if (i == 1) blinkingRozxie.style.display = "none";
        document.getElementById(screens[i]).style.display = "flex";
        if (i+1 == screens.length) {
            console.log(screens.length)
            nextButton.style.display = "none";
        } 
    })
}
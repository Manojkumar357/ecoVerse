window.onload = function () {
    const bin = document.querySelector("#binImg");
    const dragItems = document.querySelectorAll(".draggable");
    const gameObjects = document.querySelector(".gameObjects");
    const gameContainer = document.getElementById("gameContainer");
    const happyEnd = document.getElementById("happy-end");
    const yay = document.getElementById("yay");
    const startButton = document.getElementById("startBtn");
    const modal = document.querySelector(".modal");

    startButton.addEventListener("click", function() {
        modal.style.display = "none";
    })

    var numTrashDropped = 0;
    var numTrash = dragItems.length;

    for (var i = 0; i < dragItems.length; i++) {
        let el = dragItems[i];
        el.addEventListener(
            "dragstart",
            function (e) {
                e.dataTransfer.effectAllowed = "copy";
                e.dataTransfer.setData("Text", this.id);
            }
        );
    }

    bin.addEventListener(
        "dragover",
        function (e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.dataTransfer.dropEffect = "copy";
        }
    );

    bin.addEventListener(
        "drop",
        function (e) {
            e.preventDefault();
            var el = document.getElementById(e.dataTransfer.getData("Text"));
            gameObjects.removeChild(el);
            numTrashDropped++;

            if (numTrashDropped === numTrash) {
                gameContainer.style.display = "none";
                happyEnd.style.display = "flex";
                yay.play();
            }
        }
    );
};

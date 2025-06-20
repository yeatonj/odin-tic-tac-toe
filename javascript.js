const Gameboard = (function () {
    // 0-2 row 1, 3-5 row 2, 6-8 row 3
    const gameState = ["", "", "", "", "", "", "", "", ""];

    // Return true on a valid selection, false otherwise
    const pickSquare = function(marker, loc) {
        if (gameState[loc] === "") {
            gameState[loc] = marker;
            return true;
        }
        return false;
    }

    const checkWin = function() {
        // Condition 1: a player has gotten a row/column/diag
        // Check rows/cols
        for (let i = 0; i < 3; i += 1) {
            // rows
            if ((gameState[3*i] != "") && (gameState[3*i] === gameState[3*i + 1]) && (gameState[3*i] === gameState[3*i + 2])) {
                return gameState[3*i];
            }
            //cols
            if ((gameState[i] != "") && (gameState[i] === gameState[i + 3]) && (gameState[i] === gameState[i + 6])) {
                return gameState[i];
            }
        }
        // Check diags
        if ((gameState[0] != "") && (gameState[0] === gameState[4]) && (gameState[0] === gameState[8])) {
            return gameState[0];
        }
        if ((gameState[2] != "") && (gameState[2] === gameState[4]) && (gameState[2] === gameState[6])) {
            return gameState[2];
        }
        // Condition 2: all squares filled with no winner
        if (gameState.includes("")) {
            return "";
        }
        return "NONE";
    }

    const resetBoard = function() {
        for (let i = 0; i < gameState.length; i++) {
            gameState[i] = "";
        }
    }

    const getBoard = () => gameState;

    return {pickSquare, checkWin, resetBoard, getBoard};
})();

const Player = function(pName) {
    var playerName = pName;
    var score = 0;

    const win = () => score++;
    const getName = () => playerName;
    const getScore = () => score;
    const setName = (name) => {playerName = name;};

    return {win, getName, getScore, setName};
}

const GameController = (function() {
    const players = [Player(""), Player("")];
    const playerMarkers = ['X', 'O'];
    var lastWinner = "";
    var gameState = 1; // 0 -> active game, 1 -> no active game

    var activePlayer = 0;

    function swapActive() {
        activePlayer = (activePlayer + 1) % 2;
    }

    const setPlayerName = (pName, id) => {players[id].setName(pName)};
    const getActivePlayer = () => players[activePlayer].getName();

    const startGame = function() {
        gameState = 0;
        Gameboard.resetBoard();
    }

    // returns true on game over
    const placePiece = function(loc) {
        if (gameState == 1) {
            // no active game
            return;
        }
        // if successful
        if (Gameboard.pickSquare(playerMarkers[activePlayer], loc)) {
            // check for a win
            if (Gameboard.checkWin() === playerMarkers[activePlayer]) {
                players[activePlayer].win();
                gameState = 1;
                lastWinner = players[activePlayer].getName();
                return true;
            } else if (Gameboard.checkWin() === "NONE") {
                // no winner but game over
                gameState = 1;
                lastWinner = undefined;
                return true;
            } else {
                // No winner, swap active player
                swapActive();
                return false;
            }

        } else {
            // not successful, game definitely not over, but don't swap active player
            return false;
        }
    }

    const getStats = () => {return {p0Name : players[0].getName(), 
        p0Score : players[0].getScore(), 
        p1Name : players[1].getName(), 
        p1Score : players[1].getScore()}};

    const getLastWinner = () => lastWinner;

    return {startGame, placePiece, getStats, setPlayerName, getActivePlayer, getLastWinner};
}) ();

const DisplayManager = (function () {
    // set up the new game button
    const gameButton = document.querySelector(".controls button");
    gameButton.addEventListener("click", function () {
        const status = document.querySelector(".status");
        while(status.firstChild){
            status.removeChild(status.firstChild);
        }
        showCurrentTurn();
        hideNewGameButton();
        GameController.startGame();
        drawBoard();
    });


    const getNames = function() {
        const dialog = document.querySelector("dialog");
        const confBut = document.querySelector("dialog button");
        const names = [...document.querySelectorAll("form input")];

        confBut.addEventListener("click", (event) => {
            event.preventDefault();
            dialog.requestClose();
        });

        dialog.addEventListener("close", (e) => {
            GameController.setPlayerName(names[0].value, 0);
            GameController.setPlayerName(names[1].value, 1);
            showStats();
            showCurrentTurn();
        });
        dialog.showModal();
    }

    const drawBoard = function () {
        const boardContainer = document.querySelector(".gameboard");

        while(boardContainer.firstChild){
            boardContainer.removeChild(boardContainer.firstChild);
        }

        const boardState = Gameboard.getBoard();

        for (let i = 0; i < boardState.length; i++) {
            const button = document.createElement("button");
            button.textContent = boardState[i];
            button.classList.add("square");
            button.addEventListener("click", function () {
                if(GameController.placePiece(i)) {
                    showResults();
                    showStats();
                    showNewGameButton();
                } else {
                    showCurrentTurn();
                }
            } );
            button.addEventListener("click", drawBoard);
            boardContainer.appendChild(button);
        }
    }

    const showResults = function () {
        const status = document.querySelector(".status");
        while(status.firstChild){
            status.removeChild(status.firstChild);
        }
        const msg = document.createElement("p");
        if (GameController.getLastWinner() == undefined) {
            msg.textContent = `No winner: Cat's Game...`;
        } else {
            msg.textContent = `${GameController.getLastWinner()} won.`;
        }
        status.appendChild(msg);
    }

    const showStats = function () {
        const stats = document.querySelector(".stats");
        while(stats.firstChild){
            stats.removeChild(stats.firstChild);
        }
        const msg1 = document.createElement("p");
        const msg2 = document.createElement("p");
        msg1.textContent = `${GameController.getStats().p0Name} (Player 1)'s score: ${GameController.getStats().p0Score}`;
        msg2.textContent = `${GameController.getStats().p1Name} (Player 2)'s score: ${GameController.getStats().p1Score}`;
        stats.appendChild(msg1);
        stats.appendChild(msg2);
    }

    function showCurrentTurn() {
        const status = document.querySelector(".status");
        while(status.firstChild){
            status.removeChild(status.firstChild);
        }
        const msg = document.createElement("p");
        msg.textContent = `${GameController.getActivePlayer()}'s turn.`;
        status.appendChild(msg);
    }

    function showNewGameButton() {
        const gameButton = document.querySelector(".controls button");
        gameButton.classList.remove("hidden");
        gameButton.classList.add("visible");
    }

    function hideNewGameButton() {
        const gameButton = document.querySelector(".controls button");
        gameButton.classList.remove("visible");
        gameButton.classList.add("hidden");
    }

    return {getNames, drawBoard, showCurrentTurn};
})();


GameController.startGame();
DisplayManager.drawBoard();
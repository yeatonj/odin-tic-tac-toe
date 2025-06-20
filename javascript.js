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

    var activePlayer = 0;

    function swapActive() {
        activePlayer = (activePlayer + 1) % 2;
    }

    const setPlayerName = (pName, id) => {console.log(players[id].setName(pName))};

    const startGame = function() {
        activePlayer = 0;
        Gameboard.resetBoard();
    }

    // returns true on game over
    const placePiece = function(loc) {
        // if successful
        if (Gameboard.pickSquare(playerMarkers[activePlayer], loc)) {
            // check for a win
            if (Gameboard.checkWin() === playerMarkers[activePlayer]) {
                players[activePlayer].win();
                return true;
            } else if (Gameboard.checkWin() === playerMarkers[activePlayer]) {
                // no winner but game over
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

    return {startGame, placePiece, getStats, setPlayerName};
}) ();
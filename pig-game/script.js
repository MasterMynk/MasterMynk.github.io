"use strict";

const dice = document.getElementById("dice");
const scores = document.getElementsByClassName("score");
const playerConts = document.getElementsByClassName("player-cont");
const currScores = document.getElementsByClassName("curr-score");
const screen = document.getElementById("screen");

const diceStates = ["one", "two", "three", "four", "five", "six"];
const players = 2;

let diceState = undefined;
let activePlayer = 0;
let currScore = 0;
let running = true;
const numScores = Array(players).fill(0);

// Helper functions
const isDiceShowing = () => dice.classList.contains("rolled");
const showDice = () => dice.classList.add("rolled");
const hideDice = () => dice.classList.remove("rolled");
const rollDice = function () {
    const diceState = Math.floor(Math.random() * 6);
    dice.classList.add(diceStates[diceState]);
    return diceState;
};

const switchPlayer = function () {
    playerConts[activePlayer++].classList.remove("active");
    playerConts[(activePlayer %= players)].classList.add("active");
    screen.classList.toggle("other");
};

const incCurrScore = by =>
    (currScores[activePlayer].innerText = String((currScore += by)));
const resetCurrScore = () =>
    (currScores[activePlayer].innerText = String((currScore = 0)));

document.getElementById("new-game-btn").addEventListener("click", () => {
    dice.classList.forEach(className => dice.classList.remove(className));

    for (let i = 0; i < players; ++i) {
        scores[i].innerText = "0";
        numScores[i] = 0;
    }

    resetCurrScore();
    playerConts[activePlayer].classList.remove("winner");
    screen.classList.remove("winner");
    running = true;
    if (activePlayer === 1) switchPlayer();
});

document.getElementById("roll-dice-btn").addEventListener("click", () => {
    if (!running) return;
    if (!isDiceShowing()) showDice();

    if (diceState !== undefined) dice.classList.remove(diceStates[diceState]);

    diceState = rollDice();

    if (diceState === 0) {
        resetCurrScore();
        switchPlayer();
        return;
    }

    incCurrScore(diceState + 1);
});

document.getElementById("hold-btn").addEventListener("click", () => {
    if (!running) return;
    scores[activePlayer].innerText = String(
        (numScores[activePlayer] += currScore)
    );
    resetCurrScore();

    if (numScores[activePlayer] >= 100) {
        screen.classList.add("winner");
        playerConts[activePlayer].classList.add("winner");
        hideDice();
        running = false;
        return;
    }

    switchPlayer();
});

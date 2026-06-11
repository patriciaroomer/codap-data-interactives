export default class CardController {
    constructor() {
        this.attrCard = document.getElementById("attrCard");
        this.classCard = document.getElementById("classCard");
        this.trainCard = document.getElementById("trainCard");
        this.testCard = document.getElementById("testCard");

        this.classInput = document.getElementById("className");
        this.attrInput = document.getElementById("attrName");
        this.trainInput = document.getElementById("trainDataName");
        this.testInput = document.getElementById("testDataName");

        this.unfinishedIcon = "◌ ";
        this.finishedIcon = "✓ ";
        this.lockedIcon = "🔒";

        this.attrApplied = false;
        this.classApplied = false;
    }

    handleAttributeCard() {
        this.attrApplied = true;
        this.finish(this.attrCard);
        this.attrInput.value = "";

        if (!this.classApplied) return;
        this.unlock(this.trainCard);
    }

    handleClassCard() {
        this.classApplied = true;
        this.finish(this.classCard);
        this.classInput.value = "";

        if (!this.attrApplied) return;
        this.unlock(this.trainCard);
    }

    handleTrainCard() {
        this.trainInput.value = "";
        this.changeIcon(this.trainCard, this.finishedIcon);
    }

    handleTestCard() {
        this.testInput.value = "";
        this.changeIcon(this.testCard, this.unfinishedIcon);
        this.changeIcon(this.testCard, this.finishedIcon);
    }
    
    unlock(card) {
        card.classList.remove("locked");
        const buttons = card.getElementsByTagName("button");
        const inputs = card.getElementsByTagName("input");
        const selects = card.getElementsByTagName("select");
        
        for (const button of buttons) button.classList.remove("locked");
        for (const input of inputs) input.classList.remove("locked");
        for (const select of selects) select.classList.remove("locked");
        
        document.getElementById("btnTrain").classList.remove("locked");
        this.changeIcon(card, this.unfinishedIcon);
    }

    lock(card) {
        card.classList.add("locked");

        const buttons = card.getElementsByTagName("button");
        const inputs = card.getElementsByTagName("input");
        const selects = card.getElementById("select");

        for (const button of buttons) button.classList.add("locked");
        for (const input of inputs) input.classList.add("locked");
        for (const select of selects) select.classList.add("locked");

        document.getElementById("btnTrain").classList.add("locked");
        this.changeIcon(card, this.lockedIcon);
    }

    finish(card) {
        card.classList.remove("locked");
        this.changeIcon(card, this.finishedIcon);
    }

    changeIcon(card, icon) {
        const titleElement = card.querySelector(".taskTitle");
        titleElement.textContent = icon + titleElement.textContent.slice(2);
    }

}
export default class CardController {
    constructor() {
        this.attrCard = document.getElementById("attrCard");
        this.classCard = document.getElementById("classCard");
        this.paramCard = document.getElementById("paramCard");
        this.trainCard = document.getElementById("trainCard");
        this.testCard = document.getElementById("testCard");

        this.classInput = document.getElementById("className");
        this.attrInput = document.getElementById("attrName");
        this.trainInput = document.getElementById("trainDataName");
        this.testInput = document.getElementById("testDataName");

        this.lockButton = document.getElementById("btnLockParam");
        this.resetButton = document.getElementById("btnResetParam");
        this.trainButton = document.getElementById("btnTrain");

        this.unfinishedIcon = "◌ ";
        this.finishedIcon = "✓ ";
        this.lockedIcon = "🔒";

        this.attrApplied = false;
        this.classApplied = false;
    }

    handleAttributeCard() {
        this.attrApplied = true;
        this.attrInput.value = "";
        this.resetButton.classList.remove("locked");        

        if (!this.classApplied) return;
        
        this.lockButton.classList.remove("locked");
        this.handleParameterCard();
        this.finish(this.paramCard);
    }

    handleClassCard() {
        this.classApplied = true;
        this.classInput.value = "";
        this.resetButton.classList.remove("locked");
        
        if (!this.attrApplied) return;
        
        this.lockButton.classList.remove("locked");
        this.handleParameterCard();
        this.finish(this.paramCard);
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
    
    handleLockButton() {
        this.finish(this.paramCard);
        this.unlock(this.trainCard);
    }

    handleResetButton() {
        this.unfinish(this.paramCard);
        this.lock(this.trainCard);
        this.lock(this.testCard);
        this.lockButton.classList.add("locked");
        this.resetButton.classList.add("locked");
        this.trainButton.classList.add("locked");
    }

    lock(card) {
        card.classList.add("locked");

        const buttons = card.getElementsByTagName("button");
        const inputs = card.getElementsByTagName("input");
        const selects = card.getElementsByTagName("select");

        for (const button of buttons) button.classList.add("locked");
        for (const input of inputs) input.classList.add("locked");
        for (const select of selects) select.classList.add("locked");

        document.getElementById("btnTrain").classList.add("locked");
        this.changeIcon(card, this.lockedIcon);
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

    finish(card) {
        card.classList.remove("locked");
        this.changeIcon(card, this.finishedIcon);
    }

    unfinish(card) {
        this.changeIcon(card, this.unfinishedIcon);
    }

    changeIcon(card, icon) {
        const titleElement = card.querySelector(".taskTitle");
        titleElement.textContent = icon + titleElement.textContent.slice(2);
    }

}
export default class CardController {
    constructor() {
        this.attrCard = document.getElementById("attrCard");
        this.classCard = document.getElementById("classCard");
        this.trainCard = document.getElementById("trainCard");
        this.testCard = document.getElementById("testCard");

        this.unfinishedIcon = "◌ ";
        this.finishedIcon = "✓ ";
        this.lockedIcon = "🔒";

        this.attrApplied = false;
        this.classApplied = false;

        this.addListeners();
    }

    addListeners() {
        const attrButton = document.getElementById("btnAddAttr");
        const classButton = document.getElementById("btnAddClass");
        const addTrainButton = document.getElementById("btnAddTrainData");
        const trainButton = document.getElementById("btnTrain");
        const testButton = document.getElementById("btnTest");

        attrButton.addEventListener("click", () => {
            this.attrApplied = true;
            this.finish(this.attrCard);    
            if (this.classApplied) {
                this.unlock(this.trainCard);
            }
        });

        classButton.addEventListener("click", () => {
            this.classApplied = true;
            this.finish(this.classCard);
            if (this.attrApplied) {
                this.unlock(this.trainCard);
            }
        });

        addTrainButton.addEventListener("click", () => {
            this.changeIcon(this.trainCard, this.finishedIcon);
        });

        trainButton.addEventListener("click", () => {
            this.unlock(this.testCard);
        });

        testButton.addEventListener("click", () => {
            this.changeIcon(this.testCard, this.unfinishedIcon);
            this.changeIcon(this.testCard, this.finishedIcon);
        }); 
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
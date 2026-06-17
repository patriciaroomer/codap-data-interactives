import State from "../codap/State.js";
import UI from "../constants/UI.js";

export default class CardController {
    constructor() {
        this.paramCard = UI.PARAM_CARD;
        this.trainCard = UI.TRAIN_CARD;
        this.testCard = UI.TEST_CARD;
        
        this.unfinishedIcon = "◌ ";
        this.finishedIcon = "✓ ";
        this.lockedIcon = "🔒";

        this.attrApplied = false;
        this.classApplied = false;
    }

    lock(card) {
        card.classList.add("locked");

        const buttons = card.getElementsByTagName("button");
        const inputs = card.getElementsByTagName("input");
        const selects = card.getElementsByTagName("select");

        for (const button of buttons) button.classList.add("locked");
        for (const input of inputs) input.classList.add("locked");
        for (const select of selects) select.classList.add("locked");

        UI.TRAIN_BUTTON.classList.add("locked");
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
        
        UI.TRAIN_BUTTON.classList.remove("locked");
        this.unfinish(card);
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

    handleAttributeCard() {
        this.attrApplied = true;
        UI.ATTR_INPUT.value = "";        
        if (!this.classApplied) return;
        UI.LOCK_BUTTON.classList.remove("locked");
        this.finish(UI.PARAM_CARD);
    }

    handleClassCard() {
        this.classApplied = true;
        UI.CLASS_INPUT.value = "";
        if (!this.attrApplied) return;
        UI.LOCK_BUTTON.classList.remove("locked");
        this.finish(UI.PARAM_CARD);
    }
    
    handleTrainCard() {
        UI.TRAIN_INPUT.value = "";
        this.changeIcon(UI.TRAIN_CARD, this.finishedIcon);
        UI.TRAIN_BUTTON.classList.remove("locked");
    }

    handleTraining() {
        this.finish(UI.TRAIN_CARD)
        this.unlock(UI.TEST_CARD);
    }
    
    handleTestCard() {
        UI.TEST_INPUT.value = "";
        this.changeIcon(UI.TEST_CARD, this.finishedIcon);
    }
    
    handleLockButton() {
        this.finish(UI.PARAM_CARD);
        this.lock(UI.PARAM_CARD);
        this.unlock(UI.TRAIN_CARD);
    }

    handleResetButton() {
        this.unfinish(UI.PARAM_CARD);
        this.lock(UI.TRAIN_CARD);
        this.lock(UI.TEST_CARD);
        this.unlock(UI.PARAM_CARD);
        UI.LOCK_BUTTON.classList.add("locked");
        UI.TRAIN_BUTTON.classList.add("locked");
    }

    handleTrainingReset() {
        this.unfinish(UI.TRAIN_CARD);
        this.unfinish(UI.TEST_CARD);
        this.lock(UI.TEST_CARD);
        UI.TRAIN_BUTTON.classList.add("locked");
    }

    reload() {
        const state = State.state;
        if (!state) return;

        switch (state) {
            case "UNINITIALIZED":
                this.setUninitializedState();
                break;
            case "INITIALIZED":
                this.setInitializedState();
                break;
            case "TRAINING":
                this.setTrainingState();
                break;
            case "TRAINED":
                this.setTrainedState();
                break;
            case "TESTING":
                this.setTestingState();
                break;
            default:
                return;     
        }
    }

    setUninitializedState() {
        this.unlock(UI.PARAM_CARD);
        this.lock(UI.TRAIN_CARD);
        this.lock(UI.TEST_CARD);
        UI.LOCK_BUTTON.classList.add("locked");
        UI.TRAIN_BUTTON.classList.add("locked");
    }

    setInitializedState() {
        this.lock(UI.PARAM_CARD);
        this.unlock(UI.TRAIN_CARD);
        this.lock(UI.TEST_CARD);
        UI.LOCK_BUTTON.classList.add("locked");
        UI.TRAIN_BUTTON.classList.add("locked");
    }

    setTrainingState() {
        this.lock(UI.PARAM_CARD);
        this.unlock(UI.TRAIN_BUTTON);
        this.lock(UI.TEST_CARD);
        UI.LOCK_BUTTON.classList.add("locked");
        UI.TRAIN_BUTTON.classList.remove("locked");
    }

    setTrainedState() {
        this.lock(UI.PARAM_CARD);
        this.unlock(UI.TRAIN_CARD);
        this.finish(UI.TRAIN_CARD);
        this.unlock(UI.TEST_CARD);
        UI.LOCK_BUTTON.classList.add("locked");
        UI.TRAIN_BUTTON.classList.remove("locked");
    }

    setTestingState() {
        this.lock(UI.PARAM_CARD);
        this.unlock(UI.TRAIN_CARD);
        this.finish(UI.TRAIN_CARD);
        this.unlock(UI.TEST_CARD);
        this.finish(UI.TEST_CARD);
        UI.LOCK_BUTTON.classList.add("locked");
        UI.TRAIN_BUTTON.classList.remove("locked");
    }

}
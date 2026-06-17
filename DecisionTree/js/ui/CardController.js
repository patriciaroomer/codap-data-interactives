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

        for (const button of buttons) this.lockElement(button);
        for (const input of inputs) this.lockElement(input);
        for (const select of selects) this.lockElement(select);

        this.lockElement(UI.TRAIN_BUTTON);
        this.changeIcon(card, this.lockedIcon);
    }

    lockElement(element) {
        element.classList.add("locked");
        element.tabIndex = -1;
    }

    unlock(card) {
        card.classList.remove("locked");
        const buttons = card.getElementsByTagName("button");
        const inputs = card.getElementsByTagName("input");
        const selects = card.getElementsByTagName("select");
        
        for (const button of buttons) this.unlockElement(button);
        for (const input of inputs) this.unlockElement(input);
        for (const select of selects) this.unlockElement(select);
        
        this.unlockElement(UI.TRAIN_BUTTON);
        this.unfinish(card);
    }

    unlockElement(element) {
        element.classList.remove("locked");
        element.tabIndex = 0;
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

        // Lock newly added selects for now
        this.lock(UI.TRAIN_CARD);
        this.lock(UI.TEST_CARD);        
        
        if (!this.classApplied) return;
        this.unlockElement(UI.LOCK_BUTTON);
        this.finish(UI.PARAM_CARD);
    }

    handleClassCard() {
        this.classApplied = true;
        UI.CLASS_INPUT.value = "";

        if (!this.attrApplied) return;
        this.unlockElement(UI.LOCK_BUTTON);
        this.finish(UI.PARAM_CARD);
    }
    
    handleTrainCard() {
        UI.TRAIN_INPUT.value = "";
        this.changeIcon(UI.TRAIN_CARD, this.finishedIcon);
        this.unlockElement(UI.TRAIN_BUTTON);
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
        this.lockElement(UI.LOCK_BUTTON);
        this.lockElement(UI.TRAIN_BUTTON);
    }

    handleTrainingReset() {
        this.unfinish(UI.TRAIN_CARD);
        this.unfinish(UI.TEST_CARD);
        this.lock(UI.TEST_CARD);
        this.lockElement(UI.TRAIN_BUTTON);
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
        this.lockElement(UI.LOCK_BUTTON);
        this.lockElement(UI.TRAIN_BUTTON);
    }

    setInitializedState() {
        this.lock(UI.PARAM_CARD);
        this.unlock(UI.TRAIN_CARD);
        this.lock(UI.TEST_CARD);
        this.lockElement(UI.LOCK_BUTTON);
        this.lockElement(UI.TRAIN_BUTTON);
    }

    setTrainingState() {
        this.lock(UI.PARAM_CARD);
        this.unlock(UI.TRAIN_BUTTON);
        this.lock(UI.TEST_CARD);
        this.lockElement(UI.LOCK_BUTTON);
        this.unlockElement(UI.TRAIN_BUTTON);
    }

    setTrainedState() {
        this.lock(UI.PARAM_CARD);
        this.unlock(UI.TRAIN_CARD);
        this.finish(UI.TRAIN_CARD);
        this.unlock(UI.TEST_CARD);
        this.lockElement(UI.LOCK_BUTTON);
        this.unlockElement(UI.TRAIN_BUTTON);
    }

    setTestingState() {
        this.lock(UI.PARAM_CARD);
        this.unlock(UI.TRAIN_CARD);
        this.finish(UI.TRAIN_CARD);
        this.unlock(UI.TEST_CARD);
        this.finish(UI.TEST_CARD);
        this.lockElement(UI.LOCK_BUTTON);
        this.unlockElement(UI.TRAIN_BUTTON);
    }

}
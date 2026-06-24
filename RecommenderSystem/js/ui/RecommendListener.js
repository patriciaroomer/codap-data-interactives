export default class RecommendListener {
    constructor() {
        this.usersCheckbox = document.getElementById("usersCheckbox");
        this.itemsCheckbox = document.getElementById("itemsCheckbox");
        this.cosineCheckbox = document.getElementById("cosineCheckbox");
        this.pearsonCheckbox = document.getElementById("pearsonCheckbox");
        this.euclideanCheckbox = document.getElementById("euclideanCheckbox");
        this.recommendButton = document.getElementById("recommendButton"); 
        this.addListeners();
    }

    addListeners() {
        this.recommendButton.addEventListener("click", () => {

        });
    }

    addUsersCheckboxListener() {
        this.usersCheckbox.addEventListener("click", () => {
            
        })
    }
}
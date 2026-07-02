export default class RatingsListener {

    static data = [];

    constructor() {
        this.userSelect = document.getElementById("ratingSelect");
        this.recommendButton = document.getElementById("recommendButton");
        this.addListeners();
    }

    addListeners() {
        this.addShowRatingsListener();
    }

    addShowRatingsListener() {
        this.userSelect.addEventListener("change", () => {
            RatingsListener.showRatings();
        });
    }

    static showRatings() {
        const user = document.getElementById("ratingSelect").value;
        const ratings = RatingsListener.data.getRatings(user);
        
        const tbody = document.querySelector("#ratingsTable tbody");
        tbody.replaceChildren();

        for (const rating of ratings) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${rating[0]}</td>
                <td>${rating[1]}</td>
            `
            tbody.appendChild(row);
        }
    }

}
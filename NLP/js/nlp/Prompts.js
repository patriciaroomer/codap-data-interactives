class Prompt {
  constructor(text, language) {
    this.text = text;
    this.language = language;
  }
}

export default class Prompts {
  static prompts = [];

  static {
    this.prompts.push(new Prompt("OMG!!! I can't believe how many ppl showed up 😱😱😱 it was like... 500+ people?? def the best party EVER lol", "en"));
    this.prompts.push(new Prompt("OMG!!! Ich kann nicht glauben wie viele Leute gekommen sind 😱😱😱 es waren was... 500+ Personen?? definitiv die beste Party EVER lol", "de"));
    this.prompts.push(new Prompt("OMG!!! Je n'arrive pas à croire combien de gens sont venus 😱😱😱 c'était genre... 500+ personnes?? clairement la meilleure fête EVER lol", "fr"));

    this.prompts.push(new Prompt(`<div class="alert">WARNING: Your account will be deleted in 24hrs!!! Click here --> http://totally-not-a-scam.com/login & enter ur details ASAP!!!</div>`, "en"));
    this.prompts.push(new Prompt(`<div class="alert">WARNUNG: Ihr Konto wird in 24Std. gelöscht!!! Klicken Sie hier --> http://totally-not-a-scam.de/login & geben Sie Ihre Daten SOFORT ein!!!</div>`, "de"));
    this.prompts.push(new Prompt(`<div class="alert">ATTENTION: Votre compte sera supprimé dans 24h!!! Cliquez ici --> http://totally-not-a-scam.fr/login & entrez vos informations MAINTENANT!!!</div>`, "fr"));

    this.prompts.push(new Prompt("What is machine learning? ML is a subset of AI where systems learn from data without being explicitly programmed... common applications include image recognition & spam filtering.", "en"));
    this.prompts.push(new Prompt("Was ist maschinelles Lernen? ML ist ein Teilgebiet der KI, bei dem Systeme aus Daten lernen, ohne explizit programmiert zu werden... Zu den gängigen Anwendungsbereichen zählen Bilderkennung und Spam-Filterung.", "de"));
    this.prompts.push(new Prompt("Qu'est-ce que l'apprentissage automatique ? L'apprentissage automatique est un sous-domaine de l'intelligence artificielle dans lequel les systèmes apprennent à partir de données sans avoir été explicitement programmés... Parmi les applications courantes, on peut citer la reconnaissance d'images et le filtrage des spams.", "fr"));

    this.prompts.push(new Prompt("I have been waiting three weeks for a response and at this point I genuinely do not know if anyone is even reading these emails.", "en"));
    this.prompts.push(new Prompt("Ich warte seit drei Wochen auf eine Antwort und langsam frage ich mich ob überhaupt jemand diese E-Mails liest.", "de"));
    this.prompts.push(new Prompt("Cela fait trois semaines que j'attends une réponse et je ne sais plus vraiment si quelqu'un lit ces emails.", "fr"));

    this.prompts.push(new Prompt("The vaccine debate continues to divide families, communities and governments despite decades of scientific consensus on its safety and effectiveness.", "en"));
    this.prompts.push(new Prompt("Die Impfdebatte spaltet weiterhin Familien, Gemeinschaften und Regierungen trotz jahrzehntelangem wissenschaftlichem Konsens über Sicherheit und Wirksamkeit.", "de"));
    this.prompts.push(new Prompt("Le débat sur les vaccins continue de diviser les familles, les communautés et les gouvernements malgré des décennies de consensus scientifique sur leur sécurité et leur efficacité.", "fr"));

    this.prompts.push(new Prompt("She trained for two years, woke up at 5am every single day, gave up weekends and social events, and finished in last place. She said it was the best experience of her life.", "en"));
    this.prompts.push(new Prompt("Sie trainierte zwei Jahre lang, stand jeden einzelnen Tag um 5Uhr morgens auf, verzichtete auf Wochenenden und soziale Ereignisse, und kam als Letzte ins Ziel. Sie sagte es war die beste Erfahrung ihres Lebens.", "de"));
    this.prompts.push(new Prompt("Elle s'est entraînée pendant deux ans, s'est levée à 5h du matin chaque jour, a renoncé aux week-ends et aux événements sociaux, et a terminé dernière. Elle a dit que c'était la meilleure expérience de sa vie.", "fr"));

    this.prompts.push(new Prompt("My landlord has ignored every message about the heating for four months. It is currently 11 degrees inside my apartment and I do not know what my legal options are.", "en"));
    this.prompts.push(new Prompt("Mein Vermieter hat seit vier Monaten jede Nachricht bezüglich der Heizung ignoriert. Es sind gerade 11 Grad in meiner Wohnung und ich weiß nicht welche rechtlichen Möglichkeiten ich habe.", "de"));
    this.prompts.push(new Prompt("Mon propriétaire a ignoré chaque message concernant le chauffage depuis quatre mois. Il fait actuellement 11 degrés dans mon appartement et je ne sais pas quelles sont mes options légales.", "fr"));

    this.prompts.push(new Prompt("Residents near the proposed wind farm are sharply divided. Some see it as essential infrastructure for the future. Others feel the decision was made without any meaningful consultation.", "en"));
    this.prompts.push(new Prompt("Anwohner in der Nähe des geplanten Windparks sind stark gespalten. Manche sehen ihn als wesentliche Infrastruktur für die Zukunft. Andere fühlen dass die Entscheidung ohne sinnvolle Konsultation getroffen wurde.", "de"));
    this.prompts.push(new Prompt("Les habitants proches du parc éolien proposé sont profondément divisés. Certains le voient comme une infrastructure essentielle pour l'avenir. D'autres estiment que la décision a été prise sans consultation significative.", "fr"));

    this.prompts.push(new Prompt("I do not understand why people find this film profound. The dialogue is hollow, the characters make decisions that serve the plot rather than any internal logic, and the ending mistakes ambiguity for depth.", "en"));
    this.prompts.push(new Prompt("Ich verstehe nicht warum Menschen diesen Film tiefgründig finden. Die Dialoge sind hohl, die Charaktere treffen Entscheidungen die der Handlung dienen statt einer inneren Logik, und das Ende verwechselt Mehrdeutigkeit mit Tiefe.", "de"));
    this.prompts.push(new Prompt("Je ne comprends pas pourquoi les gens trouvent ce film profond. Les dialogues sont creux, les personnages prennent des décisions qui servent l'intrigue plutôt qu'une logique interne, et la fin confond ambiguïté et profondeur.", "fr"));

    this.prompts.push(new Prompt("According to data published at https://ourworldindata.org/food-waste approximately one third of all food produced globally is lost or wasted each year while 735 million people go to bed hungry.", "en"));
    this.prompts.push(new Prompt("Laut Daten die auf https://ourworldindata.org/food-waste veröffentlicht wurden geht jährlich etwa ein Drittel aller weltweit produzierten Lebensmittel verloren oder wird verschwendet während 735 Millionen Menschen hungrig schlafen gehen.", "de"));
    this.prompts.push(new Prompt("Selon les données publiées sur https://ourworldindata.org/food-waste environ un tiers de tous les aliments produits dans le monde est perdu ou gaspillé chaque année tandis que 735 millions de personnes vont se coucher le ventre vide.", "fr"));
  }
}
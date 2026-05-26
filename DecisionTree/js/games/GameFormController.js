export default class GameFormController {
  
  constructor(mapping, repo, logger) {
    this.mapping = mapping;
    this.repo    = repo;
    this.log     = logger;

    this.fields = {
      name: document.getElementById('inName'),
      m1:   document.getElementById('inM1'),
      m2:   document.getElementById('inM2'),
      m3:   document.getElementById('inM3'),
      m4:   document.getElementById('inM4'),
      m5:   document.getElementById('inM5'),
    };

    this.labels = {
      m1: document.getElementById('lblM1'),
      m2: document.getElementById('lblM2'),
      m3: document.getElementById('lblM3'),
      m4: document.getElementById('lblM4'),
      m5: document.getElementById('lblM5'),
    };
  }

  updateLabels() {
    this.labels.m1.textContent = this.mapping.label('Merkmal1');
    this.labels.m2.textContent = this.mapping.label('Merkmal2');
    this.labels.m3.textContent = this.mapping.label('Merkmal3');
    this.labels.m4.textContent = this.mapping.label('Merkmal4');
    this.labels.m5.textContent = this.mapping.label('Merkmal5');
  }

  async submit() {
    const item = {
      Name:     this.fields.name.value || 'Neu',
      Merkmal1: this.fields.m1.value,
      Merkmal2: this.fields.m2.value,
      Merkmal3: this.fields.m3.value,
      Merkmal4: this.fields.m4.value,
      Merkmal5: Number(this.fields.m5.value || 0),
      Klasse:   '',
    };

    await this.repo.insert(item);
    this.log.log('Neues Spiel hinzugefügt:', item);
  }
}
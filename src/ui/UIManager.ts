import { PlanetConfig } from '../config/planets';

export class UIManager {
  public readonly instructions: HTMLElement;
  public readonly planetName: HTMLElement;
  public readonly sectionName: HTMLElement;
  public readonly planetDescription: HTMLElement;
  public readonly hologramPanel: HTMLElement;
  public readonly dogPrompt: HTMLElement;
  public readonly dogQuote: HTMLElement;

  constructor() {
    this.instructions = document.getElementById('instructions')!;
    this.planetName = document.getElementById('planet-name')!;
    this.sectionName = document.getElementById('section-name')!;
    this.planetDescription = document.getElementById('planet-description')!;
    this.hologramPanel = document.getElementById('hologram-panel')!;
    this.dogPrompt = document.getElementById('dog-prompt')!;
    this.dogQuote = document.getElementById('dog-quote')!;
  }

  public updatePlanetInfo(config: PlanetConfig): void {
    this.planetName.textContent = config.name;
    this.sectionName.textContent = config.section;
    this.planetDescription.textContent = config.description;
  }

  public showHologramPanel(): void {
    this.hologramPanel.classList.add('visible');
  }

  public hideHologramPanel(): void {
    this.hologramPanel.classList.remove('visible');
  }

  public showInstructions(): void {
    this.instructions.style.display = 'flex';
  }

  public hideInstructions(): void {
    this.instructions.style.display = 'none';
  }
}

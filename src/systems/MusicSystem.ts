export class MusicSystem {
  private audio: HTMLAudioElement;
  private started = false;
  private muted = false;
  private muteButton: HTMLButtonElement;

  constructor() {
    this.audio = new Audio('/music.mp3');
    this.audio.loop = true;
    this.audio.volume = 0.3;

    this.muteButton = this.createMuteButton();
    document.body.appendChild(this.muteButton);
  }

  private createMuteButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.id = 'mute-button';
    button.innerHTML = '🔊';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);
      background: rgba(0, 0, 0, 0.5);
      color: white;
      font-size: 24px;
      cursor: pointer;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.background = 'rgba(0, 0, 0, 0.7)';
      button.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = 'rgba(0, 0, 0, 0.5)';
      button.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    });

    button.addEventListener('click', () => {
      this.toggleMute();
    });

    return button;
  }

  public start(): void {
    if (!this.started) {
      this.audio.play().catch((e) => {
        console.log('Music autoplay blocked:', e);
      });
      this.started = true;
    }
  }

  public toggleMute(): void {
    this.muted = !this.muted;
    this.audio.muted = this.muted;
    this.muteButton.innerHTML = this.muted ? '🔇' : '🔊';
  }

  public isMuted(): boolean {
    return this.muted;
  }
}

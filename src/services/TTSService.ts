export interface TTSSettings {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

export class TTSService {
  private static API_KEY_STORAGE_KEY = 'elevenlabs_api_key';
  private static utterance: SpeechSynthesisUtterance | null = null;
  private static _isPlaying: boolean = false;
  private static currentText: string = '';

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    // For now, we'll just test if the API key is not empty
    return apiKey.trim().length > 0;
  }

  static async generateSpeech(
    text: string, 
    settings: TTSSettings = {
      voice: 'default',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0
    }
  ): Promise<void> {
    if (!('speechSynthesis' in window)) {
      throw new Error('Speech synthesis not supported in this browser');
    }

    this.currentText = text;
    this.utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    this.utterance.rate = settings.rate;
    this.utterance.pitch = settings.pitch;
    this.utterance.volume = settings.volume;

    // Try to find the requested voice
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0 && settings.voice !== 'default') {
      const selectedVoice = voices.find(voice => voice.name === settings.voice);
      if (selectedVoice) {
        this.utterance.voice = selectedVoice;
      }
    }

    return new Promise((resolve, reject) => {
      if (!this.utterance) {
        reject(new Error('Failed to create speech utterance'));
        return;
      }

      this.utterance.onstart = () => {
        this._isPlaying = true;
      };

      this.utterance.onend = () => {
        this._isPlaying = false;
        resolve();
      };

      this.utterance.onerror = (error) => {
        this._isPlaying = false;
        reject(error);
      };

      speechSynthesis.speak(this.utterance);
    });
  }

  static async playAudio(): Promise<void> {
    // For Web Speech API, this is handled in generateSpeech
    return Promise.resolve();
  }

  static pauseAudio(): void {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause();
    }
  }

  static resumeAudio(): void {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  }

  static stopAudio(): void {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      this._isPlaying = false;
    }
  }

  static getCurrentTime(): number {
    // Web Speech API doesn't provide current time
    return 0;
  }

  static getDuration(): number {
    // Web Speech API doesn't provide duration
    return 0;
  }

  static setCurrentTime(time: number): void {
    // Web Speech API doesn't support seeking
  }

  static setPlaybackRate(rate: number): void {
    if (this.utterance) {
      this.utterance.rate = rate;
    }
  }

  static isPlaying(): boolean {
    return speechSynthesis.speaking || this._isPlaying;
  }

  static getAvailableVoices(): SpeechSynthesisVoice[] {
    return speechSynthesis.getVoices();
  }
}
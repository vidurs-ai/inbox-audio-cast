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

  // Playback/time tracking (for progress estimation)
  private static startTimeMs: number = 0;
  private static pauseStartMs: number | null = null;
  private static pausedAccumulatedMs: number = 0;
  private static estimatedDurationMs: number = 0;
  private static canceled: boolean = false;
  private static utterances: SpeechSynthesisUtterance[] = [];
  private static settingsCache: TTSSettings | null = null;

  private static async awaitVoicesReady(): Promise<void> {
    return new Promise((resolve) => {
      const existing = speechSynthesis.getVoices();
      if (existing.length > 0) return resolve();
      const handler = () => {
        speechSynthesis.removeEventListener('voiceschanged', handler);
        resolve();
      };
      speechSynthesis.addEventListener('voiceschanged', handler);
      // Trigger voice loading
      speechSynthesis.getVoices();
    });
  }

  private static splitTextIntoChunks(text: string, maxLen = 220): string[] {
    const sentences = text
      .replace(/\s+/g, ' ')
      .split(/(?<=[.!?])\s+/);

    const chunks: string[] = [];
    let current = '';

    for (const sentence of sentences) {
      if ((current + ' ' + sentence).trim().length <= maxLen) {
        current = (current ? current + ' ' : '') + sentence;
      } else {
        if (current) chunks.push(current);
        if (sentence.length <= maxLen) {
          current = sentence;
        } else {
          // Hard split very long sentences
          for (let i = 0; i < sentence.length; i += maxLen) {
            chunks.push(sentence.slice(i, i + maxLen));
          }
          current = '';
        }
      }
    }
    if (current) chunks.push(current);
    return chunks;
  }

  private static estimateDurationMs(text: string, rate: number): number {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const baseWpm = 170; // average speech rate
    const seconds = (words / (baseWpm * (rate || 1))) * 60;
    return Math.max(1, seconds) * 1000;
  }
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

    // Cancel any ongoing playback
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
    }

    await this.awaitVoicesReady();

    this.currentText = text;
    this.settingsCache = settings;

    const chunks = this.splitTextIntoChunks(text);
    this.estimatedDurationMs = chunks.reduce((acc, c) => acc + this.estimateDurationMs(c, settings.rate), 0);
    this.startTimeMs = performance.now();
    this.pausedAccumulatedMs = 0;
    this.pauseStartMs = null;
    this.canceled = false;
    this._isPlaying = true;

    const voices = speechSynthesis.getVoices();
    const selectedVoice = (voices.length > 0 && settings.voice !== 'default')
      ? voices.find(v => v.name === settings.voice) ?? null
      : null;

    this.utterances = [];

    const speakChunk = (chunk: string) => new Promise<void>((resolve, reject) => {
      const u = new SpeechSynthesisUtterance(chunk);
      u.rate = settings.rate;
      u.pitch = settings.pitch;
      u.volume = settings.volume;
      if (selectedVoice) u.voice = selectedVoice;

      u.onend = () => resolve();
      u.onerror = (e) => reject((e as any).error || e);

      this.utterance = u;
      this.utterances.push(u);
      speechSynthesis.speak(u);
    });

    return new Promise(async (resolve, reject) => {
      try {
        for (const chunk of chunks) {
          if (this.canceled) throw new Error('Playback canceled');
          await speakChunk(chunk);
        }
        this._isPlaying = false;
        resolve();
      } catch (err) {
        this._isPlaying = false;
        reject(err as any);
      }
    });
  }

  static async playAudio(): Promise<void> {
    // For Web Speech API, this is handled in generateSpeech
    return Promise.resolve();
  }

  static pauseAudio(): void {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      this.pauseStartMs = performance.now();
    }
  }

  static resumeAudio(): void {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      if (this.pauseStartMs != null) {
        this.pausedAccumulatedMs += performance.now() - this.pauseStartMs;
        this.pauseStartMs = null;
      }
    }
  }

  static stopAudio(): void {
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
    }
    this._isPlaying = false;
    this.canceled = true;
    this.startTimeMs = 0;
    this.pauseStartMs = null;
    this.pausedAccumulatedMs = 0;
    this.estimatedDurationMs = 0;
  }

  static getCurrentTime(): number {
    if (!this.startTimeMs) return 0;
    const now = performance.now();
    const effectiveNow = this.pauseStartMs != null ? this.pauseStartMs : now;
    let elapsedMs = effectiveNow - this.startTimeMs - this.pausedAccumulatedMs;
    if (elapsedMs < 0) elapsedMs = 0;
    const clamped = Math.min(this.estimatedDurationMs, elapsedMs);
    return clamped / 1000;
  }

  static getDuration(): number {
    return this.estimatedDurationMs / 1000;
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
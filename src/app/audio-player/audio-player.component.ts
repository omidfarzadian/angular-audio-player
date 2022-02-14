import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
} from '@angular/core';

import WaveSurfer from 'wavesurfer.js';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styles: [
    `
      #waveform {
        ::ng-deep wave {
          max-height: 100%;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioPlayerComponent implements AfterViewInit, OnDestroy {
  audioUrl: string = 'assets/sounds/iphone-ringtones.mp3';
  waveSurfer!: WaveSurfer;
  audioDuration!: string;
  audioCurrentTime: string = '00:00';
  audioPlayBackSpeed: number = 1;
  interval!: ReturnType<typeof setInterval>;

  constructor(private cdr: ChangeDetectorRef) {}

  public get audioIsPlaying(): boolean {
    return this.waveSurfer?.isPlaying();
  }

  ngAfterViewInit(): void {
    this.initWaveForm();
  }

  initWaveForm(): void {
    this.waveSurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#c7d2fe',
      progressColor: '#6365f1',
      responsive: true,
      normalize: true,
      barWidth: 2,
      barRadius: 2,
      cursorWidth: 0,
      pixelRatio: 1,
    });
    this.waveSurfer.load(this.audioUrl);
    this.waveSurfer.on('ready', () => {
      this.audioDuration = this.calculateDuration(
        this.waveSurfer.getDuration()
      );
      this.cdr.detectChanges();
    });
  }

  onToggleAudioPlaying() {
    this.waveSurfer.playPause();
    this.waveSurfer.on('audioprocess', () => {
      this.interval = setInterval(() => {
        this.audioCurrentTime = this.calculateDuration(
          this.waveSurfer.getCurrentTime()
        );
        this.cdr.detectChanges();
      }, 1000);
    });
  }

  calculateDuration(duration: number) {
    const minutes = Math.floor((duration % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(duration % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  onChangeAudioSpeed() {
    let rate = this.audioPlayBackSpeed;
    if (rate === 1) rate = 1.5;
    else if (rate === 1.5) rate = 2;
    else rate = 1;

    let ct = this.waveSurfer.getCurrentTime();

    this.audioPlayBackSpeed = rate;
    this.waveSurfer.setPlaybackRate(rate);
    this.waveSurfer.skipBackward(this.waveSurfer.getDuration());
    this.waveSurfer.skipForward(ct);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
    this.waveSurfer.destroy();
  }
}

import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import WaveSurfer from 'wavesurfer.js';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  audioUrl: string = 'assets/sounds/Shohreh - Kalaghe Dom Siah.mp3';
  waveSurfer!: WaveSurfer;
  audioDuration!: string;
  audioCurrentTime: string = '0:0';
  audioPlayBackSpeed: number = 1;
  interval!: ReturnType<typeof setInterval>;

  constructor(private cdr: ChangeDetectorRef) {}

  public get audioIsPlaying(): boolean {
    return this.waveSurfer.isPlaying();
  }

  ngOnInit(): void {
    this.initWaveForm();
  }

  onToggleAudioPlaying() {
    if (!this.audioIsPlaying) {
      this.waveSurfer.on('ready', () => {
        this.waveSurfer.play();
      });
      this.waveSurfer.on('audioprocess', () => {
        this.interval = setInterval(() => {
          this.audioCurrentTime = this.calculateDuration(
            this.waveSurfer.getCurrentTime()
          );
          this.cdr.detectChanges();
        }, 1000);
      });
      this.waveSurfer.load(this.audioUrl);
    } else {
      this.waveSurfer.pause();
    }
  }

  initWaveForm(): void {
    this.waveSurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#c7d2fe',
      progressColor: '#6365f1',
      responsive: true,
      barWidth: 2,
      barRadius: 2,
      cursorWidth: 0,
    });
    this.waveSurfer.load(this.audioUrl);
    this.waveSurfer.on('ready', () => {
      this.audioDuration = this.calculateDuration(
        this.waveSurfer.getDuration()
      );
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
    if (this.audioPlayBackSpeed == 1) {
      this.waveSurfer.setPlaybackRate(2);
      this.audioPlayBackSpeed = 2;
    } else {
      this.waveSurfer.setPlaybackRate(1);
      this.audioPlayBackSpeed = 1;
    }
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }
}

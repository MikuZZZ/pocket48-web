<template>
  <div class="video-player__container">
    <div class="lrc__container">
      <div v-for="line in currentLrc" class="line" :key="line.time + line.user">
        <span>{{ line.user }}</span>
        {{ ': ' }}
        <span>{{ line.message }}</span>
      </div>
    </div>
    <video
      ref="videoPlayer"
      class="video-js vjs-theme-city"
      data-setup='{ "techOrder": ["html5", "flash"] }'
      preload="auto"
      controls
    ></video>
  </div>
</template>

<script>
import Axios from 'axios';
import videojs from 'video.js';
import 'video.js/dist/video-js.min.css';
import '@videojs/http-streaming';
import 'videojs-flash';
import '@videojs/themes/dist/city/index.css';

export default {
  name: 'VideoPlayer',
  props: {
    videoInfo: Object,
  },
  watch: {
    videoInfo(val) {
      this.currentLrc = [];
      const streamingPath = val.playStreams ? val.playStreams[0].streamPath : val.playStreamPath;
      this.loadLrc();

      const type = streamingPath.startsWith('rtmp') ? 'rtmp/mp4' : 'application/x-mpegURL';
      this.player.pause();
      this.player.src({
        type: 'video/mp4',
        src: 'https://file-examples.com/wp-content/uploads/2017/04/file_example_MP4_480_1_5MG.mp4',
      });
      this.player.src({ type, src: streamingPath });
      this.player.ready(() => {
        this.player.play();
      });
    },
  },
  data() {
    return {
      player: null,
      lrc: null,
      currentLrc: [],
      lrcIndex: 0,
    };
  },
  methods: {
    async loadLrc() {
      if (!this.videoInfo.msgFilePath) {
        return;
      }

      const res = await Axios.get(`https://non-cors.herokuapp.com/${this.videoInfo.msgFilePath}`);
      const data = res.data
        .split('\n')
        .map((line) => line.match(/^\[(.*)\](.*)\t(.*)$/))
        .filter(Boolean)
        .map(([_, time, user, message]) => {
          const [hours, minutes, seconds] = time.split(':');
          const timeSeconds = +hours * 60 * 60 + +minutes * 60 + +seconds;
          return { time: timeSeconds, user, message };
        });

      this.lrc = data;
    },
    async handleVideoTimeUpdate() {
      if (!this.lrc || this.lrcIndex > this.lrc.length - 1) {
        return;
      }

      for (let i = this.lrcIndex; i < this.lrc.length; i += 1) {
        if (Number(this.lrc[i].time) <= this.player.currentTime()) {
          this.lrcIndex = i + 1;
          this.currentLrc.push(this.lrc[i]);
          if (this.currentLrc.length > 10) {
            this.currentLrc.shift();
          }
        } else {
          break;
        }
      }
    },
  },
  mounted() {
    this.player = videojs(this.$refs.videoPlayer);
    this.loadLrc();

    this.player.src(this.videoInfo.playStreamPath);
    this.player.ready(() => {
      this.player.on('timeupdate', this.handleVideoTimeUpdate);
      this.player.play();
    });
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  },
};
</script>

<style lang="scss" scoped>
.video-player__container {
  position: relative;
  height: 100%;
  width: 100%;
}

.lrc__container {
  position: absolute;
  bottom: 80px;
  overflow: hidden;
  left: 20px;
  z-index: 1;
  width: 200px;

  .line {
    display: inline-block;
    background-color: rgba(50, 50, 50, 0.75);
    border-radius: 5px;
    color: white;
    padding: 0 10px;
    &:not(:first-child) {
      margin-top: 5px;
    }
  }
}

.video-js {
  width: 100%;
  height: 100%;
}
</style>

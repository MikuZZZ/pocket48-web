<template>
  <video
    ref="videoPlayer"
    class="video-js vjs-theme-city"
    data-setup='{ "techOrder": ["html5", "flash"] }'
    preload="auto"
    controls
  ></video>
</template>

<script>
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
      const type = val.playStreamPath.startsWith('rtmp') ? 'rtmp/mp4' : 'application/x-mpegURL';
      this.player.pause();
      this.player.src({
        type: 'video/mp4',
        src: 'https://file-examples.com/wp-content/uploads/2017/04/file_example_MP4_480_1_5MG.mp4',
      });
      this.player.src({ type, src: val.playStreamPath });
      this.player.ready(() => {
        this.player.play();
      });
    },
  },
  data() {
    return {
      player: null,
    };
  },
  mounted() {
    this.player = videojs(this.$refs.videoPlayer);
    this.player.src(this.videoInfo.playStreamPath);
    this.player.ready(() => {
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
.video-js {
  width: 100%;
  height: 100%;
}
</style>

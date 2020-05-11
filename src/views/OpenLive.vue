<template>
  <div class="member-page__container">
    <aside>
      <div v-if="memberInfo === 'loading'">Loading</div>
      <div v-else>
        <nav>
          <div class="current-live-button clickable" @click="selectedGroupId = 'live'">
            <svg width="8" height="8" viewBox="0 0 5 5" fill="red" xmlns="http://www.w3.org/2000/svg">
              <circle cx="2.5" cy="2.5" r="2.5" />
            </svg>
            <span>直播</span>
          </div>
          <HierarchicalList :tree="memberInfo" v-model="selectedGroupId" :search="searchText" />
        </nav>
      </div>
    </aside>
    <div ref="liveListContainer" class="live-list__container">
      <div v-if="liveList === 'loading'">Loading</div>
      <div
        v-else-if="liveList"
        class="live-list__item"
        v-for="live in liveList"
        :key="live.liveId"
        @click="live.status !== 1 ? (selectedLiveId = live.liveId) : undefined"
      >
        <div v-if="live.status !== 4" :class="{ active: live.status !== 1 }" class="status-indicator">
          {{ live.status === 1 ? '未开播' : '直播中' }}
        </div>
        <img :src="'https://source1.48.cn/' + live.coverPath" alt="" />
        <div class="live-item__info">
          <p>{{ live.title }}</p>
          <p>{{ new Date(Number(live.stime)).toLocaleString() }}</p>
        </div>
      </div>
      <div v-else>请从左边列表选择团</div>
    </div>
    <div v-if="videoInfo" class="live-video__container">
      <div v-if="videoInfo === 'loading'">Loading</div>
      <VideoPlayer v-else :videoInfo="videoInfo" />
    </div>
  </div>
</template>

<script>
import Axios from 'axios';
import { isEmpty, groupBy } from 'lodash';

import VideoPlayer from '../components/VideoPlayer';

import HierarchicalList from '../components/HierarchicalList';

export default {
  name: 'App',
  components: {
    HierarchicalList,
    VideoPlayer,
  },
  data: () => ({
    searchText: '',
    selectedGroupId: undefined,
    selectedLiveId: undefined,
    memberInfo: null,
    liveList: null,
    videoInfo: null,
    liveNextId: '0',
  }),
  created() {
    this.getGroupInfo();
  },
  mounted() {
    this.$refs.liveListContainer.addEventListener('scroll', this.handleLiveListInfinityScroll);
  },
  beforeDestroy() {
    this.$refs.liveListContainer.removeEventListener('scroll', this.handleLiveListInfinityScroll);
  },
  watch: {
    selectedGroupId(value) {
      if (value === 'live') {
        this.getLiveList();
      } else {
        this.getLiveRecordList();
      }
    },
    selectedLiveId() {
      this.getVideoInfo();
    },
  },
  methods: {
    async handleLiveListInfinityScroll() {
      if (this.liveNextId === '0' || this.fetchingNext) {
        return;
      }

      const scrollContainer = this.$refs.liveListContainer;
      const atBottom = scrollContainer.clientHeight + scrollContainer.scrollTop + 300 > scrollContainer.scrollHeight;

      if (atBottom) {
        this.fetchingNext = true;
        if (this.selectedGroupId === 'live') {
          await this.getLiveList(this.liveNextId);
        } else {
          await this.getLiveRecordList(this.liveNextId);
        }

        this.fetchingNext = false;
      }
    },
    async getGroupInfo() {
      this.memberInfo = 'loading';
      const sessionData = sessionStorage.getItem('menber_data');

      let data;
      if (!sessionData) {
        const response = await Axios.post('https://pocketapi.48.cn/user/api/v1/client/update/group_team_star', {});

        data = response.data;
        sessionStorage.setItem('menber_data', JSON.stringify(data));
      } else {
        data = JSON.parse(sessionData);
      }

      const group = {
        label: 'SNH48G',
        children: data.content.groupInfo.map((g) => {
          return {
            label: g.groupName,
            id: g.groupId,
          };
        }),
      };

      this.memberInfo = group;
    },
    async getLiveRecordList(next) {
      if (!next) {
        this.liveList = 'loading';
      }

      const { data: recordData } = await Axios.post('https://pocketapi.48.cn/live/api/v1/live/getOpenLiveList', {
        next: next || '0',
        record: 'true',
        groupId: this.selectedGroupId,
      });

      this.liveNextId = recordData.content.next;
      this.liveList = next ? this.liveList.concat(recordData.content.liveList) : recordData.content.liveList;
    },
    async getLiveList(next) {
      if (!next) {
        this.liveList = 'loading';
      }

      const { data: recordData } = await Axios.post('https://pocketapi.48.cn/live/api/v1/live/getOpenLiveList', {
        next: next || '0',
        record: 'false',
        groupId: '0',
      });

      this.liveNextId = recordData.content.next;
      this.liveList = next ? this.liveList.concat(recordData.content.liveList) : recordData.content.liveList;
    },
    async getVideoInfo() {
      // this.videoInfo = 'loading';
      const response = await Axios.post('https://pocketapi.48.cn/live/api/v1/live/getOpenLiveOne', {
        liveId: this.selectedLiveId,
      });

      this.videoInfo = response.data.content;
    },
  },
};
</script>

<style lang="scss" scoped>
.member-page__container {
  display: flex;
  justify-content: flex-start;
  height: 100%;
  overflow: hidden;

  aside {
    min-width: 200px;
    height: 100%;
    background-color: #0654ad;
    color: white;
    overflow: auto;

    nav {
      padding: 0 10px;

      .current-live-button {
        padding: 20px 0;
        display: inline-flex;
        align-items: center;

        span {
          padding: 0 10px;
        }
      }
    }

    input {
      width: 100%;
      padding: 10px;
      outline: none;
      border: none;
      display: block;
      border-radius: 0;
    }
  }

  .live-list__container {
    width: 400px;
    overflow-y: scroll;
    overflow-x: hidden;

    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-items: center;
    flex-shrink: 0;

    padding: 20px 0;
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .live-list__item {
    width: calc(50% - 10px);
    margin-top: 20px;
    position: relative;

    min-width: 150px;
    display: flex;
    flex-direction: column;

    .status-indicator {
      position: absolute;
      font-size: 12px;
      top: 5px;
      left: 5px;
      color: white;
      background-color: rgb(231, 73, 73);
      border-radius: 5px;
      padding: 0 5px;

      &.active {
        background-color: rgb(89, 201, 89);
      }
    }

    img {
      width: 100%;
      object-fit: cover;
    }

    .live-item__info {
      p {
        margin: 0;
      }
    }
  }

  .live-video__container {
    width: 100%;
    height: 100%;

    .video-player {
      width: 100%;
      height: 100%;
    }
  }
}
</style>

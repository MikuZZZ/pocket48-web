<template>
  <div class="member-page__container">
    <aside>
      <div v-if="memberInfo === 'loading'">Loading</div>
      <div v-else>
        <input type="text" v-model="searchText" placeholder="搜索（支持缩写）" />
        <nav>
          <div class="current-live-button clickable" @click="selectedMemberId = 'live'">
            <svg width="8" height="8" viewBox="0 0 5 5" fill="red" xmlns="http://www.w3.org/2000/svg">
              <circle cx="2.5" cy="2.5" r="2.5" />
            </svg>
            <span>直播</span>
          </div>
          <HierarchicalList
            :tree="favouriteMemberInfo"
            :fav="favouriteIds"
            v-model="selectedMemberId"
            :search="searchText"
            @like="toggleLikeMember"
          />
          <HierarchicalList
            :tree="filteredMemberInfo"
            :fav="favouriteIds"
            v-model="selectedMemberId"
            :search="searchText"
            @like="toggleLikeMember"
          />
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
        @click="selectedLiveId = live.liveId"
      >
        <img :src="'https://source1.48.cn/' + live.coverPath" alt="" />
        <div class="live-item__info">
          <p>{{ live.userInfo.nickname }}</p>
          <p>{{ live.liveType === 1 ? '直播' : '电台' }} - {{ live.title }}</p>
          <p>{{ new Date(Number(live.ctime)).toLocaleString() }}</p>
        </div>
      </div>
      <div v-else>请从左边列表选择成员</div>
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
    selectedMemberId: undefined,
    selectedLiveId: undefined,
    favouriteMemberInfo: {
      label: '我推',
      children: [],
    },
    memberInfo: null,
    liveList: null,
    videoInfo: null,
    liveNextId: '0',
    fetchingNext: false,
  }),
  created() {
    this.getMemberInfo();
    const favouriteMemberLocal = localStorage.getItem('favorite-members');
    if (favouriteMemberLocal) {
      this.favouriteMemberInfo = JSON.parse(favouriteMemberLocal);
    }
  },
  mounted() {
    this.$refs.liveListContainer.addEventListener('scroll', this.handleLiveListInfinityScroll);
  },
  beforeDestroy() {
    this.$refs.liveListContainer.removeEventListener('scroll', this.handleLiveListInfinityScroll);
  },
  watch: {
    selectedMemberId(value) {
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
  computed: {
    filteredMemberInfo() {
      if (isEmpty(this.memberInfo)) {
        return {};
      }

      if (!this.searchText) {
        return this.memberInfo;
      }

      const filtered = {
        label: this.memberInfo.label,
        children: this.memberInfo.children
          .map((g) => {
            if (Array.isArray(g.children)) {
              return g.children
                .map((t) => {
                  if (Array.isArray(t.children)) {
                    return t.children;
                  }
                  return [t];
                })
                .flat();
            }
            return [g];
          })
          .flat()
          .filter((m) => m.label.toLowerCase().includes(this.searchText.toLowerCase())),
      };

      return filtered;
    },
    favouriteIds() {
      return this.favouriteMemberInfo.children.map((c) => c.id);
    },
  },
  methods: {
    async toggleLikeMember(item) {
      const currentIndex = this.favouriteMemberInfo.children.findIndex((c) => c.id === item.id);
      if (currentIndex === -1) {
        this.favouriteMemberInfo.children.push(item);
      } else {
        this.favouriteMemberInfo.children.splice(currentIndex, 1);
      }

      localStorage.setItem('favorite-members', JSON.stringify(this.favouriteMemberInfo));
    },
    async handleLiveListInfinityScroll() {
      if (this.liveNextId === '0' || this.fetchingNext) {
        return;
      }

      const scrollContainer = this.$refs.liveListContainer;
      const atBottom = scrollContainer.clientHeight + scrollContainer.scrollTop + 300 > scrollContainer.scrollHeight;

      if (atBottom) {
        this.fetchingNext = true;
        if (this.selectedLiveId === 'live') {
          await this.getLiveList(this.liveNextId);
        } else {
          await this.getLiveRecordList(this.liveNextId);
        }

        this.fetchingNext = false;
      }
    },
    async getMemberInfo() {
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

      let group = groupBy(data.content.starInfo.concat(data.content.officialInfo), (info) => {
        const groupInfo = data.content.groupInfo.find((g) => g.groupId === info.groupId);
        return groupInfo ? groupInfo.groupName : 'ROOT';
      });

      Object.keys(group).forEach((groupName) => {
        group[groupName] = groupBy(group[groupName], (info) => {
          const teamInfo = data.content.teamInfo.find((t) => t.teamId === info.teamId);
          return teamInfo ? teamInfo.teamName : 'ROOT';
        });
      });

      group = {
        label: 'SNH48G',
        children: Object.entries(group).map(([groupName, groupInfo]) => {
          if (groupName === 'ROOT') {
            return {
              label: groupInfo['ROOT'][0].realName,
              id: groupInfo['ROOT'][0].userId,
            };
          }
          return {
            label: groupName,
            children: Object.entries(groupInfo).map(([teamName, teamInfo]) => {
              if (teamName === 'ROOT') {
                return {
                  label: teamInfo[0].realName,
                  id: teamInfo[0].userId,
                };
              }
              return {
                label: teamName,
                children: teamInfo.map((t) => ({
                  label: `${t.realName}${t.abbr}`,
                  id: t.userId,
                })),
              };
            }),
          };
        }),
      };

      this.memberInfo = group;
    },
    async getLiveRecordList(next) {
      if (!next) {
        this.liveList = 'loading';
      }

      const { data: recordData } = await Axios.post('https://pocketapi.48.cn/live/api/v1/live/getLiveList', {
        next: next || '0',
        record: 'true',
        groupId: '0',
        teamId: '0',
        userId: this.selectedMemberId,
      });

      this.liveNextId = recordData.content.next;
      this.liveList = next ? this.liveList.concat(recordData.content.liveList) : recordData.content.liveList;
    },
    async getLiveList(next) {
      if (!next) {
        this.liveList = 'loading';
      }

      const { data: recordData } = await Axios.post('https://pocketapi.48.cn/live/api/v1/live/getLiveList', {
        next: next || '0',
        record: 'false',
        groupId: '0',
        teamId: '0',
        userId: '0',
      });

      this.liveNextId = recordData.content.next;
      this.liveList = next ? this.liveList.concat(recordData.content.liveList) : recordData.content.liveList;
    },
    async getVideoInfo() {
      // this.videoInfo = 'loading';
      const response = await Axios.post('https://pocketapi.48.cn/live/api/v1/live/getLiveOne', {
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
    overflow-y: auto;
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
    padding-top: 20px;

    min-width: 150px;
    display: flex;
    flex-direction: column;

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

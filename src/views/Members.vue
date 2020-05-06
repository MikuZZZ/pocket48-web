<template>
  <div class="member-page__container">
    <aside>
      <div v-if="memberInfo === 'loading'">Loading</div>
      <div v-else>
        <input type="text" v-model="searchText" placeholder="搜索（支持缩写）" />
        <div @click="selectedMemberId = 'live'">直播</div>
        <HierarchicalList :tree="filteredMemberInfo" v-model="selectedMemberId" :search="searchText" />
      </div>
    </aside>
    <div v-if="liveList" class="live-list__container">
      <div v-if="liveList === 'loading'">Loading</div>
      <div
        v-else
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
    searchText: 'sss',
    selectedMemberId: undefined,
    selectedLiveId: undefined,
    memberInfo: null,
    liveList: null,
    videoInfo: null,
  }),
  created() {
    this.getMemberInfo();
  },

  watch: {
    selectedMemberId(value) {
      console.info(`Member selected ${value}`);
      if (value === 'live') {
        this.getLiveList();
      } else {
        this.getLiveRecordList();
      }
    },
    selectedLiveId(value) {
      console.info(`Live selected ${value}`);
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

      // const filtered = {
      //   ...this.memberInfo,
      //   children: this.memberInfo.children
      //     .map((g) => ({
      //       ...g,
      //       children: g.children
      //         .map((t) => ({
      //           ...t,
      //           children: t.children.filter((m) => m.label.includes(this.searchText)),
      //         }))
      //         .filter((t) => t.children.length),
      //     }))
      //     .filter((g) => g.children.length),
      // };

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
  },
  methods: {
    async getMemberInfo() {
      this.memberInfo = 'loading';
      const sessionData = sessionStorage.getItem('menber_data');

      let data;
      if (!sessionData) {
        const response = await Axios.post('https://pocketapi.48.cn/user/api/v1/client/update/group_team_star', {});

        data = response.data;
        sessionStorage.setItem('menber_data', JSON.stringify(data));
      } else {
        console.info('sessionData loadded');
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
    async getLiveRecordList() {
      this.liveList = 'loading';
      const { data: recordData } = await Axios.post('https://pocketapi.48.cn/live/api/v1/live/getLiveList', {
        next: '0',
        record: 'true',
        groupId: '0',
        teamId: '0',
        userId: this.selectedMemberId,
      });

      this.liveList = recordData.content.liveList;
    },
    async getLiveList() {
      this.liveList = 'loading';
      const { data: recordData } = await Axios.post('https://pocketapi.48.cn/live/api/v1/live/getLiveList', {
        next: '0',
        record: 'false',
        groupId: '0',
        teamId: '0',
        userId: '0',
      });

      this.liveList = recordData.content.liveList;
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
    background-color: #3c9ecc;
    color: white;
    overflow: auto;

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

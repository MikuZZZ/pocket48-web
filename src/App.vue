<template>
  <div id="app">
    <header>
      <div class="title">Web48G</div>
      <nav>
        <router-link to="/">口袋直播</router-link>
        <router-link to="/room">成员房间</router-link>
        <router-link to="/open-live">公演</router-link>
      </nav>
    </header>
    <router-view />
  </div>
</template>

<style scoped lang="scss">
header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 20px 0;
  background-color: white;
  border-bottom: 1px solid #c5c5c5;

  .title {
    padding: 0 20px;
    font-size: 24px;
    font-weight: 700;
  }

  nav {
    a {
      font-weight: 700;
      color: #2c3e50;
      padding: 0 30px;
      text-decoration: none;

      &:not(:last-child) {
        border-right: 1px solid black;
      }

      &.router-link-exact-active {
        color: #0654ad;
      }
    }
  }
}
</style>

<style lang="scss">
@import './css/font.scss';

html {
  width: 100%;
  box-sizing: border-box;
  -webkit-text-size-adjust: 100%;
}

body {
  height: 100vh;
  width: 100vw;
  margin: 0;
  scroll-behavior: smooth;
  background-color: #f4f4f4;
  color: #1a1a1a;
  overflow: hidden;
}

ul,
li,
ol {
  margin: 0;
  padding: 0;
}

*,
*:before,
*:after {
  box-sizing: inherit;
  font-family: noto-sans, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  height: 100%;
  overflow: hidden;

  display: flex;
  flex-direction: column;
}

.clickable {
  cursor: pointer;
}
</style>

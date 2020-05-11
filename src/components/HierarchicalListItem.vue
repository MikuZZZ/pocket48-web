<template>
  <li>
    <header>
      <div
        v-if="item.children"
        class="arrow"
        :class="isActive ? 'arrow-down' : 'arrow-right'"
        @click="isActive = !isActive"
      />
      <div v-if="item.id" title="加入我推列表" class="like-button__container clickable" @click="toggleLike(item)">
        <svg viewBox="0 0 26 26" :fill="fav.includes(item.id) ? 'white' : 'none'" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 11L16 10L13 3L10 10L2 11L8 16L6 24L13 20L20 24L18 16L24 11Z" stroke="white" stroke-width="1.5" />
        </svg>
      </div>
      <div
        class="label"
        :class="{ clickable: item.id, selected: item.id && currentSelected === item.id }"
        v-if="item.label"
        @click="onSelect"
      >
        {{ item.label }}
      </div>
    </header>
    <ul v-if="item.children && isActive" class="hierarchical-list__container">
      <HierarchicalListItem
        v-for="childrenItem in item.children"
        :fav="fav"
        :item="childrenItem"
        :key="childrenItem.label"
        :currentSelected="currentSelected"
        @change="$emit('change', $event)"
        @like="$emit('like', $event)"
      />
    </ul>
  </li>
</template>

<script>
export default {
  name: 'HierarchicalListItem',
  props: {
    fav: Array,
    currentSelected: {
      type: [String, Number],
    },
    item: {
      type: Object,
    },
    defaultActive: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isActive: this.defaultActive,
    };
  },
  methods: {
    toggleLike(item) {
      this.$emit('like', item);
    },
    onSelect() {
      if (!this.item.id) {
        return;
      }

      this.$emit('change', this.item.id);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import '../css/func.scss';

.selected {
  color: rgb(220, 232, 29);
  font-weight: 800;
}

.arrow-right {
  @include triangle(right, gray, 5px);
}

.arrow-down {
  @include triangle(bottom, gray, 5px);
}

header {
  display: flex;
  align-items: center;
  padding-bottom: 10px;

  .label {
    margin-left: 5px;
  }

  .like-button__container {
    margin-left: 10px;
    width: 18px;
    svg {
      display: block;
    }
  }
}

ul {
  list-style-type: none;
  padding: 0;
}

ul ul {
  padding-left: 10px;
}
</style>

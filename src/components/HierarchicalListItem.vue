<template>
  <li>
    <header>
      <div
        v-if="item.children"
        class="arrow"
        :class="isActive ? 'arrow-down' : 'arrow-right'"
        @click="isActive = !isActive"
      />
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
        :item="childrenItem"
        :key="childrenItem.label"
        :currentSelected="currentSelected"
        @change="$emit('change', $event)"
      />
    </ul>
  </li>
</template>

<script>
export default {
  name: 'HierarchicalListItem',
  props: {
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
    onSelect(e) {
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

.clickable {
  cursor: pointer;
}

.selected {
  color: rgba(61, 10, 202, 0.5);
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
  .label {
    padding: 5px 0;
    margin-left: 5px;
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

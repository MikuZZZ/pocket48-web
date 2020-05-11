<template>
  <ul>
    <HierarchicalListItem
      :item="tree"
      :fav="fav"
      defaultActive
      :currentSelected="selected"
      @change="onChange"
      @like="onLike"
    />
  </ul>
</template>

<script>
import HierarchicalListItem from './HierarchicalListItem';

export default {
  name: 'HierarchicalList',
  model: {
    prop: 'currentSelected',
    event: 'change',
  },
  components: {
    HierarchicalListItem,
  },
  props: {
    fav: Array,
    currentSelected: [String, Number],
    tree: Object,
  },
  data() {
    return {
      selected: this.currentSelected,
    };
  },
  watch: {
    currentSelected(val) {
      this.selected = val;
    },
  },
  methods: {
    onLike(e) {
      this.$emit('like', e);
    },
    onChange(e) {
      this.$emit('change', e);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
ul {
  list-style-type: none;
  padding: 0;
}
</style>

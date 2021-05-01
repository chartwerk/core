import has from 'lodash/has';

export default {
  props: {
    id: {
      type: String,
      required: true
    },
    series: {
      type: Array,
      required: false,
      default: function() { return []; }
    },
    options: {
      type: Object,
      required: false,
      default: function() { return {}; }
    }
  },
  watch: {
    id() {
      this.renderChart();
    },
    series() {
      this.renderChart();
    },
    options() {
      this.renderChart();
    }
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    // it's "abstract" method. "children" components should override it
    render() { },
    renderSharedCrosshair(values: { x?: number, y?: number }) { },
    hideSharedCrosshair() { },
    renderChart() {
      this.appendEvents();
      this.render();
    },
    appendEvents() {
      if(this.options.eventsCallbacks === undefined) {
        this.options.eventsCallbacks = {}
      }
      if(has(this.$listeners, 'zoomIn')) {
        this.options.eventsCallbacks.zoomIn = this.zoomIn.bind(this);
      }
      if(has(this.$listeners, 'zoomOut')) {
        this.options.eventsCallbacks.zoomOut = this.zoomOut.bind(this);
      }
      if(has(this.$listeners, 'mouseMove')) {
        this.options.eventsCallbacks.mouseMove = this.mouseMove.bind(this);
      }
      if(has(this.$listeners, 'mouseOut')) {
        this.options.eventsCallbacks.mouseOut = this.mouseOut.bind(this);
      }
      if(has(this.$listeners, 'onLegendClick')) {
        this.options.eventsCallbacks.onLegendClick = this.onLegendClick.bind(this);
      }
      if(has(this.$listeners, 'panningEnd')) {
        this.options.eventsCallbacks.panningEnd = this.panningEnd.bind(this);
      }
      if(has(this.$listeners, 'panning')) {
        this.options.eventsCallbacks.panning = this.panning.bind(this);
      }
      if(has(this.$listeners, 'contextMenu')) {
        this.options.eventsCallbacks.contextMenu = this.contextMenu.bind(this);
      }
      if(has(this.$listeners, 'sharedCrosshairMove')) {
        this.options.eventsCallbacks.sharedCrosshairMove = this.sharedCrosshairMove.bind(this);
      }
    },
    zoomIn(range) {
      this.$emit('zoomIn', range);
    },
    zoomOut(centers) {
      this.$emit('zoomOut', centers);
    },
    mouseMove(evt) {
      this.$emit('mouseMove', evt);
    },
    mouseOut() {
      this.$emit('mouseOut');
    },
    onLegendClick(idx) {
      this.$emit('onLegendClick', idx);
    },
    panningEnd(range) {
      this.$emit('panningEnd', range);
    },
    panning(range) {
      this.$emit('panning', range);
    },
    contextMenu(evt) {
      this.$emit('contextMenu', evt);
    },
    sharedCrosshairMove(event) {
      this.$emit('sharedCrosshairMove', event);
    }
  }
};

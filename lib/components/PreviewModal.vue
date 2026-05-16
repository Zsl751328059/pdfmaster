<template>
  <div :class="{ show: visible }" class="preview-modal" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="modal-close" @click="$emit('close')" aria-label="Close preview">×</button>
      <div class="modal-title">{{ title }}</div>
      <img :src="imageSrc" class="modal-image" :alt="title" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PreviewModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    imageSrc: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: 'PDF Preview'
    }
  },
  emits: ['close']
}
</script>

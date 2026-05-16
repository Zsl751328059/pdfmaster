const PreviewUtils = {
  async renderPdfPage(blob, pageIndex, scale = 1.5, options = {}) {
    try {
      const arrayBuffer = await blob.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        cache: false
      }).promise
      const page = await pdf.getPage(pageIndex + 1)
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: ctx, viewport }).promise
      
      if (options.pageNumber) {
        const content = options.pageNumber
        const fontSize = 12
        ctx.font = `${fontSize}px Helvetica`
        ctx.fillStyle = options.textColor || '#333333'
        
        const margin = 15
        let x, y
        const position = options.position || 'bottom-center'
        
        switch (position) {
          case 'top-left':
            x = margin
            y = margin + fontSize
            break
          case 'top-center':
            x = canvas.width / 2
            y = margin + fontSize
            break
          case 'top-right':
            x = canvas.width - margin - (content.length * fontSize * 0.5)
            y = margin + fontSize
            break
          case 'bottom-left':
            x = margin
            y = canvas.height - margin
            break
          case 'bottom-center':
            x = canvas.width / 2 - (content.length * fontSize * 0.35)
            y = canvas.height - margin
            break
          case 'bottom-right':
            x = canvas.width - margin - (content.length * fontSize * 0.5)
            y = canvas.height - margin
            break
          default:
            x = canvas.width / 2
            y = canvas.height - margin
        }
        
        ctx.fillText(content, x, y)
      }
      
      const dataUrl = canvas.toDataURL()
      
      canvas.width = 0
      canvas.height = 0
      if (typeof pdf.destroy === 'function') {
        pdf.destroy()
      }
      
      return dataUrl
    } catch (error) {
      console.warn('Preview rendering failed:', error)
      return null
    }
  },

  async openPreview({ 
    image, 
    previews, 
    resultBlob, 
    vm, 
    fallbackImage = null,
    usePageNumber = false
  }) {
    let idx = -1
    if (usePageNumber && image && typeof image.pageNumber === 'number') {
      idx = image.pageNumber - 1
    } else {
      idx = previews.indexOf(image)
    }
    
    if (idx === -1 || !resultBlob) {
      vm.currentPreviewImage = fallbackImage || image
      vm.showPreviewModal = true
      return
    }

    try {
      const dataUrl = await this.renderPdfPage(resultBlob, idx, 1.5)
      if (dataUrl) {
        vm.currentPreviewImage = dataUrl
      } else {
        vm.currentPreviewImage = image
        console.warn('Preview rendering returned null, using thumbnail fallback')
      }
    } catch (error) {
      console.warn('Preview error:', error)
      vm.currentPreviewImage = image
    }
    vm.showPreviewModal = true
  },

  async openPreviewByIndex({ 
    index, 
    resultBlob, 
    vm 
  }) {
    if (index < 0 || !resultBlob) {
      this.closePreview(vm)
      return
    }

    try {
      const dataUrl = await this.renderPdfPage(resultBlob, index, 1.5)
      vm.currentPreviewImage = dataUrl || ''
    } catch (error) {
      console.warn('Preview error:', error)
      vm.currentPreviewImage = ''
    }
    vm.showPreviewModal = true
  },

  async openPreviewFirstPage({ 
    resultBlob, 
    vm, 
    fallbackImage = null 
  }) {
    if (!resultBlob) {
      vm.currentPreviewImage = fallbackImage || ''
      vm.showPreviewModal = true
      return
    }

    try {
      const dataUrl = await this.renderPdfPage(resultBlob, 0, 1.5)
      vm.currentPreviewImage = dataUrl || fallbackImage || ''
    } catch (error) {
      console.warn('Preview error:', error)
      vm.currentPreviewImage = fallbackImage || ''
    }
    vm.showPreviewModal = true
  },

  closePreview(vm) {
    vm.showPreviewModal = false
    vm.currentPreviewImage = ''
  }
}
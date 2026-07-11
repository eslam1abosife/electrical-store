import { defineStore } from 'pinia'

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: []
  }),
  actions: {
    addItem(product) {
      if (!this.items.find(p => p.id === product.id)) {
        this.items.push(product)
      }
    },
    removeItem(id) {
      this.items = this.items.filter(p => p.id !== id)
    }
  }
})
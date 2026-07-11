// stores/cart.js
import { defineStore } from "pinia";

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [],
  }),

  getters: {
    totalItems: (state) => {
      return state.items.reduce((sum, item) => sum + item.quantity, 0);
    },

    totalPrice: (state) => {
      return state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    },

    cartItems: (state) => state.items,
  },

  actions: {
    addItem(product) {
      const existing = this.items.find((i) => i.id === product.id);
      if (existing) {
        existing.quantity++;
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: 1,
        });
      }
      this.saveToLocalStorage();
    },

    removeItem(productId) {
      this.items = this.items.filter((i) => i.id !== productId);
      this.saveToLocalStorage();
    },

    updateQuantity(productId, quantity) {
      const item = this.items.find((i) => i.id === productId);
      if (item) {
        item.quantity = Math.max(1, quantity);
        this.saveToLocalStorage();
      }
    },

    increaseQuantity(productId) {
      const item = this.items.find((i) => i.id === productId);
      if (item) {
        item.quantity++;
        this.saveToLocalStorage();
      }
    },

    decreaseQuantity(productId) {
      const item = this.items.find((i) => i.id === productId);
      if (item) {
        if (item.quantity > 1) {
          item.quantity--;
          this.saveToLocalStorage();
        } else {
          this.removeItem(productId);
        }
      }
    },

    clearCart() {
      this.items = [];
      this.saveToLocalStorage();
    },

    saveToLocalStorage() {
      if (process.client) {
        localStorage.setItem("cart", JSON.stringify(this.items));
      }
    },

    loadFromLocalStorage() {
      if (process.client) {
        const saved = localStorage.getItem("cart");
        if (saved) {
          try {
            this.items = JSON.parse(saved);
          } catch (e) {
            this.items = [];
          }
        }
      }
    },

    // ✅ دالة إتمام الطلب مع تحديث المخزون وتغيير نوع المنتج
    async checkout(customerData, supabase) {
      // ✅ 1. تحديث المخزون لكل منتج في السلة
      const stockResults = [];
      
      for (const item of this.items) {
        try {
          console.log(`🔄 جاري تحديث مخزون المنتج: ${item.name}`);
          
          // جلب المنتج الحالي
          const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('stock, name, product_type')
            .eq('id', item.id)
            .single();
          
          if (fetchError) {
            console.error(`❌ خطأ في جلب المنتج ${item.id}:`, fetchError);
            stockResults.push({ success: false, error: fetchError, item });
            continue;
          }
          
          if (!product) {
            console.error(`❌ المنتج ${item.id} غير موجود`);
            stockResults.push({ success: false, error: 'Product not found', item });
            continue;
          }
          
          // حساب المخزون الجديد
          const currentStock = product.stock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          
          console.log(`📦 ${product.name}: ${currentStock} → ${newStock}`);
          
          // ✅ تحديث المخزون ونوع المنتج في قاعدة البيانات
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              stock: newStock,
              // ✅ لو وصل لصفر، غير نوعه لـ pre_order عشان يظهر في غير المتوفرة
              product_type: newStock === 0 ? 'pre_order' : 'in_stock',
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id);
          
          if (updateError) {
            console.error(`❌ خطأ في تحديث المخزون للمنتج ${item.id}:`, updateError);
            stockResults.push({ success: false, error: updateError, item });
          } else {
            console.log(`✅ تم تحديث مخزون "${product.name}": ${currentStock} → ${newStock}`);
            console.log(`✅ نوع المنتج: ${newStock === 0 ? 'pre_order' : 'in_stock'}`);
            stockResults.push({ success: true, item, newStock });
          }
        } catch (error) {
          console.error(`❌ خطأ في معالجة المنتج ${item.id}:`, error);
          stockResults.push({ success: false, error, item });
        }
      }

      // التحقق من نجاح جميع التحديثات
      const failedUpdates = stockResults.filter(r => !r.success);
      if (failedUpdates.length > 0) {
        throw new Error(`فشل تحديث ${failedUpdates.length} منتج(ات)`);
      }

      // ✅ 2. إنشاء الطلب في قاعدة البيانات
      const orderData = {
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        customer_address: customerData.address || null,
        customer_email: customerData.email || null,
        items: this.items.map((item) => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total_price: this.totalPrice,
        status: "pending",
        payment_method: customerData.payment_method || "cash",
        sale_type: "online",
        order_date: new Date().toISOString(),
      };

      console.log('📝 جاري إنشاء الطلب:', orderData);

      const { data, error } = await supabase
        .from("orders")
        .insert([orderData])
        .select();

      if (error) {
        console.error('❌ خطأ في إنشاء الطلب:', error);
        throw error;
      }

      console.log('✅ تم إنشاء الطلب بنجاح:', data);

      // ✅ 3. تفريغ السلة بعد نجاح الطلب
      this.clearCart();

      return { order: data, stockResults };
    },
  },
});
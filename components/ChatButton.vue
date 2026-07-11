<template>
  <!-- زر الشات العائم -->
  <button
    @click="toggleChat"
    class="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110"
    :class="{ 'bg-red-600 hover:bg-red-700': isOpen }"
  >
    <span v-if="!isOpen" class="text-2xl">💬</span>
    <span v-else class="text-2xl">✕</span>
  </button>

  <!-- نافذة الشات -->
  <div
    v-if="isOpen"
    class="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
    style="max-height: 600px"
  >
    <!-- Header -->
    <div class="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span class="text-xl">🤖</span>
        <span class="font-bold">{{ isAdmin ? 'مساعد الأدمن' : 'مساعد المتجر' }}</span>
      </div>
      <span class="text-xs opacity-75">{{ isAdmin ? '🔒 وضع الأدمن' : 'متصل بالذكاء الاصطناعي' }}</span>
    </div>

    <!-- Messages -->
    <div
      ref="messagesContainer"
      class="p-4 overflow-y-auto bg-gray-50"
      style="height: 400px"
    >
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="mb-4 flex"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[85%] p-3 rounded-2xl"
          :class="
            msg.role === 'user'
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
          "
        >
          <div
            class="text-sm whitespace-pre-wrap"
            v-html="formatMessage(msg.content)"
          ></div>
          <div class="text-xs opacity-60 mt-1">
            {{ msg.role === "user" ? "أنت" : isAdmin ? "الأدمن" : "AI" }} •
            {{ formatTime(msg.timestamp) }}
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-start mb-4">
        <div
          class="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm"
        >
          <div class="flex gap-1">
            <span
              class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style="animation-delay: 0s"
            ></span>
            <span
              class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style="animation-delay: 0.2s"
            ></span>
            <span
              class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style="animation-delay: 0.4s"
            ></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="p-4 bg-white border-t border-gray-200">
      <div class="flex gap-2">
        <input
          v-model="inputMessage"
          @keyup.enter="sendMessage"
          :placeholder="isAdmin ? 'اسأل عن الكود أو الداشبورد...' : 'اسأل عن المنتجات أو العروض...'"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          @click="sendMessage"
          :disabled="loading || !inputMessage.trim()"
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-xl transition-all"
        >
          <span v-if="!loading">إرسال</span>
          <span v-else>⏳</span>
        </button>
      </div>
      <div class="text-xs text-gray-400 mt-2 text-center">
        {{ isAdmin ? '🔒 يمكنك سؤال الـ AI عن الكود والداشبورد' : 'يمكنك سؤال الـ AI عن المنتجات، الأسعار، أو العروض' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from "vue";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();

// ✅ تحديد إذا كان المستخدم أدمن
const isAdmin = computed(() => userStore.isAdmin);

const isOpen = ref(false);
const messages = ref([
  {
    role: "assistant",
    content: isAdmin.value
      ? "👋 مرحباً أيها المدير! أنا مساعدك التقني. اسألني عن أي شيء في الكود أو الداشبورد."
      : "👋 مرحباً! أنا مساعد المتجر الذكي. اسألني عن أي منتج، أو عن العروض، وسأرد عليك فوراً.",
    timestamp: new Date(),
  },
]);
const inputMessage = ref("");
const loading = ref(false);
const messagesContainer = ref(null);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    nextTick(() => {
      scrollToBottom();
    });
  }
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const formatMessage = (text) => {
  return text.replace(/\n/g, "<br>");
};

const formatTime = (date) => {
  return format(date, "h:mm a", { locale: ar });
};

const sendMessage = async () => {
  const message = inputMessage.value.trim();
  if (!message) return;

  messages.value.push({
    role: "user",
    content: message,
    timestamp: new Date(),
  });

  inputMessage.value = "";
  loading.value = true;

  nextTick(scrollToBottom);

  try {
    // ✅ اختيار الـ API حسب دور المستخدم
    const endpoint = isAdmin.value ? "/api/admin/chat" : "/api/chat";
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error("حدث خطأ في الاتصال");
    }

    const data = await response.json();

    messages.value.push({
      role: "assistant",
      content: data.reply || "عذراً، لم أستطع فهم سؤالك",
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Chat Error:", error);
    messages.value.push({
      role: "assistant",
      content: "❌ عذراً، حدث خطأ في الاتصال بالخادم. حاول مرة أخرى.",
      timestamp: new Date(),
    });
  } finally {
    loading.value = false;
    nextTick(scrollToBottom);
  }
};
</script>
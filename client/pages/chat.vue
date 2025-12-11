<template>
  <div class="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 shadow px-4 py-3">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">LLM Chat</h1>
    </header>

    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="[
          'flex',
          message.role === 'user' ? 'justify-end' : 'justify-start',
        ]"
      >
        <div
          :class="[
            'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
            message.role === 'user'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white',
          ]"
        >
          {{ message.content }}
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <form @submit.prevent="sendMessage" class="flex space-x-2">
        <input
          v-model="newMessage"
          type="text"
          :disabled="isStreaming"
          placeholder="Введите сообщение..."
          class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        />
        <button
          v-if="!isStreaming"
          type="submit"
          class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Отправить
        </button>
        <button
          v-else
          type="button"
          @click="stopStream"
          class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Остановить
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const conversationId = ref('default-conversation-id'); // В реальном приложении получать из роута
const messages = ref([]);
const newMessage = ref('');
const { isStreaming, startStream, stopStream } = useSseStream(conversationId.value);

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  const userMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: newMessage.value,
  };

  messages.value.push(userMessage);
  const messageContent = newMessage.value;
  newMessage.value = '';

  try {
    // Отправка сообщения на сервер
    const response = await $fetch(
      `${config.public.apiBase}/api/conversations/${conversationId.value}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: { content: messageContent },
      }
    );

    // Добавление пустого сообщения ассистента
    const assistantMessage = {
      id: response.assistantMessage.id,
      role: 'assistant',
      content: '',
    };
    messages.value.push(assistantMessage);

    // Запуск SSE-стриминга
    startStream(
      (chunk) => {
        assistantMessage.content += chunk;
      },
      () => {
        console.log('Stream ended');
      }
    );
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};
</script>

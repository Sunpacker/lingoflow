import { ref } from "vue";

export function useSseStream(conversationId: string) {
  const runtimeConfig = useRuntimeConfig();
  const isStreaming = ref(false);
  const streamContent = ref("");
  const error = ref<Error | null>(null);
  let eventSource: EventSource | null = null;

  const startStream = (onChunk: (chunk: string) => void, onEnd: () => void) => {
    if (isStreaming.value) return;

    isStreaming.value = true;
    streamContent.value = "";
    error.value = null;

    // Предполагаем, что API_BASE ведет к Nginx, который проксирует к server
    const url = `${runtimeConfig.public.apiBase}/api/conversations/${conversationId}/messages/stream`;

    // Добавление токена аутентификации в заголовки EventSource невозможно напрямую.
    // В реальном приложении нужно использовать куки (JWT/Refresh) или проксировать
    // запросы через серверный API Nuxt, который добавит заголовок.
    // Для простоты примера используем куки/сессию, которые браузер отправит автоматически.
    eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chunk") {
          onChunk(data.content);
        } else if (data.type === "end") {
          stopStream();
          onEnd();
        }
      } catch (e) {
        console.error("Error parsing SSE data:", e);
      }
    };

    eventSource.onerror = (e) => {
      console.error("SSE Error:", e);
      error.value = new Error("Connection error or stream interrupted.");
      stopStream();
    };
  };

  const stopStream = () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    isStreaming.value = false;
  };

  return {
    isStreaming,
    streamContent,
    error,
    startStream,
    stopStream,
  };
}

import { describe, it, expect } from "vitest";
import { useSseStream } from "~/composables/useSseStream";

describe("useSseStream", () => {
  it("should initialize with correct default values", () => {
    const { isStreaming, streamContent, error } = useSseStream("test-id-123");

    expect(isStreaming.value).toBe(false);
    expect(streamContent.value).toBe("");
    expect(error.value).toBeNull();
  });

  // Примечание: Тестирование реального EventSource требует мокирования
  // глобального объекта EventSource, что выходит за рамки простого примера.
  // Этот тест демонстрирует базовую структуру Vitest.

  it("should have startStream and stopStream functions", () => {
    const { startStream, stopStream } = useSseStream("test-id-456");

    expect(typeof startStream).toBe("function");
    expect(typeof stopStream).toBe("function");
  });
});

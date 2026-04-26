module ContextStrategies
  class NoCompression < Base
    def prepare(conversation, &block)
      # Intentional no-op — full history is sent to the LLM every turn.
    end
  end
end

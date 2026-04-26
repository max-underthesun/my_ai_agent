module ContextStrategies
  class KeepLastN < Base
    def initialize(n:, summarizer:)
      @n = n
      @summarizer = summarizer
    end

    def prepare(conversation, &block)
      return if conversation.messages.length <= @n * 2

      excess = conversation.messages.length - @n
      compress(conversation, excess, @summarizer, &block)
    end
  end
end

module ContextStrategies
  class Base
    def prepare(conversation, &block)
      raise NotImplementedError, "#{self.class.name} must implement #prepare"
    end

    protected

    def compress(conversation, count, summarizer, &block)
      block&.call(compressing: true)
      messages_to_summarize = conversation.messages.first(count)
      new_summary = summarizer.call(
        existing_summary: conversation.summary,
        messages: messages_to_summarize
      )
      conversation.replace_oldest_with_summary(count, new_summary)
      block&.call(compressed: true, summary: new_summary)
    end
  end
end

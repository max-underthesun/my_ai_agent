module ContextStrategies
  class AutoCompression < Base
    THRESHOLD = 0.8
    KEEP_LAST = 10

    def initialize(client:, summarizer:, threshold: THRESHOLD, keep_last: KEEP_LAST)
      @client = client
      @summarizer = summarizer
      @threshold = threshold
      @keep_last = keep_last
    end

    def prepare(conversation, &block)
      limit = @client.context_window_limit
      target = (limit * @threshold).to_i
      estimated = Openai::TokenEstimator.estimate_messages(conversation.api_messages)

      return if estimated <= target

      keep = [@keep_last, conversation.messages.length].min
      excess = conversation.messages.length - keep
      return if excess <= 0

      compress(conversation, excess, @summarizer, &block)
    end
  end
end

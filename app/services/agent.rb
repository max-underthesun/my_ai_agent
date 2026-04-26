class Agent
  attr_reader :conversation

  def initialize(conversation:, client:, context_strategy: ContextStrategies::NoCompression.new)
    @conversation = conversation
    @client = client
    @context_strategy = context_strategy
  end

  def call(query, max_output_tokens: nil, temperature: nil, &block)
    @context_strategy.prepare(@conversation, &block)

    @conversation.add_message(role: "user", content: query)

    started_at = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    assistant_text = +""
    final_usage = nil

    @client.stream(input: @conversation.api_messages, max_output_tokens: max_output_tokens, temperature: temperature) do |event|
      mapped = Openai::ResponseMapper.map(event)
      next unless mapped

      raise Openai::Client::ApiError, mapped[:error] if mapped[:error]

      assistant_text << mapped[:delta] if mapped[:delta]

      if mapped[:done]
        duration = (Process.clock_gettime(Process::CLOCK_MONOTONIC) - started_at).round(2)
        mapped[:duration] = duration
        final_usage = mapped[:usage]
        @conversation.add_message(
          role: "assistant",
          content: assistant_text,
          usage: final_usage,
          duration: duration
        )
        @conversation.update_title_from_query(query)
      end

      block.call(mapped)
    end
  end

  def discard_pending_query
    last = @conversation.messages.last
    @conversation.remove_last_message if last&.dig(:role) == "user"
  end
end

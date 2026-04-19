class Agent
  attr_reader :conversation

  def initialize(conversation:, model: nil)
    @conversation = conversation
    @client = model ? Openai::Client.new(model: model) : Openai::Client.new
  end

  def call(query, max_output_tokens: nil, temperature: nil, &block)
    @conversation.add_message(role: "user", content: query)

    started_at = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    assistant_text = +""

    @client.stream(input: @conversation.messages, max_output_tokens: max_output_tokens, temperature: temperature) do |event|
      mapped = Openai::ResponseMapper.map(event)
      next unless mapped

      assistant_text << mapped[:delta] if mapped[:delta]

      if mapped[:done]
        mapped[:duration] = (Process.clock_gettime(Process::CLOCK_MONOTONIC) - started_at).round(2)
        @conversation.add_message(role: "assistant", content: assistant_text)
        @conversation.update_title_from_query(query)
      end

      block.call(mapped)
    end
  end

  def discard_pending_query
    last = @conversation.messages.last
    @conversation.remove_last_message if last&.dig(:role) == "user"
  end

  def available_models
    @client.list_chat_models
  end

  def default_model
    ENV.fetch("OPENAI_MODEL")
  end
end

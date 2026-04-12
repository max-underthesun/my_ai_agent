class Agent
  def initialize(model: nil)
    @client = if model
      Openai::Client.new(model: model)
    else
      Openai::Client.new
    end
  end

  def call(query, max_output_tokens: nil, temperature: nil, &block)
    started_at = Process.clock_gettime(Process::CLOCK_MONOTONIC)

    @client.stream(input: query, max_output_tokens: max_output_tokens, temperature: temperature) do |event|
      mapped = Openai::ResponseMapper.map(event)
      next unless mapped

      if mapped[:done]
        mapped[:duration] = (Process.clock_gettime(Process::CLOCK_MONOTONIC) - started_at).round(2)
      end

      block.call(mapped)
    end
  end

  def available_models
    @client.list_chat_models
  end

  def default_model
    ENV.fetch("OPENAI_MODEL")
  end
end

module Openai
  class Summarizer
    PROMPT_PREFIX = <<~PROMPT.freeze
      You are a conversation summarizer. Update the running summary below to include the new messages.
      Preserve key facts, user goals, constraints, decisions, and any context needed to continue the dialogue.
      Keep the summary concise but complete. Output only the updated summary, no preamble.
    PROMPT

    def initialize(client:)
      @client = client
    end

    def call(existing_summary:, messages:)
      input = build_input(existing_summary, messages)
      summary = +""

      @client.stream(input: input) do |event|
        mapped = ResponseMapper.map(event)
        next unless mapped

        raise Client::ApiError, mapped[:error] if mapped[:error]

        summary << mapped[:delta] if mapped[:delta]
      end

      summary
    end

    private

    def build_input(existing_summary, messages)
      parts = [PROMPT_PREFIX]
      parts << "Current summary:\n#{existing_summary.presence || '(none yet)'}\n"
      parts << "New messages to incorporate:"
      messages.each do |m|
        parts << "#{m[:role]}: #{m[:content]}"
      end
      parts.join("\n")
    end
  end
end

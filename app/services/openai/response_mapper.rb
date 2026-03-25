module Openai
  class ResponseMapper
    def self.map(event)
      case event["type"]
      when "response.output_text.delta"
        delta = event["delta"]
        { delta: delta } if delta.present?
      when "response.completed"
        done_data = { done: true }
        usage = event.dig("response", "usage")
        if usage
          done_data[:usage] = {
            input_tokens: usage["input_tokens"],
            output_tokens: usage["output_tokens"],
            total_tokens: usage["total_tokens"]
          }
        end
        done_data
      end
    end
  end
end

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
      when "response.failed"
        message = event.dig("response", "error", "message") || "Response failed"
        { error: message }
      when "response.incomplete"
        reason = event.dig("response", "incomplete_details", "reason") || "unknown reason"
        { error: "Response incomplete: #{reason}" }
      when "error"
        message = event["message"] || event.dig("error", "message") || "Stream error"
        { error: message }
      else
        Rails.logger.debug "Openai::ResponseMapper unhandled event type: #{event["type"]}"
        nil
      end
    end
  end
end

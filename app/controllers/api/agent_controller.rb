require "net/http"

class Api::AgentController < ApplicationController
  skip_before_action :verify_authenticity_token

  include ActionController::Live

  OPENAI_TIMEOUT = 60 # seconds

  def query
    user_query = params[:query].to_s.strip
    if user_query.blank?
      response.headers["Content-Type"] = "application/json"
      response.stream.write({ error: "Query cannot be blank" }.to_json)
      response.stream.close
      return
    end

    response.headers["Content-Type"] = "text/event-stream"
    response.headers["Cache-Control"] = "no-cache"
    response.headers["Connection"] = "keep-alive"
    response.headers["X-Accel-Buffering"] = "no"

    uri = URI("https://api.openai.com/v1/responses")

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = OPENAI_TIMEOUT
    http.read_timeout = OPENAI_TIMEOUT

    request = Net::HTTP::Post.new(uri)
    request["Content-Type"] = "application/json"
    request["Authorization"] = "Bearer #{ENV.fetch("OPENAI_API_KEY")}"
    body = {
      model: ENV.fetch("OPENAI_MODEL", "gpt-4o-mini"),
      input: user_query,
      stream: true
    }

    max_tokens = params[:max_output_tokens].to_i
    body[:max_output_tokens] = max_tokens if max_tokens > 0

    request.body = body.to_json

    http.request(request) do |openai_response|
      unless openai_response.is_a?(Net::HTTPSuccess)
        body = openai_response.read_body
        data = JSON.parse(body) rescue {}
        error_msg = data.dig("error", "message") || "OpenAI API error"
        response.stream.write("data: #{({ error: error_msg }).to_json}\n\n")
        response.stream.close
        return
      end

      buffer = ""
      openai_response.read_body do |chunk|
        buffer += chunk

        # SSE events are separated by \n\n; each event may have multiple fields (event:, data:)
        while (idx = buffer.index("\n\n"))
          raw_event = buffer.slice!(0, idx + 2)

          # Extract the data: line from the SSE event block
          data_line = raw_event.lines.find { |l| l.start_with?("data: ") }
          next unless data_line

          json_str = data_line.sub(/^data: /, "").strip
          next if json_str == "[DONE]"

          event = JSON.parse(json_str) rescue next

          if event["type"] == "response.output_text.delta"
            delta = event["delta"]
            if delta.present?
              response.stream.write("data: #{({ delta: delta }).to_json}\n\n")
            end
          elsif event["type"] == "response.completed"
            usage = event.dig("response", "usage")
            done_data = { done: true }
            if usage
              done_data[:usage] = {
                input_tokens: usage["input_tokens"],
                output_tokens: usage["output_tokens"],
                total_tokens: usage["total_tokens"]
              }
            end
            response.stream.write("data: #{done_data.to_json}\n\n")
          end
        end
      end
    end
  rescue Net::OpenTimeout, Net::ReadTimeout
    response.stream.write("data: #{({ error: "OpenAI request timed out" }).to_json}\n\n")
  rescue IOError
    # Client disconnected (Stop button pressed) — this is expected
  rescue StandardError => e
    Rails.logger.error "AgentController error: #{e.class} - #{e.message}"
    Rails.logger.error e.backtrace&.first(5)&.join("\n")
    response.stream.write("data: #{({ error: e.message }).to_json}\n\n") rescue nil
  ensure
    response.stream.close rescue nil
  end

end

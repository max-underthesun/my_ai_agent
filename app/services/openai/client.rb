require "net/http"

module Openai
  class Client
    ENDPOINT = "https://api.openai.com/v1/responses"
    TIMEOUT = 60 # seconds

    def initialize(api_key: ENV.fetch("OPENAI_API_KEY"), model: ENV.fetch("OPENAI_MODEL", "gpt-4o-mini"))
      @api_key = api_key
      @model = model
    end

    def stream(input:, max_output_tokens: nil, &block)
      uri = URI(ENDPOINT)

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.open_timeout = TIMEOUT
      http.read_timeout = TIMEOUT

      request = Net::HTTP::Post.new(uri)
      request["Content-Type"] = "application/json"
      request["Authorization"] = "Bearer #{@api_key}"
      request.body = build_body(input, max_output_tokens).to_json

      http.request(request) do |response|
        unless response.is_a?(Net::HTTPSuccess)
          error_body = response.read_body
          data = JSON.parse(error_body) rescue {}
          error_msg = data.dig("error", "message") || "OpenAI API error"
          raise ApiError, error_msg
        end

        parser = StreamParser.new
        response.read_body do |chunk|
          parser.feed(chunk) do |event|
            block.call(event)
          end
        end
      end
    end

    private

    def build_body(input, max_output_tokens)
      body = {
        model: @model,
        input: input,
        stream: true
      }
      body[:max_output_tokens] = max_output_tokens if max_output_tokens&.positive?
      body
    end

    class ApiError < StandardError; end
  end
end

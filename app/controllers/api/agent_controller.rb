require "net/http"

class Api::AgentController < ApplicationController
  skip_before_action :verify_authenticity_token

  OPENAI_TIMEOUT = 30 # seconds

  def query
    user_query = params[:query].to_s.strip
    if user_query.blank?
      return render json: { error: "Query cannot be blank" }, status: :unprocessable_entity
    end

    uri = URI("https://api.openai.com/v1/responses")

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = OPENAI_TIMEOUT
    http.read_timeout = OPENAI_TIMEOUT

    request = Net::HTTP::Post.new(uri)
    request["Content-Type"] = "application/json"
    request["Authorization"] = "Bearer #{ENV.fetch("OPENAI_API_KEY")}"
    request.body = {
      model: ENV.fetch("OPENAI_MODEL", "gpt-4o-mini"),
      input: user_query
    }.to_json

    response = http.request(request)
    data = JSON.parse(response.body)

    if response.is_a?(Net::HTTPSuccess)
      answer = data
        .fetch("output", [])
        .flat_map { |item| item.fetch("content", []) }
        .select { |content| content["type"] == "output_text" }
        .map { |content| content["text"] }
        .join("\n")
        .strip

      if answer.present?
        render json: { response: answer }
      else
        render json: { error: "Unexpected response format from OpenAI" }, status: :bad_gateway
      end
    else
      render json: { error: data.dig("error", "message") || "OpenAI API error" }, status: :bad_gateway
    end
  rescue Net::OpenTimeout, Net::ReadTimeout
    render json: { error: "OpenAI request timed out" }, status: :gateway_timeout
  rescue JSON::ParserError
    render json: { error: "Invalid response from OpenAI" }, status: :bad_gateway
  rescue StandardError => e
    Rails.logger.error "AgentController error: #{e.class} - #{e.message}"
    Rails.logger.error e.backtrace&.first(5)&.join("\n")
    render json: { error: e.message }, status: :internal_server_error
  end
end

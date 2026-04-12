class Api::AgentController < ApplicationController
  skip_before_action :verify_authenticity_token

  include ActionController::Live

  def models
    agent = Agent.new
    render json: { models: agent.available_models, default_model: agent.default_model }
  rescue StandardError => e
    render json: { error: e.message }, status: :internal_server_error
  end

  def query
    user_query = params[:query].to_s.strip
    if user_query.blank?
      response.headers["Content-Type"] = "application/json"
      response.stream.write({ error: "Query cannot be blank" }.to_json)
      response.stream.close
      return
    end

    set_sse_headers

    agent = Agent.new(model: params[:model].presence)
    max_tokens = params[:max_output_tokens].to_i
    temperature = params[:temperature].present? ? params[:temperature].to_f : nil

    agent.call(user_query, max_output_tokens: max_tokens > 0 ? max_tokens : nil, temperature: temperature) do |event|
      response.stream.write("data: #{event.to_json}\n\n")
    end
  rescue Openai::Client::ApiError => e
    response.stream.write("data: #{({ error: e.message }).to_json}\n\n")
  rescue Net::OpenTimeout, Net::ReadTimeout
    response.stream.write("data: #{({ error: "OpenAI request timed out" }).to_json}\n\n")
  rescue IOError
    # Client disconnected (Stop button pressed) — expected
  rescue StandardError => e
    Rails.logger.error "AgentController error: #{e.class} - #{e.message}"
    Rails.logger.error e.backtrace&.first(5)&.join("\n")
    response.stream.write("data: #{({ error: e.message }).to_json}\n\n") rescue nil
  ensure
    response.stream.close rescue nil
  end

  private

  def set_sse_headers
    response.headers["Content-Type"] = "text/event-stream"
    response.headers["Cache-Control"] = "no-cache"
    response.headers["Connection"] = "keep-alive"
    response.headers["X-Accel-Buffering"] = "no"
  end
end

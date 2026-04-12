class Api::AgentController < ApplicationController
  skip_before_action :verify_authenticity_token

  include ActionController::Live

  def models
    client = Openai::Client.new
    render json: { models: client.list_chat_models, default_model: ENV.fetch("OPENAI_MODEL") }
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

    model = params[:model].presence
    client = model ? Openai::Client.new(model: model) : Openai::Client.new
    max_tokens = params[:max_output_tokens].to_i
    temperature = params[:temperature].present? ? params[:temperature].to_f : nil
    started_at = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    client.stream(input: user_query, max_output_tokens: max_tokens > 0 ? max_tokens : nil, temperature: temperature) do |event|
      mapped = Openai::ResponseMapper.map(event)
      if mapped
        if mapped[:done]
          duration = (Process.clock_gettime(Process::CLOCK_MONOTONIC) - started_at).round(2)
          mapped[:duration] = duration
        end
        response.stream.write("data: #{mapped.to_json}\n\n")
      end
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

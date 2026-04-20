class Conversation
  attr_reader :id, :created_at
  attr_accessor :title, :updated_at

  def initialize(id: nil, title: "New conversation", messages: [], created_at: nil, updated_at: nil)
    @id = id || generate_id
    @title = title
    @messages = messages
    @created_at = created_at || Time.now.iso8601
    @updated_at = updated_at || @created_at
  end

  def messages
    @messages.dup
  end

  def api_messages
    @messages.map { |m| { role: m[:role], content: m[:content] } }
  end

  def add_message(role:, content:, usage: nil, duration: nil)
    msg = { role: role, content: content }
    msg[:usage] = usage if usage
    msg[:duration] = duration if duration
    @messages << msg
    @updated_at = Time.now.iso8601
  end

  def remove_last_message
    @messages.pop
    @updated_at = Time.now.iso8601
  end

  def update_title_from_query(query)
    return unless @messages.count { |m| m[:role] == "user" } == 1

    @title = query.truncate(60)
  end

  def total_usage
    totals = { input_tokens: 0, output_tokens: 0, total_tokens: 0 }
    @messages.each do |m|
      next unless m[:usage]

      totals[:input_tokens] += m[:usage][:input_tokens].to_i
      totals[:output_tokens] += m[:usage][:output_tokens].to_i
      totals[:total_tokens] += m[:usage][:total_tokens].to_i
    end
    totals
  end

  def total_duration
    @messages.sum { |m| m[:duration].to_f }.round(2)
  end

  def to_hash
    {
      id: @id,
      title: @title,
      created_at: @created_at,
      updated_at: @updated_at,
      messages: @messages,
      total_usage: total_usage,
      total_duration: total_duration
    }
  end

  def meta
    {
      id: @id,
      title: @title,
      created_at: @created_at,
      updated_at: @updated_at
    }
  end

  private

  def generate_id
    "#{Time.now.strftime('%Y%m%d_%H%M%S')}_#{SecureRandom.hex(4)}"
  end
end

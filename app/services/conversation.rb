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

  def add_message(role:, content:)
    @messages << { role: role, content: content }
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

  def to_hash
    {
      id: @id,
      title: @title,
      created_at: @created_at,
      updated_at: @updated_at,
      messages: @messages
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

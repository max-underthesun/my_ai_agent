class ConversationRepository
  STORAGE_DIR = Rails.root.join("storage", "conversations")

  def create
    Conversation.new
  end

  def load(id)
    path = file_path(id)
    raise "Conversation not found" unless File.exist?(path)

    data = JSON.parse(File.read(path), symbolize_names: true)
    Conversation.new(
      id: data[:id],
      title: data[:title],
      summary: data[:summary],
      messages: data[:messages],
      created_at: data[:created_at],
      updated_at: data[:updated_at]
    )
  end

  def save(conversation)
    FileUtils.mkdir_p(STORAGE_DIR)
    File.write(file_path(conversation.id), JSON.pretty_generate(conversation.to_hash))
  end

  def delete(id)
    path = file_path(id)
    File.delete(path) if File.exist?(path)
  end

  def list
    FileUtils.mkdir_p(STORAGE_DIR)
    Dir.glob(STORAGE_DIR.join("*.json")).map do |path|
      data = JSON.parse(File.read(path), symbolize_names: true)
      { id: data[:id], title: data[:title], created_at: data[:created_at], updated_at: data[:updated_at] }
    end.sort_by { |c| c[:updated_at] || c[:created_at] }.reverse
  end

  private

  def file_path(id)
    STORAGE_DIR.join("#{id}.json")
  end
end

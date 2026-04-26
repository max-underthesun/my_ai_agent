module Openai
  class TokenEstimator
    CHARS_PER_TOKEN = 4

    def self.estimate(text)
      (text.to_s.length / CHARS_PER_TOKEN.to_f).ceil
    end

    def self.estimate_messages(messages)
      messages.sum { |m| estimate(m[:content]) + 4 }
    end
  end
end

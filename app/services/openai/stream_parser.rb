module Openai
  class StreamParser
    def initialize
      @buffer = ""
    end

    def feed(chunk)
      @buffer += chunk

      while (idx = @buffer.index("\n\n"))
        raw_event = @buffer.slice!(0, idx + 2)

        data_line = raw_event.lines.find { |l| l.start_with?("data: ") }
        next unless data_line

        json_str = data_line.sub(/^data: /, "").strip
        next if json_str == "[DONE]"

        event = JSON.parse(json_str) rescue next
        yield event
      end
    end
  end
end

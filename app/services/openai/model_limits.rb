module Openai
  class ModelLimits
    DEFAULT_LIMIT = 128_000

    LIMITS = {
      /\Agpt-3\.5/ => 16_000,
      /\Agpt-4-32k/ => 32_000,
      /\Agpt-4-turbo/ => 128_000,
      /\Agpt-4o/ => 128_000,
      /\Agpt-4\.1/ => 1_000_000,
      /\Agpt-4\b/ => 8_000,
      /\Agpt-5/ => 400_000,
      /\Ao[134]/ => 200_000
    }.freeze

    def self.for(model_name)
      pattern, limit = LIMITS.find { |pattern, _| model_name.match?(pattern) }
      limit || DEFAULT_LIMIT
    end
  end
end

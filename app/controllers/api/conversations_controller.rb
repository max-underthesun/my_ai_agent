module Api
  class ConversationsController < ApplicationController
    skip_before_action :verify_authenticity_token

    def index
      repo = ConversationRepository.new
      render json: { conversations: repo.list }
    end

    def show
      repo = ConversationRepository.new
      conversation = repo.load(params[:id])
      render json: conversation.to_hash
    rescue StandardError => e
      render json: { error: e.message }, status: :not_found
    end

    def destroy
      repo = ConversationRepository.new
      repo.delete(params[:id])
      render json: { ok: true }
    rescue StandardError => e
      render json: { error: e.message }, status: :internal_server_error
    end
  end
end

Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  root "pages#home"

  namespace :api do
    post "agent/query", to: "agent#query"
    get "agent/models", to: "agent#models"
    resources :conversations, only: [:index, :show, :destroy]
  end
end

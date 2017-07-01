Rails.application.routes.draw do

  namespace :api, defaults: { format: :json } do
    resources :publishers, only: [:index]
  end

  root 'static_pages#root'
end

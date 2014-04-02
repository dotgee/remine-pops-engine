PopsRedmineEngine::Engine.routes.draw do
  RedmineApp::Application.routes.draw do
    get 'searchHal', to: 'hal#searchHal'
    resources :projects do
      member do
        get 'timeline'
      end
    end
  end
end

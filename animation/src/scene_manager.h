#pragma once
#include "parallax.h"
#include "renderer.h"

enum class SceneState {
    WALKING,
    MICROSCOPE,
    ZOOM
};

class SceneManager {
public:
    SceneManager();
    void init(Renderer& renderer);
    void update(float dt);
    void render(Renderer& renderer);

private:
    SceneState currentState;
    float stateTime;
    float characterX;
    float characterY;
    Parallax parallax;
    
    SDL_Texture* texRbc;
    SDL_Texture* texMicroscope;
};

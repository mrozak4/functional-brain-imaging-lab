#pragma once
#include "renderer.h"
#include "parallax.h"

enum class SceneState {
    WALKING,
    MICROSCOPE,
    ZOOM
};

class SceneManager {
public:
    SceneManager();
    void update(float dt);
    void render(Renderer& renderer);

private:
    SceneState currentState;
    float stateTime;
    Parallax parallax;
    
    float characterX;
    float characterY;
};

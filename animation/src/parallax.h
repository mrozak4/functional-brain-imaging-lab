#pragma once
#include "renderer.h"

class Parallax {
public:
    Parallax();
    void setTexture(SDL_Texture* tex);
    void update(float dt);
    void render(Renderer& renderer);

private:
    float offsetX;
    SDL_Texture* texBg;
};

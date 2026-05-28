#pragma once
#include "renderer.h"

class Parallax {
public:
    Parallax();
    void update(float dt);
    void render(Renderer& renderer);

private:
    float offsetX;
};

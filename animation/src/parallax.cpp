#include "parallax.h"

Parallax::Parallax() : offsetX(0.0f), texBg(nullptr) {}

void Parallax::setTexture(SDL_Texture* tex) {
    texBg = tex;
}

void Parallax::update(float dt) {
    offsetX += 50.0f * dt;
    if (offsetX > 800.0f) {
        offsetX = 0.0f;
    }
}

void Parallax::render(Renderer& renderer) {
    if (texBg) {
        int mgX = -(int)offsetX;
        renderer.drawTexture(texBg, mgX, 0, 800, 600);
        renderer.drawTexture(texBg, mgX + 800, 0, 800, 600);
    } else {
        renderer.drawRect(0, 0, 800, 600, 135, 206, 235, 255);
    }
}

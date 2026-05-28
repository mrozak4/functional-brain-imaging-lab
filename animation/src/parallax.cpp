#include "parallax.h"

Parallax::Parallax() : offsetX(0.0f) {}

void Parallax::update(float dt) {
    offsetX += 50.0f * dt; // scroll speed
    if (offsetX > 800.0f) {
        offsetX = 0.0f; // loop back
    }
}

void Parallax::render(Renderer& renderer) {
    // Background 1 (Sky/Wall)
    renderer.drawRect(0, 0, 800, 600, 135, 206, 235, 255);
    
    // Background 2 (Distant lab equipment, scrolls slowly)
    int bgX = -(int)(offsetX * 0.5f);
    renderer.drawRect(bgX, 200, 800, 400, 200, 200, 200, 255);
    renderer.drawRect(bgX + 800, 200, 800, 400, 200, 200, 200, 255);

    // Background 3 (Midground lab bench, scrolls faster)
    int mgX = -(int)offsetX;
    renderer.drawRect(mgX, 400, 800, 200, 139, 69, 19, 255);
    renderer.drawRect(mgX + 800, 400, 800, 200, 139, 69, 19, 255);
}

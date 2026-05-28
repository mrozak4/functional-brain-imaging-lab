#include "scene_manager.h"
#include <iostream>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif

SceneManager::SceneManager() : currentState(SceneState::WALKING), stateTime(0.0f), characterX(100.0f), characterY(350.0f) {}

void SceneManager::update(float dt) {
    stateTime += dt;

    switch (currentState) {
        case SceneState::WALKING:
            parallax.update(dt);
            // Character stays in place while background moves
            if (stateTime > 3.0f) {
                currentState = SceneState::MICROSCOPE;
                stateTime = 0.0f;
            }
            break;
            
        case SceneState::MICROSCOPE:
            // Parallax stops, character moves forward to the microscope
            characterX += 100.0f * dt;
            if (stateTime > 3.0f) {
                currentState = SceneState::ZOOM;
                stateTime = 0.0f;
            }
            break;
            
        case SceneState::ZOOM:
            // Zooming effect (stateTime drives the zoom animation in render)
            break;
    }
}

void SceneManager::render(Renderer& renderer) {
    parallax.render(renderer);

    // Draw Microscope placeholder
    if (currentState == SceneState::MICROSCOPE || currentState == SceneState::ZOOM) {
        // Microscope
        renderer.drawRect(400, 250, 100, 150, 50, 50, 50, 255);
    }

    // Draw Character placeholder (Red Blood Cell)
    int rbcSize = 50;
    if (currentState == SceneState::ZOOM) {
        // Expand the character/lens to simulate zooming in
        rbcSize += (int)(stateTime * 300);
        // Keep character centered during zoom
        int adjustedX = (int)characterX - (rbcSize - 50) / 2;
        int adjustedY = (int)characterY - (rbcSize - 50) / 2;
        renderer.drawRect(adjustedX, adjustedY, rbcSize, rbcSize, 220, 20, 20, 255);
    } else {
        renderer.drawRect((int)characterX, (int)characterY, rbcSize, rbcSize, 220, 20, 20, 255);
    }
    
    // Zoom transition overlay (fade to black)
    if (currentState == SceneState::ZOOM) {
        int alpha = (int)(stateTime * 100);
        if (alpha > 255) alpha = 255;
        renderer.drawRect(0, 0, 800, 600, 0, 0, 0, alpha);
        
        if (alpha == 255) {
#ifdef __EMSCRIPTEN__
            EM_ASM(
                if (window.onAnimationFinished) window.onAnimationFinished();
            );
#endif
        }
    }
}

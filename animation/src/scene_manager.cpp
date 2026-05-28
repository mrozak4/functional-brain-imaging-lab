#include "scene_manager.h"
#include <iostream>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif

SceneManager::SceneManager() : currentState(SceneState::WALKING), stateTime(0.0f), characterX(100.0f), characterY(350.0f), texRbc(nullptr), texMicroscope(nullptr) {}

void SceneManager::init(Renderer& renderer) {
    texRbc = renderer.loadTexture("/assets/rbc.png");
    texMicroscope = renderer.loadTexture("/assets/microscope.png");
    SDL_Texture* texBg = renderer.loadTexture("/assets/background.png");
    parallax.setTexture(texBg);
}

void SceneManager::update(float dt) {
    stateTime += dt;

    switch (currentState) {
        case SceneState::WALKING:
            parallax.update(dt);
            if (stateTime > 3.0f) {
                currentState = SceneState::MICROSCOPE;
                stateTime = 0.0f;
            }
            break;
            
        case SceneState::MICROSCOPE:
            characterX += 100.0f * dt;
            if (stateTime > 3.0f) {
                currentState = SceneState::ZOOM;
                stateTime = 0.0f;
            }
            break;
            
        case SceneState::ZOOM:
            break;
    }
}

void SceneManager::render(Renderer& renderer) {
    renderer.clear(250, 240, 230, 255); // base color behind everything
    parallax.render(renderer);

    if (currentState == SceneState::MICROSCOPE || currentState == SceneState::ZOOM) {
        if (texMicroscope) {
            renderer.drawTexture(texMicroscope, 450, 200, 200, 300);
        } else {
            renderer.drawRect(450, 200, 200, 300, 50, 50, 50, 255);
        }
    }

    int rbcSize = 150;
    if (currentState == SceneState::ZOOM) {
        rbcSize += (int)(stateTime * 600);
        int adjustedX = (int)characterX - (rbcSize - 150) / 2;
        int adjustedY = (int)characterY - (rbcSize - 150) / 2;
        if (texRbc) {
            renderer.drawTexture(texRbc, adjustedX, adjustedY, rbcSize, rbcSize);
        } else {
            renderer.drawRect(adjustedX, adjustedY, rbcSize, rbcSize, 220, 20, 20, 255);
        }
    } else {
        if (texRbc) {
            renderer.drawTexture(texRbc, (int)characterX, (int)characterY, rbcSize, rbcSize);
        } else {
            renderer.drawRect((int)characterX, (int)characterY, rbcSize, rbcSize, 220, 20, 20, 255);
        }
    }
    
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

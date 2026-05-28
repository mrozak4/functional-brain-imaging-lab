#include "renderer.h"
#include "scene_manager.h"
#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif
#include <iostream>

Renderer renderer;
SceneManager sceneManager;
Uint32 lastTime = 0;

void mainLoop() {
    Uint32 currentTime = SDL_GetTicks();
    float dt = (currentTime - lastTime) / 1000.0f;
    lastTime = currentTime;

    if (dt > 0.1f) dt = 0.1f;

    sceneManager.update(dt);

    renderer.clear(0, 0, 0, 255);
    sceneManager.render(renderer);
    renderer.present();
}

int main(int argc, char* args[]) {
    if (!renderer.init(800, 600)) {
        return -1;
    }
    
    sceneManager.init(renderer);

    lastTime = SDL_GetTicks();

#ifdef __EMSCRIPTEN__
    emscripten_set_main_loop(mainLoop, 0, 1);
#else
    bool quit = false;
    SDL_Event e;
    while (!quit) {
        while (SDL_PollEvent(&e) != 0) {
            if (e.type == SDL_QUIT) quit = true;
        }
        mainLoop();
        SDL_Delay(16);
    }
#endif

    return 0;
}

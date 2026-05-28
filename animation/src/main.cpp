#include "renderer.h"
#include "scene_manager.h"
#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif
#include <iostream>

Renderer renderer;
SceneManager sceneManager;
Uint32 lastTime = 0;

#ifdef EXPORT_VIDEO
int frameCount = 0;
const int MAX_FRAMES = 520; // ~8.6 seconds of animation at 60fps
#endif

void mainLoop() {
#ifdef EXPORT_VIDEO
    float dt = 1.0f / 60.0f; // Fixed dt for perfect smooth video playback
#else
    Uint32 currentTime = SDL_GetTicks();
    float dt = (currentTime - lastTime) / 1000.0f;
    lastTime = currentTime;

    if (dt > 0.1f) dt = 0.1f;
#endif

    sceneManager.update(dt);

    renderer.clear(0, 0, 0, 255);
    sceneManager.render(renderer);
    renderer.present();

#ifdef EXPORT_VIDEO
    char filename[128];
    sprintf(filename, "build/frame_%04d.bmp", frameCount);
    renderer.saveFrame(filename);
    frameCount++;
    if (frameCount >= MAX_FRAMES) {
        std::cout << "Successfully exported " << frameCount << " frames." << std::endl;
        exit(0);
    }
#endif
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

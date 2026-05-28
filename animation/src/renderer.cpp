#include "renderer.h"
#include <iostream>

Renderer::Renderer() : window(nullptr), sdl_renderer(nullptr) {}

Renderer::~Renderer() {
    if (sdl_renderer) SDL_DestroyRenderer(sdl_renderer);
    if (window) SDL_DestroyWindow(window);
}

bool Renderer::init(int width, int height) {
    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        std::cerr << "SDL could not initialize! SDL_Error: " << SDL_GetError() << std::endl;
        return false;
    }

    // Set blend mode to support alpha rendering if needed
    SDL_SetHint(SDL_HINT_RENDER_SCALE_QUALITY, "1");

    window = SDL_CreateWindow("Intro Animation", SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED, width, height, SDL_WINDOW_SHOWN);
    if (!window) {
        std::cerr << "Window could not be created! SDL_Error: " << SDL_GetError() << std::endl;
        return false;
    }

    sdl_renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);
    if (!sdl_renderer) {
        std::cerr << "Renderer could not be created! SDL_Error: " << SDL_GetError() << std::endl;
        return false;
    }

    SDL_SetRenderDrawBlendMode(sdl_renderer, SDL_BLENDMODE_BLEND);

    return true;
}

void Renderer::clear(int r, int g, int b, int a) {
    SDL_SetRenderDrawColor(sdl_renderer, r, g, b, a);
    SDL_RenderClear(sdl_renderer);
}

void Renderer::present() {
    SDL_RenderPresent(sdl_renderer);
}

void Renderer::drawRect(int x, int y, int w, int h, int r, int g, int b, int a) {
    SDL_Rect rect = {x, y, w, h};
    SDL_SetRenderDrawColor(sdl_renderer, r, g, b, a);
    SDL_RenderFillRect(sdl_renderer, &rect);
}

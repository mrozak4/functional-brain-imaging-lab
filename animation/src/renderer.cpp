#include "renderer.h"
#include <iostream>

Renderer::Renderer() : window(nullptr), sdl_renderer(nullptr) {}

Renderer::~Renderer() {
    if (sdl_renderer) SDL_DestroyRenderer(sdl_renderer);
    if (window) SDL_DestroyWindow(window);
    IMG_Quit();
}

bool Renderer::init(int width, int height) {
    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        return false;
    }
    
    int imgFlags = IMG_INIT_PNG;
    if (!(IMG_Init(imgFlags) & imgFlags)) {
        return false;
    }

    SDL_SetHint(SDL_HINT_RENDER_SCALE_QUALITY, "1");

    window = SDL_CreateWindow("Intro Animation", SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED, width, height, SDL_WINDOW_SHOWN);
    sdl_renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);
    SDL_SetRenderDrawBlendMode(sdl_renderer, SDL_BLENDMODE_BLEND);
    return true;
}

SDL_Texture* Renderer::loadTexture(const std::string& path) {
    SDL_Surface* surface = IMG_Load(path.c_str());
    if (!surface) return nullptr;
    SDL_Texture* texture = SDL_CreateTextureFromSurface(sdl_renderer, surface);
    SDL_FreeSurface(surface);
    return texture;
}

void Renderer::clear(int r, int g, int b, int a) {
    SDL_SetRenderDrawColor(sdl_renderer, r, g, b, a);
    SDL_RenderClear(sdl_renderer);
}

void Renderer::present() {
    SDL_RenderPresent(sdl_renderer);
}

void Renderer::drawTexture(SDL_Texture* texture, int x, int y, int w, int h) {
    if (!texture) return;
    SDL_Rect dest = {x, y, w, h};
    SDL_SetTextureAlphaMod(texture, 255);
    SDL_RenderCopy(sdl_renderer, texture, nullptr, &dest);
}

void Renderer::drawTextureAlpha(SDL_Texture* texture, int x, int y, int w, int h, int alpha) {
    if (!texture) return;
    SDL_Rect dest = {x, y, w, h};
    SDL_SetTextureAlphaMod(texture, alpha);
    SDL_RenderCopy(sdl_renderer, texture, nullptr, &dest);
}

void Renderer::drawRect(int x, int y, int w, int h, int r, int g, int b, int a) {
    SDL_Rect rect = {x, y, w, h};
    SDL_SetRenderDrawColor(sdl_renderer, r, g, b, a);
    SDL_RenderFillRect(sdl_renderer, &rect);
}

#pragma once
#include <SDL2/SDL.h>
#include <string>

class Renderer {
public:
    Renderer();
    ~Renderer();

    bool init(int width, int height);
    void clear(int r, int g, int b, int a);
    void present();
    
    // Draw placeholder rectangle
    void drawRect(int x, int y, int w, int h, int r, int g, int b, int a);

private:
    SDL_Window* window;
    SDL_Renderer* sdl_renderer;
};

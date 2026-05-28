#pragma once
#include <SDL2/SDL.h>
#include <SDL2/SDL_image.h>
#include <string>

class Renderer {
public:
    Renderer();
    ~Renderer();

    bool init(int width, int height);
    void clear(int r, int g, int b, int a);
    void present();
    
    SDL_Texture* loadTexture(const std::string& path);
    void drawTexture(SDL_Texture* texture, int x, int y, int w, int h);
    void drawTextureAlpha(SDL_Texture* texture, int x, int y, int w, int h, int alpha);
    void drawRect(int x, int y, int w, int h, int r, int g, int b, int a);

private:
    SDL_Window* window;
    SDL_Renderer* sdl_renderer;
};

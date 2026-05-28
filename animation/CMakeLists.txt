cmake_minimum_required(VERSION 3.15)
project(intro_animation)

set(CMAKE_CXX_STANDARD 17)

if(EMSCRIPTEN)
    set(CMAKE_EXECUTABLE_SUFFIX ".js")
    add_compile_options("-sUSE_SDL=2" "-sUSE_SDL_IMAGE=2")
    add_link_options("-sUSE_SDL=2" "-sUSE_SDL_IMAGE=2" "-sSDL2_IMAGE_FORMATS=['png']" "-sWASM=1" "-sALLOW_MEMORY_GROWTH=1" "-sNO_EXIT_RUNTIME=0" "--preload-file" "${CMAKE_SOURCE_DIR}/assets@/assets")
endif()

set(SOURCES
    src/main.cpp
    src/renderer.cpp
    src/scene_manager.cpp
    src/parallax.cpp
)

add_executable(intro ${SOURCES})

cmake_minimum_required(VERSION 3.15)
project(intro_animation)

set(CMAKE_CXX_STANDARD 17)

if(EMSCRIPTEN)
    set(CMAKE_EXECUTABLE_SUFFIX ".js")
    add_compile_options("-sUSE_SDL=2" "-sUSE_SDL_IMAGE=2")
    add_link_options("-sUSE_SDL=2" "-sUSE_SDL_IMAGE=2" "-sSDL2_IMAGE_FORMATS=['png']" "-sWASM=1" "-sALLOW_MEMORY_GROWTH=1" "-sNO_EXIT_RUNTIME=0" "--preload-file" "${CMAKE_SOURCE_DIR}/assets@assets")
else()
    find_package(PkgConfig REQUIRED)
    pkg_check_modules(SDL2 REQUIRED sdl2)
    pkg_check_modules(SDL2_IMAGE REQUIRED SDL2_image)
    include_directories(${SDL2_INCLUDE_DIRS} ${SDL2_IMAGE_INCLUDE_DIRS})
    include_directories("/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include/c++/v1")
    link_directories(${SDL2_LIBRARY_DIRS} ${SDL2_IMAGE_LIBRARY_DIRS})
    add_compile_definitions(EXPORT_VIDEO)
endif()

set(SOURCES
    src/main.cpp
    src/renderer.cpp
    src/scene_manager.cpp
    src/parallax.cpp
)

add_executable(intro ${SOURCES})

if(NOT EMSCRIPTEN)
    target_link_libraries(intro ${SDL2_LIBRARIES} ${SDL2_IMAGE_LIBRARIES})
endif()

var Module = {
    canvas: (function() {
        var canvas = document.getElementById('intro-canvas');
        return canvas;
    })()
};

document.addEventListener("DOMContentLoaded", function() {
    const overlay = document.getElementById('intro-overlay');
    const skipBtn = document.getElementById('skip-intro');

    function finishIntro() {
        if (!overlay) return;
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 1000); // match css transition duration
    }

    skipBtn.addEventListener('click', finishIntro);

    window.onAnimationFinished = function() {
        finishIntro();
    };
});

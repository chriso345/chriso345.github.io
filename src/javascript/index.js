let dark_mode = false;

function run_on_load() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        dark_mode = true;
    }
    update_color_scheme(dark_mode);
}

function toggle_dark_mode(isEnabled) {
    dark_mode = isEnabled;
    update_color_scheme(isEnabled);
}

function update_color_scheme(isEnabled) {
    const cell     = document.getElementById("switch").parentElement.parentElement;
    cell.className = cell.className.substring(0, 23) + isEnabled;
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', _event => {
    dark_mode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    update_color_scheme(dark_mode);
});

// themeSwitch.addEventListener('change', function (e) {
//     if(e.currentTarget.checked === true) {
//         // Add item to localStorage
//         localStorage.setItem('switchedTheme', 'true');
//     } else {
//         // Remove item if theme is switched back to normal
//         localStorage.removeItem('switchedTheme');
//     }
// });

//TODO: make theme persistent across reloads

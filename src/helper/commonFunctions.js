function setCookie(name, value) {
    const date = new Date();
    date.setTime(date.getTime() + 24 * 60 * 60 * 1000); // Set cookie expiration to 24 hours from now
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + value + expires + "; path=/";
}


function getCookies(name) {
    const cookieString = document.cookie;
    const cookies = cookieString.split(';');

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();

        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }

    return null;
}

function removeCookies(name) {
    document.cookie = `${name}=;expires=` + new Date().toUTCString() + ";path=/";
}


export { setCookie, getCookies, removeCookies };
import { v4 as uuidv4 } from 'uuid';

export default function Cookie() {
    const newId = uuidv4();
    let idCookie = getCookie("id");
    if (!idCookie) {
        document.cookie = `${encodeURIComponent("id")}=${encodeURIComponent(newId)}`;
        idCookie = newId;
    }
    if (!sessionStorage.getItem("username")) {
        sessionStorage.setItem("username", idCookie);
    }
    if (sessionStorage.getItem("type") !== "login") {
        sessionStorage.setItem("type", "id");
    }
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

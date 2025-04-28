import Window from "./window.js";
import Html from "./html.js";

document.querySelector("#about").addEventListener("dblclick", () => {
    const window = new Window(document.body, "About");
    window.query(".window-body").innerHTML = `
    Hello!<br />
    It seems you have stumbled upon my API for frutiger aero spacehey profiles. <br />
    (yes i know very specific shut up) <br /> <br />

    This API returns the last song you have listened to on last.fm<br/>
    in a stylized windows media player 12 image. <br /> <br />

    To try it out, insert your last.fm username here: <br />

    <input type="text" id="username"></input>
    <button id="submit">submit</button>
    `

    const submit = document.getElementById("submit");
    submit.addEventListener("click", () => {
        const wmp = new Window(document.body, "NO FUCKING TITLE THERE IS NO FUCKING TITLE FUCK YOU NO FUCKING TITLE HERE DO NOT CHANGE THE FUCKING TITLE BUDDY");
        const icon = document.createElement("img");
        icon.src = "icon.png"
        icon.classList.add("title-bar-icon");
        wmp.query(".title-bar").appendChild(icon)
        wmp.query(".title-bar").insertBefore(icon, wmp.query(".title-bar").querySelector(".title-bar-controls"))
        wmp.query(".title-bar").querySelector(".title-bar-text").remove()

        wmp.query(".window-body").classList.remove("has-space")
        wmp.query(".window-body").innerHTML = `
        <img src="${document.location.origin}/${document.getElementById("username").value}" width="238" height="238" />
        `
        wmp.query(".window-body").style = `
            max-height: 238px; max-width: 238px;
        `
    });
})
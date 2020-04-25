import "./styles/installer.scss";
import Icon from "../assets/icon.png";

function main() {
  let ellipsis = "...";
  const kindElem = document.getElementById("kind-span");
  const iconElem = document.getElementById("icon");
  const kind = window.location.hash.slice(1);

  iconElem.src = Icon;
  kindElem.innerHTML = `<em>${kind}${ellipsis}</em>`;

  setInterval(() => {
    ellipsis += ".";
    if (ellipsis.length > 10) {
      ellipsis = "...";
    }
    kindElem.innerHTML = `<em>${kind}${ellipsis}</em>`;
  }, 1000);
}
main();

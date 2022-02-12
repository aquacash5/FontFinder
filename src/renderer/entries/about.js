import BannerImage from "../../assets/banner.png";
import "../styles/renderer.scss";

document.body.innerHTML = `
<div class="about-window background text-white">
  <image src="${BannerImage}" alt="Font Finder Banner" class="img-fluid" />
  <p class="text-center">
    <a href="https://aquacash5.github.io/FontFinder/" class="link-white">FontFinder</a>
    ${__VERSION__}${__BETA__ ? "-pre" : ""}<br/>
    © 2020-2021 Kyle Bloom All Rights Reserved
  </p>
</div>
`;

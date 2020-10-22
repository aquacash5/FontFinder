import { LitElement, html } from "lit-element";
import { v5 } from "uuid";

// Define a custom namespace.  Readers, create your own using something like
// https://www.uuidgenerator.net/
const MY_NAMESPACE = "15a34f5d-236c-400a-bad1-1bfbd5306949";

const FONT_FORMATS = {
  ttf: "truetype",
  otf: "opentype",
  woff: "woff",
  woff2: "woff2",
};

class FontSpan extends LitElement {
  static get properties() {
    return { fontPath: { type: String } };
  }

  constructor() {
    super();
    this.fontId = v5(fontPath, MY_NAMESPACE).replace("-", "");
    this.fontPath = "";
  }

  static extractFormat(path) {
    return FONT_FORMATS[/\.(.*)$/.exec(path)[1]];
  }

  render() {
    return html`
      <style>
        @font-face {
          font-family: '${this.fontId}'
            url('${this.fontPath}') format('${extractFormat(this.fontPath)})
        }

        span#${this.fontId} {
          font-family: '${this.fontId}';
        }
      </style>
      <span id="${this.fontId}">
        <slot></slot>
      </span>
    `;
  }
}

customElements.define("font-span", FontSpan);

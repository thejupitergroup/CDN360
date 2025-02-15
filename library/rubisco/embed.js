(function (global) {
    class Embed {
        constructor() {
            this.frames = [];
        }
        
        create(options) {
            const defaults = {
                size: { width: "600px", height: "400px" },
                source: "https://thejupitergroup.wixstudio.com/iframe",
                uuid: this.generateUUID(),
                parent: document.body,
                styles: {},
                allow: "",
                sandbox: "",
                title: "Embedded Frame",
                className: "",
                preventRedirects: false,
                onLoad: null,
                onPreventedRedirect: null,
                alignment: "left"
            };
            const config = { ...defaults, ...options };

            const iframeContainer = document.createElement("div");
            iframeContainer.style.display = "flex";
            iframeContainer.style.justifyContent = this.getAlignment(config.alignment);
            iframeContainer.style.margin = "10px 0";

            const iframe = document.createElement("iframe");
            iframe.src = config.source;
            iframe.width = config.size.width.replace("px", "");
            iframe.height = config.size.height.replace("px", "");
            iframe.id = config.uuid;
            iframe.title = config.title;
            iframe.style.border = "0";

            Object.entries(config.styles).forEach(([key, value]) => {
                iframe.style[key] = value;
            });

            if (config.className) {
                iframe.className = config.className;
            }

            if (config.allow) iframe.setAttribute("allow", config.allow);
            if (config.sandbox) iframe.setAttribute("sandbox", config.sandbox);

            iframeContainer.appendChild(iframe);

            if (config.parent instanceof HTMLElement) {
                config.parent.appendChild(iframeContainer);
            } else {
                console.warn("Invalid parent element. Using document.body instead.");
                document.body.appendChild(iframeContainer);
            }

            if (typeof config.onLoad === "function") {
                iframe.onload = () => config.onLoad(iframe);
            }

            if (config.preventRedirects) {
                this.preventIframeRedirects(iframe, config.onPreventedRedirect);
            }

            this.frames.push({ uuid: config.uuid, iframe, config, container: iframeContainer });

            return iframe;
        }

        update(uuid, options) {
            const frame = this.get(uuid);
            if (!frame) {
                console.warn(`No frame found with UUID: ${uuid}`);
                return false;
            }

            const iframe = frame.iframe;

            if (options.source) iframe.src = options.source;

            if (options.size) {
                iframe.width = options.size.width.replace("px", "");
                iframe.height = options.size.height.replace("px", "");
            }

            if (options.styles) {
                Object.entries(options.styles).forEach(([key, value]) => {
                    iframe.style[key] = value;
                });
            }

            if (options.alignment) {
                const container = frame.container;
                container.style.justifyContent = this.getAlignment(options.alignment);
            }

            if (options.allow) iframe.setAttribute("allow", options.allow);
            if (options.sandbox) iframe.setAttribute("sandbox", options.sandbox);

            frame.config = { ...frame.config, ...options };

            return true;
        }

        remove(uuid) {
            const frameIndex = this.frames.findIndex((frame) => frame.uuid === uuid);
            if (frameIndex !== -1) {
                const frame = this.frames[frameIndex];
                frame.container.remove();
                this.frames.splice(frameIndex, 1);
                return true;
            } else {
                console.warn(`No frame found with UUID: ${uuid}`);
                return false;
            }
        }

        get(uuid) {
            return this.frames.find((frame) => frame.uuid === uuid) || null;
        }

        list() {
            return this.frames;
        }

        resize(uuid, size) {
            const frame = this.get(uuid);
            if (!frame) {
                console.warn(`No frame found with UUID: ${uuid}`);
                return false;
            }

            const iframe = frame.iframe;
            iframe.width = size.width.replace("px", "");
            iframe.height = size.height.replace("px", "");

            frame.config.size = size;

            return true;
        }

        getAlignment(alignment) {
            switch (alignment.toLowerCase()) {
                case "center":
                    return "center";
                case "right":
                    return "flex-end";
                case "left":
                default:
                    return "flex-start";
            }
        }

        preventIframeRedirects(iframe, onPreventedRedirect) {
            iframe.addEventListener("load", () => {
                const iframeWindow = iframe.contentWindow;

                iframeWindow.open = function () {
                    console.warn("Redirects are disabled inside the iframe.");
                    if (typeof onPreventedRedirect === "function") {
                        onPreventedRedirect("Blocked an attempt to open a new window.");
                    }
                    return null;
                };

                const originalLocation = iframeWindow.location.href;
                const observer = setInterval(() => {
                    if (iframeWindow.location.href !== originalLocation) {
                        console.warn("Redirect attempt detected and prevented.");
                        iframeWindow.location.href = originalLocation;
                        if (typeof onPreventedRedirect === "function") {
                            onPreventedRedirect("Blocked an attempt to navigate away.");
                        }
                    }
                }, 100);
            });
        }

        generateUUID() {
            return "xxxxxxxx-xxxx-6xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
                const r = (Math.random() * 16) | 0;
                const v = c === "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
        }
    }

    global.embed = new Embed();
})(window);
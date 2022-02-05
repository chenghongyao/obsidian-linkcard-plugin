import {Plugin, request} from "obsidian";

import { MarkdownRenderChild } from "obsidian";

export class LinkBlock extends MarkdownRenderChild {


	href: string;
	title: string;
	icon: string;
	host: string;
	defaultIcon: string = "/favicon.ico";


	constructor(containerEl: HTMLElement,href: string, title: string,host: string) {
		super(containerEl);
		this.href = href;
		this.title = title;
		this.host = host;
	}
	
	onload() {

		const blockEl =  this.containerEl.createEl("a",{
			cls: "link-card-container",
			href: this.href
		});


		const contentEl = blockEl.createDiv({
			cls: "link-card-title-container"
		});

		
		const iconEl = blockEl.createDiv({
			cls: "link-card-icon-container",
		});

		const imgEl = blockEl.createEl("img",{
			cls: "link-card-icon-img",
			attr: {
				"src":this.host + this.defaultIcon
			}
		});
		iconEl.appendChild(imgEl);
		contentEl.appendChild(iconEl);
		
		const titleEl = blockEl.createDiv({
			cls: "link-card-title",
		});


		const linkEl = blockEl.createDiv({
			cls: "link-card-href",
			text: this.href
		});


		if (this.icon) {
			imgEl.setAttr("src",this.icon);
		}

		if (this.title) {
			titleEl.setText(this.title);
		}

		if (!this.icon || !this.title) {
			request({url:this.href}).then((html: string) => {
				const doc = new DOMParser().parseFromString(html,"text/html");
				if (!this.icon) {
					let link = doc.querySelector("link[rel='shortcut icon']")?.getAttr("href");
					if (!link) link = doc.querySelector("link[rel='icon']")?.getAttr("href");
					if (link) {
						if (link.startsWith("/")) {
							this.icon = this.host + link;
						} else if (link.startsWith("./")) {
							this.icon = this.href + link.substring(this.href.endsWith("/") ? 2 : 1);
						} else {
							this.icon = link;
						}

						imgEl.setAttr("src",this.icon);
					}
				}

				if (!this.title) {
					const title = doc.querySelector("title")?.textContent;
					if (title) {
						this.title = title;
					} else {
						this.title = this.href;
					}
					titleEl.setText(this.title);
				}
			});
		}


		




		contentEl.appendChild(titleEl);
		blockEl.appendChild(contentEl);
		blockEl.appendChild(linkEl);

		
		this.containerEl.replaceWith(blockEl);
	}
}


export default class URLBlockPlugin extends Plugin {

	async getIconPath(root: string) {

	}
	async onload() {
		const r = /(^https?:\/\/[^/]+(?::\d+)?)/;
		this.registerMarkdownPostProcessor((element, context) => {

			if (element.childElementCount !== 1 && element.children[0].tagName !== "P") return;
			const p = element.children[0] as HTMLElement;
			if (p.children.length !== 1 || p.children[0].tagName !== "A") return;

			const ael = p.children[0] as HTMLAnchorElement;
			if (ael.className === "external-link" && p.textContent === ael.textContent ) {
				const g = r.exec(ael.href)
				if (!g) return;
				const title = ael.textContent;
				context.addChild(new LinkBlock(p, ael.href,title,g[1]));
			}
		});
	}

	onunload() {
	}
}

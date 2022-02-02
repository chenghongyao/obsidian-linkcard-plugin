import {Plugin} from "obsidian";

import { MarkdownRenderChild } from "obsidian";

export class LinkBlock extends MarkdownRenderChild {


	href: string;
	title: string;
	icon: string;

	constructor(containerEl: HTMLElement,href: string, title: string, icon: string) {
		super(containerEl);

		this.href = href;
		this.title = title;
		this.icon = icon;
	}
	onload() {

		const blockEl =  this.containerEl.createEl("a",{
			cls: "link-card-container",
			href: this.href
		});


		const contentEl = blockEl.createDiv({
			cls: "link-card-title-container"
		});

		if (this.icon) {
			const iconEl = blockEl.createDiv({
				cls: "link-card-icon-container",
			});
	
	
			const imgEl = blockEl.createEl("img",{
				cls: "link-card-icon-img",
				attr: {
					src:this.icon
				}
			});
			iconEl.appendChild(imgEl);
			contentEl.appendChild(iconEl);
		}


	

		const titleEl = blockEl.createDiv({
			cls: "link-card-title",
			text: this.title
		});


		const linkEl = blockEl.createDiv({
			cls: "link-card-href",
			text: this.href
		});

		contentEl.appendChild(titleEl);
		blockEl.appendChild(contentEl);
		blockEl.appendChild(linkEl);

		
		this.containerEl.replaceWith(blockEl);
	}
}


export default class URLBlockPlugin extends Plugin {

	async onload() {
		const r = /(^https?:\/\/[^/]+(?::\d+)?)/;
		this.registerMarkdownPostProcessor((element, context) => {
			const ps = element.querySelectorAll("p");
			for (let index = 0; index < ps.length; index++) {
				const p = ps.item(index);
				if (p.parentElement.tagName !== "DIV" || p.children.length !== 1)continue;
				const ael = p.children[0] as HTMLAnchorElement;
				if (ael.tagName == "A" && ael.className === "external-link" && p.textContent === ael.textContent ) {
					const g = r.exec(ael.href)
					if (!g) continue;
					let icon = "";
					if (g) {
						icon = g[1] + "/favicon.ico";
					}
					const title = ael.textContent;
					context.addChild(new LinkBlock(p, ael.href,title,icon));
				}
			}
		});
	}

	onunload() {
	}
}

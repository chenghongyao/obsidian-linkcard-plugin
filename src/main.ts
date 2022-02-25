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
			blockEl.setAttr("title",this.title);
		}

		if (!this.icon || !this.title) {
			request({url:this.href}).then((html: string) => {
				const doc = new DOMParser().parseFromString(html,"text/html");
				// console.log(doc);

				if (!this.icon) {
					let link = doc.querySelector("link[rel='icon'][type='image/x-icon']")?.getAttr("href");
					if (!link) link = doc.querySelector("link[rel='shortcut icon'][type='image/x-icon']")?.getAttr("href");
					if (!link) link = doc.querySelector("link[rel='icon']")?.getAttr("href");
					if (!link) link = doc.querySelector("link[rel='shortcut icon']")?.getAttr("href");
					if (link) {
						if (link.startsWith("http://") || link.startsWith("https://")) { // absoulte address
							this.icon = link;
						} else {
							if (link.startsWith("/")) {
								this.icon = this.host + link;
							} else if (link.startsWith("./")) {
								this.icon = this.href + link.substring(this.href.endsWith("/") ? 2 : 1);
							} else {
								if (this.href.endsWith("/#/")) {
									this.icon = this.href.substring(0,this.href.length-2) + link;
								} else {
									this.icon = this.href + (this.href.endsWith("/") ? "/" : "") + link;
								}
							}
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
					blockEl.setAttr("title",this.title);
				}
			});
		}


		


		contentEl.appendChild(iconEl);
		contentEl.appendChild(titleEl);
		blockEl.appendChild(contentEl);
		blockEl.appendChild(linkEl);

		
		this.containerEl.replaceWith(blockEl);
	}
}

export class NeteaseBlock extends MarkdownRenderChild {
	id: string;
	height: number;
	constructor(containerEl: HTMLElement,id: string,height:number = 86) {
		super(containerEl);
		this.id = id;
		this.height = height;
	}

	onload() {
		const wrapperEl = this.containerEl.createDiv("link-card-frame-wrapper netease");
		wrapperEl.innerHTML = `<iframe src="https://music.163.com/outchain/player?type=2&id=${this.id}&auto=0&height=66" frameborder="no" allowfullscreen class height="${this.height}" style="width: 100%; pointer-events: auto;" sandbox="allow-forms allow-presentation allow-same-origin allow-scripts allow-modals"></iframe>`;
		this.containerEl.replaceWith(wrapperEl);
	}
}


export class BilibiliBlock extends MarkdownRenderChild {
	id: string;
	constructor(containerEl: HTMLElement,id: string) {
		super(containerEl);
		this.id = id;
	}


	onload() {
		const wrapperEl = this.containerEl.createDiv("link-card-frame-wrapper bilibili");
		wrapperEl.innerHTML = `<iframe src="https://player.bilibili.com/player.html?bvid=${this.id}&page=1&high_quality=1&as_wide=1&allowfullscreen=true" frameborder="no" allowfullscreen sandbox="allow-top-navigation-by-user-activation allow-same-origin allow-forms allow-scripts allow-popups" class="" style="width: 100%; height:100%" ></iframe>`;
		this.containerEl.replaceWith(wrapperEl);
	}
}

export default class URLBlockPlugin extends Plugin {

	async getIconPath(root: string) {

	}
	async onload() {
		const r = /(^https?:\/\/[^/]+(?::\d+)?)/;
		this.registerMarkdownPostProcessor((element, context) => {

			if (element.tagName !== "DIV" || element.childElementCount !== 1 || element.children[0].tagName !== "P") return;
			const p = element.children[0] as HTMLElement;
			if (p.children.length !== 1 || p.children[0].tagName !== "A") return;

			const ael = p.children[0] as HTMLAnchorElement;
			if (ael.className === "external-link" && p.textContent === ael.textContent ) {
				const g = r.exec(ael.href)
				if (!g) return;
				
				const netg = /^https:\/\/music.163.com\/#\/song\?id=(\d*)/.exec(ael.href);
				if (netg) {
					const id = netg[1]
					context.addChild(new NeteaseBlock(p, id));
					return;
				} 
				const blig = /^https:\/\/www.bilibili.com\/video\/([A-Za-z0-9]*)/.exec(ael.href);
				if (blig) {
					const id = blig[1];
					context.addChild(new BilibiliBlock(p, id));
					return;
				}


				const title = ael.textContent;
				context.addChild(new LinkBlock(p, ael.href,title,g[1]));
			}
		});
	}

	onunload() {
	}
}

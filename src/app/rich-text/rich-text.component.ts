import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { AngularHttpService } from '@kontent-ai/core-sdk-angular-http-service';
import { IDeliveryClient, Elements, ElementType, createDeliveryClient } from '@kontent-ai/delivery-sdk';
import { IDomHtmlNode, IDomNode, IOutputResult, IRichTextParser, isImage, isItemLink, isLinkedItem, RichTextBrowserParser } from 'kontent-rich-text-to-json-converter';

@Component({
  selector: 'app-rich-text',
  templateUrl: './rich-text.component.html',
  styleUrls: ['./rich-text.component.sass']
})
export class RichTextComponent implements OnInit {
  @Input('item') itemCodename = '';
  @Input('element') elementCodename = '';
  @Input('projectId') projectId = '975bf280-fd91-488c-994c-2f04416e5ee3';

  deliveryClient: IDeliveryClient;

  parser: RichTextBrowserParser;

  resolvedHtml: String = "<p><br/><p>";
  parsedResult: IOutputResult | null = null;
  richTextData: Elements.RichTextElement = {
    name: "dummy",
    type: ElementType.RichText,
    value: "<p><br/></p>",
    images: [],
    links: [],
    linkedItemCodenames: [],
    linkedItems: []
  }
  resolveImage: any;

  constructor(httpClient: HttpClient) {
    this.deliveryClient = createDeliveryClient({
      projectId: this.projectId,
      httpService: new AngularHttpService(httpClient),
    });

    this.parser = new RichTextBrowserParser();
  }

  resolveLinkedItem = (node: IDomHtmlNode): string => {
    const itemCodeName = node.attributes['data-codename'];

    const item = this.richTextData.linkedItems.find(item => item.system.codename === itemCodeName);
    return `<div class="red">TODO LINKED ITEM ${itemCodeName}</div>`;

  }

  resolveItemLink = (node: IDomHtmlNode): string => {
    const linkId = node.attributes['data-item-id'];;
    return `<div class="red">TODO LINKED ITEM LINK ${linkId}</div>`;
  }

  resolveHtmlElement = (node: IDomHtmlNode): string => {
    const attributes = Object.entries(node.attributes).map(([key, value]) => `${key}="${value}"`).join(" ");
    const openingTag = `<${node.tagName} ${attributes}>`;
    const closingTag = `</${node.tagName}>`;
    return `${openingTag}${node.children.map(this.link).join("")}${closingTag}`;
  }

  link = (node: IDomNode): string => {
    switch (node.type) {
      case 'text': {
        return node.content;
      }
      case 'tag': {


        if (isLinkedItem(node)) {
          return this.resolveLinkedItem(node);
        } else if (isImage(node)) {
          return this.resolveImage(node);
        } else if (isItemLink(node)) {
          return this.resolveItemLink(node);
        } else {
          return this.resolveHtmlElement(node);
        }
      }
    }
  }


  ngOnInit(): void {
    this.deliveryClient.item(this.itemCodename)
      .toPromise()
      .then(response => response.data.item)
      .then(item => item.elements[this.elementCodename] as Elements.RichTextElement)
      .then(richTextElement => {
        this.richTextData = richTextElement;
        this.parsedResult = this.parser.parse(richTextElement.value);

        this.resolvedHtml = this.parsedResult.childNodes.map(this.link).join("");
      });
  }

}



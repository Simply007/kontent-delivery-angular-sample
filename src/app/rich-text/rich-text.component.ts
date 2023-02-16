import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { AngularHttpService } from '@kontent-ai/core-sdk-angular-http-service';
import { IDeliveryClient, Elements, ElementType, createDeliveryClient, ElementModels } from '@kontent-ai/delivery-sdk';
import { IDomHtmlNode, IDomNode, IOutputResult, IRichTextParser, isImage, isItemLink, isLinkedItem, RichTextBrowserParser } from 'kontent-rich-text-to-json-converter';

@Component({
  selector: 'app-rich-text',
  templateUrl: './rich-text.component.html',
  styleUrls: ['./rich-text.component.sass']
})
export class RichTextComponent implements OnInit {
  @Input('item') itemCodename = '';
  @Input('element') elementCodename = '';
  @Input() projectId = '975bf280-fd91-488c-994c-2f04416e5ee3';

  deliveryClient: IDeliveryClient | null = null;
  httpService: AngularHttpService;

  parser: RichTextBrowserParser;

  resolvedHtml: string = "<p><br/><p>";
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

  constructor(httpClient: HttpClient) {

    this.httpService = new AngularHttpService(httpClient);

    this.parser = new RichTextBrowserParser();
  }

  resolveLinkedItem = (node: IDomHtmlNode): string => {
    const itemCodeName = node.attributes['data-codename'];

    const item = this.richTextData.linkedItems.find(item => item.system.codename === itemCodeName);

    switch (item?.system.type) {
      case 'tweet': {
        let tweetLink = item?.elements.tweet_link.value;
        let tweetID = tweetLink.match('^.*twitter.com/.*/(\\d+)/?.*$')[1];

        let selectedTheme = item?.elements.theme.value[0].codename;
        selectedTheme = selectedTheme ? selectedTheme : 'light';

        setTimeout(() => {
          (window as any).twttr.widgets.createTweet(
            tweetID,
            document.getElementById(`tweet${tweetID}`),
            {
              theme: selectedTheme,
            }
          );
        }, 100);

        return `<div id="tweet${tweetID}"></div>`;

      }
      case 'hosted_video': {
        if (
          item?.elements.video_host.value.find(
            (item: ElementModels.MultipleChoiceOption) =>
              item.codename === 'vimeo'
          )
        ) {
          return (
            `<iframe
              className="hosted-video__wrapper"
              src="https://player.vimeo.com/video/${item.elements.video_id.value}?title=0&byline=0&portrait=0"
              width="640"
              height="360"
              frameBorder="0"
              allowFullScreen
              title="Vimeo video ${item.elements.video_id.value}"
            ></iframe>`
          );
        } else if (
          item?.elements.video_host.value.find(
            (item: ElementModels.MultipleChoiceOption) =>
              item.codename === 'youtube'
          )
        ) {
          return (
            `<iframe
              className="hosted-video__wrapper"
              width="560"
              height="315"
              src="https://www.youtube.com/embed/${item.elements.video_id.value}"
              frameBorder="0"
              allowFullScreen
              title="Youtube video ${item.elements.video_id.value}"
            ></iframe>`);
        } else {
          return `<div>Content item not supported</div>`;
        }
      }
      default: {
        return `<div class="red">TODO LINKED ITEM ${itemCodeName} ${item?.system.type}</div>`;
      }
    }

  }

  resolveImage(node: IDomHtmlNode): string {
    const imageId = node.attributes["data-asset-id"];

    const image = this.richTextData.images.find(image => image.imageId === imageId);
    return `<img src=${image?.url} width="300" alt="${image?.description}"/>`;
  }

  resolveItemLink = (node: IDomHtmlNode): string => {
    const linkId = node.attributes['data-item-id'];
    const link = this.richTextData.links.find(item => item.linkId === linkId);

    return `<a href="/${link?.type}/${link?.codename}">${node.children.map(this.link).join("")}</a>`;
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
    this.deliveryClient = createDeliveryClient({
      projectId: this.projectId,
      httpService: this.httpService,
    });
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



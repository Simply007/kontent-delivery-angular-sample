import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { AngularHttpService } from '@kentico/kontent-angular-http-service';
import { createDeliveryClient, IDeliveryClient } from '@kentico/kontent-delivery';
import { IDomNode, IOutputResult, IRichTextParser, RichTextBrowserParser } from 'kontent-rich-text-to-json-converter';

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

  constructor(httpClient: HttpClient) {
    this.deliveryClient = createDeliveryClient({
      projectId: this.projectId,
      httpService: new AngularHttpService(httpClient),
    });

    this.parser = new RichTextBrowserParser();
  }

  ngOnInit(): void {
    this.deliveryClient.item(this.itemCodename)
      .toPromise()
      .then(response => response.data.item)
      .then(item => item.elements[this.elementCodename])
      .then(richTextElement => {
        this.parsedResult = this.parser.parse(richTextElement.value);

        const link = (node: IDomNode): string => {
          switch (node.type) {
            case 'text':
              return node.content;

            case 'tag':
              console.log()
              const resolvedChildren = `<${node.tagName} ${Object.entries(node.attributes).map(([key, value]) => `${key}="${value}"`)}>
                ${node.children.map(link).join("")}
              </${node.tagName}>`;
              return resolvedChildren;
          }
        }

        this.resolvedHtml = this.parsedResult.childNodes.map(link).join("");

      })
  }

}

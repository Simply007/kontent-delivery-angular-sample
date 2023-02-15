import { ChangeDetectorRef, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { observableHelper } from './helpers/observable.helper';
import { map } from 'rxjs/operators';
import { AngularHttpService } from '@kontent-ai/core-sdk-angular-http-service';
import { IDeliveryClient, Responses, IGroupedNetworkResponse, createDeliveryClient, IDeliveryNetworkResponse } from '@kontent-ai/delivery-sdk';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent {
  title = 'kontent-angular-sample';

  deliveryClient: IDeliveryClient;

  itemsResponse?: IDeliveryNetworkResponse<Responses.IListContentItemsResponse, any>;
  itemResponse?: IDeliveryNetworkResponse<Responses.IViewContentItemResponse, any>;
  taxonomiesResponse?: IDeliveryNetworkResponse<Responses.IListTaxonomiesResponse, any>;
  taxonomyResponse?: IDeliveryNetworkResponse<Responses.IViewTaxonomyResponse, any>;
  typesResponse?: IDeliveryNetworkResponse<Responses.IListContentTypesResponse, any>;
  typeResponse?: IDeliveryNetworkResponse<Responses.IViewContentTypeResponse, any>;
  languagesResponse?: IDeliveryNetworkResponse<Responses.IListLanguagesResponse, any>;
  elementResponse?: IDeliveryNetworkResponse<
    Responses.IViewContentTypeElementResponse,
    any
  >;
  itemsFeedResponse?: IGroupedNetworkResponse<Responses.IListItemsFeedAllResponse>;

  constructor(httpClient: HttpClient, private cdr: ChangeDetectorRef) {
    this.deliveryClient = createDeliveryClient({
      projectId: 'da5abe9f-fdad-4168-97cd-b3464be2ccb9',
      httpService: new AngularHttpService(httpClient),
    });
  }

  ngOnInit(): void {
    this.initData();
  }

  private initData(): void {
    this.zipAndExecute([
      // items
      from(this.deliveryClient.items().depthParameter(2).toPromise()).pipe(
        map((response) => {
          this.itemsResponse = response;
          this.cdr.markForCheck();
        })
      ),
      // item
      from(
        this.deliveryClient.item('warrior').depthParameter(2).toPromise()
      ).pipe(
        map((response) => {
          this.itemResponse = response;
          this.cdr.markForCheck();
        })
      ),
      // taxonomies
      from(this.deliveryClient.taxonomies().toPromise()).pipe(
        map((response) => {
          this.taxonomiesResponse = response;
          this.cdr.markForCheck();
        })
      ),
      // taxonomy
      from(this.deliveryClient.taxonomy('movietype').toPromise()).pipe(
        map((response) => {
          this.taxonomyResponse = response;
          this.cdr.markForCheck();
        })
      ),
      // types
      from(this.deliveryClient.types().toPromise()).pipe(
        map((response) => {
          this.typesResponse = response;
          this.cdr.markForCheck();
        })
      ),
      // type
      from(this.deliveryClient.type('movie').toPromise()).pipe(
        map((response) => {
          this.typeResponse = response;
          this.cdr.markForCheck();
        })
      ),
      // languages
      from(this.deliveryClient.languages().toPromise()).pipe(
        map((response) => {
          this.languagesResponse = response;
          this.cdr.markForCheck();
        })
      ),
      // element
      from(this.deliveryClient.element('movie', 'title').toPromise()).pipe(
        map((response) => {
          this.elementResponse = response;
          this.cdr.markForCheck();
        })
      ),
      // items feed
      from(this.deliveryClient.itemsFeed().toAllPromise()).pipe(
        map((response) => {
          this.itemsFeedResponse = response;
          this.cdr.markForCheck();
        })
      ),
    ]);
  }

  private zipAndExecute(observables: Observable<void>[]): void {
    observableHelper
      .zipObservables(observables)
      .pipe(
        map(() => {
          this.cdr.markForCheck();
        })
      )
      .subscribe();
  }
}

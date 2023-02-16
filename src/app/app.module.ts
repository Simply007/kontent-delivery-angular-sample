import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

import { AppComponent } from './app.component';
import { RichTextComponent } from './rich-text/rich-text.component';
import { SafePipe } from './rich-text/safe.pipe';

@NgModule({
  declarations: [AppComponent, RichTextComponent, SafePipe],
  imports: [BrowserModule, HttpClientModule, NgxJsonViewerModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

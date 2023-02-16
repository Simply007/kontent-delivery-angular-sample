import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl } from '@angular/platform-browser';

/**
 * Usage:
 * <div [innerHTML]="product.description | safe: 'html'"></div>
 * <div [style.background-image]="'url(' + product.imageUrl + ')' | safe: 'style'"></div>
 */

@Pipe({ name: 'safe', pure: true })
export class SafePipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }

    public transform(value: string | null | undefined, type: string): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl | undefined {
        if (!value) {
            return undefined;
        }
        switch (type) {
            case 'html':
                return this.sanitizer.bypassSecurityTrustHtml(value);
            case 'style':
                return this.sanitizer.bypassSecurityTrustStyle(value);
            case 'script':
                return this.sanitizer.bypassSecurityTrustScript(value);
            case 'url':
                return this.sanitizer.bypassSecurityTrustUrl(value);
            case 'resourceUrl':
                return this.sanitizer.bypassSecurityTrustResourceUrl(value);
            default:
                throw new Error(`Unable to bypass security for invalid type: ${type}`);
        }
    }
}

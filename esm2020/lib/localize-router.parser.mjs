import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, Observable } from 'rxjs';
import { Location } from '@angular/common';
import { CacheMechanism, LocalizeRouterSettings } from './localize-router.config';
import { Inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import * as i0 from "@angular/core";
import * as i1 from "@ngx-translate/core";
import * as i2 from "@angular/common";
import * as i3 from "./localize-router.config";
const COOKIE_EXPIRY = 30; // 1 month
/**
 * Abstract class for parsing localization
 */
export class LocalizeParser {
    /**
     * Loader constructor
     */
    constructor(translate, location, settings) {
        this.translate = translate;
        this.location = location;
        this.settings = settings;
    }
    /**
   * Prepare routes to be fully usable by ngx-translate-router
   * @param routes
   */
    /* private initRoutes(routes: Routes, prefix = '') {
      routes.forEach(route => {
        if (route.path !== '**') {
          const routeData: any = route.data = route.data || {};
          routeData.localizeRouter = {};
          routeData.localizeRouter.fullPath = `${prefix}/${route.path}`;
          if (route.children && route.children.length > 0) {
            this.initRoutes(route.children, routeData.localizeRouter.fullPath);
          }
        }
      });
    } */
    /**
     * Initialize language and routes
     */
    init(routes) {
        let selectedLanguage;
        // this.initRoutes(routes);
        this.routes = routes;
        if (!this.locales || !this.locales.length) {
            return Promise.resolve();
        }
        /** detect current language */
        const locationLang = this.getLocationLang();
        const browserLang = this._getBrowserLang();
        if (this.settings.defaultLangFunction) {
            this.defaultLang = this.settings.defaultLangFunction(this.locales, this._cachedLang, browserLang);
        }
        else {
            this.defaultLang = this._cachedLang || browserLang || this.locales[0];
        }
        selectedLanguage = locationLang || this.defaultLang;
        this.translate.setDefaultLang(this.defaultLang);
        let children = [];
        /** if set prefix is enforced */
        if (this.settings.alwaysSetPrefix) {
            const baseRoute = { path: '', redirectTo: this.defaultLang, pathMatch: 'full' };
            /** extract potential wildcard route */
            const wildcardIndex = routes.findIndex((route) => route.path === '**');
            if (wildcardIndex !== -1) {
                this._wildcardRoute = routes.splice(wildcardIndex, 1)[0];
            }
            children = this.routes.splice(0, this.routes.length, baseRoute);
        }
        else {
            children = [...this.routes]; // shallow copy of routes
        }
        /** exclude certain routes */
        for (let i = children.length - 1; i >= 0; i--) {
            if (children[i].data && children[i].data['skipRouteLocalization']) {
                if (this.settings.alwaysSetPrefix) {
                    // add directly to routes
                    this.routes.push(children[i]);
                }
                // remove from routes to translate only if doesn't have to translate `redirectTo` property
                if (children[i].redirectTo === undefined || !(children[i].data['skipRouteLocalization']['localizeRedirectTo'])) {
                    children.splice(i, 1);
                }
            }
        }
        /** append children routes */
        if (children && children.length) {
            if (this.locales.length > 1 || this.settings.alwaysSetPrefix) {
                this._languageRoute = { children: children };
                this.routes.unshift(this._languageRoute);
            }
        }
        /** ...and potential wildcard route */
        if (this._wildcardRoute && this.settings.alwaysSetPrefix) {
            this.routes.push(this._wildcardRoute);
        }
        /** translate routes */
        return firstValueFrom(this.translateRoutes(selectedLanguage));
    }
    initChildRoutes(routes) {
        this._translateRouteTree(routes);
        return routes;
    }
    /**
     * Translate routes to selected language
     */
    translateRoutes(language) {
        return new Observable((observer) => {
            this._cachedLang = language;
            if (this._languageRoute) {
                this._languageRoute.path = language;
            }
            this.translate.use(language).subscribe((translations) => {
                this._translationObject = translations;
                this.currentLang = language;
                if (this._languageRoute) {
                    if (this._languageRoute) {
                        this._translateRouteTree(this._languageRoute.children);
                    }
                    // if there is wildcard route
                    if (this._wildcardRoute && this._wildcardRoute.redirectTo) {
                        this._translateProperty(this._wildcardRoute, 'redirectTo', true);
                    }
                }
                else {
                    this._translateRouteTree(this.routes);
                }
                observer.next(void 0);
                observer.complete();
            });
        });
    }
    /**
     * Translate the route node and recursively call for all it's children
     */
    _translateRouteTree(routes) {
        routes.forEach((route) => {
            const skipRouteLocalization = (route.data && route.data['skipRouteLocalization']);
            const localizeRedirection = !skipRouteLocalization || skipRouteLocalization['localizeRedirectTo'];
            if (route.redirectTo && localizeRedirection) {
                this._translateProperty(route, 'redirectTo', !route.redirectTo.indexOf('/'));
            }
            if (skipRouteLocalization) {
                return;
            }
            if (route.path !== null && route.path !== undefined /* && route.path !== '**'*/) {
                this._translateProperty(route, 'path');
            }
            if (route.children) {
                this._translateRouteTree(route.children);
            }
            if (route.loadChildren && route._loadedRoutes?.length) {
                this._translateRouteTree(route._loadedRoutes);
            }
        });
    }
    /**
     * Translate property
     * If first time translation then add original to route data object
     */
    _translateProperty(route, property, prefixLang) {
        // set property to data if not there yet
        const routeData = route.data = route.data || {};
        if (!routeData.localizeRouter) {
            routeData.localizeRouter = {};
        }
        if (!routeData.localizeRouter[property]) {
            routeData.localizeRouter = { ...routeData.localizeRouter, [property]: route[property] };
        }
        const result = this.translateRoute(routeData.localizeRouter[property]);
        route[property] = prefixLang ? this.addPrefixToUrl(result) : result;
    }
    get urlPrefix() {
        if (this.settings.alwaysSetPrefix || this.currentLang !== this.defaultLang) {
            return this.currentLang ? this.currentLang : this.defaultLang;
        }
        else {
            return '';
        }
    }
    /**
     * Add current lang as prefix to given url.
     */
    addPrefixToUrl(url) {
        const plitedUrl = url.split('?');
        plitedUrl[0] = plitedUrl[0].replace(/\/$/, '');
        return `/${this.urlPrefix}${plitedUrl.join('?')}`;
    }
    /**
     * Translate route and return observable
     */
    translateRoute(path) {
        const queryParts = path.split('?');
        if (queryParts.length > 2) {
            throw Error('There should be only one query parameter block in the URL');
        }
        const pathSegments = queryParts[0].split('/');
        /** collect observables  */
        return pathSegments
            .map((part) => part.length ? this.translateText(part) : part)
            .join('/') +
            (queryParts.length > 1 ? `?${queryParts[1]}` : '');
    }
    /**
     * Get language from url
     */
    getLocationLang(url) {
        const queryParamSplit = (url || this.location.path()).split(/[\?;]/);
        let pathSlices = [];
        if (queryParamSplit.length > 0) {
            pathSlices = queryParamSplit[0].split('/');
        }
        if (pathSlices.length > 1 && this.locales.indexOf(pathSlices[1]) !== -1) {
            return pathSlices[1];
        }
        if (pathSlices.length && this.locales.indexOf(pathSlices[0]) !== -1) {
            return pathSlices[0];
        }
        return null;
    }
    /**
     * Get user's language set in the browser
     */
    _getBrowserLang() {
        return this._returnIfInLocales(this.translate.getBrowserLang());
    }
    /**
     * Get language from local storage or cookie
     */
    get _cachedLang() {
        if (!this.settings.useCachedLang) {
            return;
        }
        if (this.settings.cacheMechanism === CacheMechanism.LocalStorage) {
            return this._cacheWithLocalStorage();
        }
        if (this.settings.cacheMechanism === CacheMechanism.SessionStorage) {
            return this._cacheWithSessionStorage();
        }
        if (this.settings.cacheMechanism === CacheMechanism.Cookie) {
            return this._cacheWithCookies();
        }
    }
    /**
     * Save language to local storage or cookie
     */
    set _cachedLang(value) {
        if (!this.settings.useCachedLang) {
            return;
        }
        if (this.settings.cacheMechanism === CacheMechanism.LocalStorage) {
            this._cacheWithLocalStorage(value);
        }
        if (this.settings.cacheMechanism === CacheMechanism.SessionStorage) {
            this._cacheWithSessionStorage(value);
        }
        if (this.settings.cacheMechanism === CacheMechanism.Cookie) {
            this._cacheWithCookies(value);
        }
    }
    /**
     * Cache value to local storage
     */
    _cacheWithLocalStorage(value) {
        try {
            if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
                return;
            }
            if (value) {
                window.localStorage.setItem(this.settings.cacheName, value);
                return;
            }
            return this._returnIfInLocales(window.localStorage.getItem(this.settings.cacheName));
        }
        catch (e) {
            // weird Safari issue in private mode, where LocalStorage is defined but throws error on access
            return;
        }
    }
    /**
     * Cache value to session storage
     */
    _cacheWithSessionStorage(value) {
        try {
            if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
                return;
            }
            if (value) {
                window.sessionStorage.setItem(this.settings.cacheName, value);
                return;
            }
            return this._returnIfInLocales(window.sessionStorage.getItem(this.settings.cacheName));
        }
        catch (e) {
            return;
        }
    }
    /**
     * Cache value via cookies
     */
    _cacheWithCookies(value) {
        try {
            if (typeof document === 'undefined' || typeof document.cookie === 'undefined') {
                return;
            }
            const name = encodeURIComponent(this.settings.cacheName);
            if (value) {
                let cookieTemplate = `${this.settings.cookieFormat}`;
                cookieTemplate = cookieTemplate
                    .replace('{{value}}', `${name}=${encodeURIComponent(value)}`)
                    .replace(/{{expires:?(\d+)?}}/g, (fullMatch, groupMatch) => {
                    const days = groupMatch === undefined ? COOKIE_EXPIRY : parseInt(groupMatch, 10);
                    const date = new Date();
                    date.setTime(date.getTime() + days * 86400000);
                    return `expires=${date.toUTCString()}`;
                });
                document.cookie = cookieTemplate;
                return;
            }
            const regexp = new RegExp('(?:^' + name + '|;\\s*' + name + ')=(.*?)(?:;|$)', 'g');
            const result = regexp.exec(document.cookie);
            return decodeURIComponent(result[1]);
        }
        catch (e) {
            return; // should not happen but better safe than sorry (can happen by using domino)
        }
    }
    /**
     * Check if value exists in locales list
     */
    _returnIfInLocales(value) {
        if (value && this.locales.indexOf(value) !== -1) {
            return value;
        }
        return null;
    }
    /**
     * Get translated value
     */
    translateText(key) {
        if (this.escapePrefix && key.startsWith(this.escapePrefix)) {
            return key.replace(this.escapePrefix, '');
        }
        else {
            if (!this._translationObject) {
                return key;
            }
            const fullKey = this.prefix + key;
            const res = this.translate.getParsedResult(this._translationObject, fullKey);
            return res !== fullKey ? res : key;
        }
    }
    /**
     * Strategy to choose between new or old queryParams
     * @param newExtras extras that containes new QueryParams
     * @param currentQueryParams current query params
     */
    chooseQueryParams(newExtras, currentQueryParams) {
        let queryParamsObj;
        if (newExtras && newExtras.queryParams) {
            queryParamsObj = newExtras.queryParams;
        }
        else if (currentQueryParams) {
            queryParamsObj = currentQueryParams;
        }
        return queryParamsObj;
    }
    /**
     * Format query params from object to string.
     * Exemple of result: `param=value&param2=value2`
     * @param params query params object
     */
    formatQueryParams(params) {
        return new HttpParams({ fromObject: params }).toString();
    }
    /**
     * Get translation key prefix from config
     */
    getPrefix() {
        return this.prefix;
    }
    /**
     * Get escape translation prefix from config
     */
    getEscapePrefix() {
        return this.escapePrefix;
    }
}
LocalizeParser.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0", ngImport: i0, type: LocalizeParser, deps: [{ token: TranslateService }, { token: Location }, { token: LocalizeRouterSettings }], target: i0.ɵɵFactoryTarget.Injectable });
LocalizeParser.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.1.0", ngImport: i0, type: LocalizeParser });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0", ngImport: i0, type: LocalizeParser, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.TranslateService, decorators: [{
                    type: Inject,
                    args: [TranslateService]
                }] }, { type: i2.Location, decorators: [{
                    type: Inject,
                    args: [Location]
                }] }, { type: i3.LocalizeRouterSettings, decorators: [{
                    type: Inject,
                    args: [LocalizeRouterSettings]
                }] }]; } });
/**
 * Manually set configuration
 */
export class ManualParserLoader extends LocalizeParser {
    /**
     * CTOR
     */
    constructor(translate, location, settings, locales = ['en'], prefix = 'ROUTES.', escapePrefix = '') {
        super(translate, location, settings);
        this.locales = locales;
        this.prefix = prefix || '';
        this.escapePrefix = escapePrefix || '';
    }
    /**
     * Initialize or append routes
     */
    load(routes) {
        return new Promise((resolve) => {
            this.init(routes).then(resolve);
        });
    }
}
export class DummyLocalizeParser extends LocalizeParser {
    load(routes) {
        return new Promise((resolve) => {
            this.init(routes).then(resolve);
        });
    }
}
DummyLocalizeParser.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0", ngImport: i0, type: DummyLocalizeParser, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
DummyLocalizeParser.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.1.0", ngImport: i0, type: DummyLocalizeParser });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0", ngImport: i0, type: DummyLocalizeParser, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemUtcm91dGVyLnBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC10cmFuc2xhdGUtcm91dGVyL3NyYy9saWIvbG9jYWxpemUtcm91dGVyLnBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBWSxNQUFNLE1BQU0sQ0FBQztBQUM1RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDM0MsT0FBTyxFQUFFLGNBQWMsRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2xGLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQzs7Ozs7QUFFbEQsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDLENBQUMsVUFBVTtBQUVwQzs7R0FFRztBQUVILE1BQU0sT0FBZ0IsY0FBYztJQWFsQzs7T0FFRztJQUNILFlBQThDLFNBQTJCLEVBQzdDLFFBQWtCLEVBQ0osUUFBZ0M7UUFGNUIsY0FBUyxHQUFULFNBQVMsQ0FBa0I7UUFDN0MsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUNKLGFBQVEsR0FBUixRQUFRLENBQXdCO0lBQzFFLENBQUM7SUFPRDs7O0tBR0M7SUFDRDs7Ozs7Ozs7Ozs7UUFXSTtJQUdKOztPQUVHO0lBQ08sSUFBSSxDQUFDLE1BQWM7UUFDM0IsSUFBSSxnQkFBd0IsQ0FBQztRQUU3QiwyQkFBMkI7UUFDM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFFckIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUN6QyxPQUFP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QU0sT0FBTyxtQkFBb0IsU0FBUSxjQUFjO0lBQ3JELElBQUksQ0FBQyxNQUFjO1FBQ2pCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFZLEVBQUUsRUFBRTtZQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7O2dIQUxVLG1CQUFtQjtvSEFBbkIsbUJBQW1COzJGQUFuQixtQkFBbUI7a0JBRC9CLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSb3V0ZXMsIFJvdXRlLCBOYXZpZ2F0aW9uRXh0cmFzLCBQYXJhbXMgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgVHJhbnNsYXRlU2VydmljZSB9IGZyb20gJ0BuZ3gtdHJhbnNsYXRlL2NvcmUnO1xuaW1wb3J0IHsgZmlyc3RWYWx1ZUZyb20sIE9ic2VydmFibGUsIE9ic2VydmVyIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBMb2NhdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBDYWNoZU1lY2hhbmlzbSwgTG9jYWxpemVSb3V0ZXJTZXR0aW5ncyB9IGZyb20gJy4vbG9jYWxpemUtcm91dGVyLmNvbmZpZyc7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEh0dHBQYXJhbXMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5cbmNvbnN0IENPT0tJRV9FWFBJUlkgPSAzMDsgLy8gMSBtb250aFxuXG4vKipcbiAqIEFic3RyYWN0IGNsYXNzIGZvciBwYXJzaW5nIGxvY2FsaXphdGlvblxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTG9jYWxpemVQYXJzZXIge1xuICBsb2NhbGVzOiBBcnJheTxzdHJpbmc+O1xuICBjdXJyZW50TGFuZzogc3RyaW5nO1xuICByb3V0ZXM6IFJvdXRlcztcbiAgZGVmYXVsdExhbmc6IHN0cmluZztcblxuICBwcm90ZWN0ZWQgcHJlZml4OiBzdHJpbmc7XG4gIHByb3RlY3RlZCBlc2NhcGVQcmVmaXg6IHN0cmluZztcblxuICBwcml2YXRlIF90cmFuc2xhdGlvbk9iamVjdDogYW55O1xuICBwcml2YXRlIF93aWxkY2FyZFJvdXRlOiBSb3V0ZTtcbiAgcHJpdmF0ZSBfbGFuZ3VhZ2VSb3V0ZTogUm91dGU7XG5cbiAgLyoqXG4gICAqIExvYWRlciBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IoQEluamVjdChUcmFuc2xhdGVTZXJ2aWNlKSBwcml2YXRlIHRyYW5zbGF0ZTogVHJhbnNsYXRlU2VydmljZSxcbiAgICBASW5qZWN0KExvY2F0aW9uKSBwcml2YXRlIGxvY2F0aW9uOiBMb2NhdGlvbixcbiAgICBASW5qZWN0KExvY2FsaXplUm91dGVyU2V0dGluZ3MpIHByaXZhdGUgc2V0dGluZ3M6IExvY2FsaXplUm91dGVyU2V0dGluZ3MpIHtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIHJvdXRlcyBhbmQgZmV0Y2ggbmVjZXNzYXJ5IGRhdGFcbiAgICovXG4gIGFic3RyYWN0IGxvYWQocm91dGVzOiBSb3V0ZXMpOiBQcm9taXNlPGFueT47XG5cbiAgLyoqXG4gKiBQcmVwYXJlIHJvdXRlcyB0byBiZSBmdWxseSB1c2FibGUgYnkgbmd4LXRyYW5zbGF0ZS1yb3V0ZXJcbiAqIEBwYXJhbSByb3V0ZXNcbiAqL1xuICAvKiBwcml2YXRlIGluaXRSb3V0ZXMocm91dGVzOiBSb3V0ZXMsIHByZWZpeCA9ICcnKSB7XG4gICAgcm91dGVzLmZvckVhY2gocm91dGUgPT4ge1xuICAgICAgaWYgKHJvdXRlLnBhdGggIT09ICcqKicpIHtcbiAgICAgICAgY29uc3Qgcm91dGVEYXRhOiBhbnkgPSByb3V0ZS5kYXRhID0gcm91dGUuZGF0YSB8fCB7fTtcbiAgICAgICAgcm91dGVEYXRhLmxvY2FsaXplUm91dGVyID0ge307XG4gICAgICAgIHJvdXRlRGF0YS5sb2NhbGl6ZVJvdXRlci5mdWxsUGF0aCA9IGAke3ByZWZpeH0vJHtyb3V0ZS5wYXRofWA7XG4gICAgICAgIGlmIChyb3V0ZS5jaGlsZHJlbiAmJiByb3V0ZS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdGhpcy5pbml0Um91dGVzKHJvdXRlLmNoaWxkcmVuLCByb3V0ZURhdGEubG9jYWxpemVSb3V0ZXIuZnVsbFBhdGgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0gKi9cblxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIGxhbmd1YWdlIGFuZCByb3V0ZXNcbiAgICovXG4gIHByb3RlY3RlZCBpbml0KHJvdXRlczogUm91dGVzKTogUHJvbWlzZTxhbnk+IHtcbiAgICBsZXQgc2VsZWN0ZWRMYW5ndWFnZTogc3RyaW5nO1xuXG4gICAgLy8gdGhpcy5pbml0Um91dGVzKHJvdXRlcyk7XG4gICAgdGhpcy5yb3V0ZXMgPSByb3V0ZXM7XG5cbiAgICBpZiAoIXRoaXMubG9jYWxlcyB8fCAhdGhpcy5sb2NhbGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICAvKiogZGV0ZWN0IGN1cnJlbnQgbGFuZ3VhZ2UgKi9cbiAgICBjb25zdCBsb2NhdGlvbkxhbmcgPSB0aGlzLmdldExvY2F0aW9uTGFuZygpO1xuICAgIGNvbnN0IGJyb3dzZXJMYW5nID0gdGhpcy5fZ2V0QnJvd3NlckxhbmcoKTtcblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmRlZmF1bHRMYW5nRnVuY3Rpb24pIHtcbiAgICAgIHRoaXMuZGVmYXVsdExhbmcgPSB0aGlzLnNldHRpbmdzLmRlZmF1bHRMYW5nRnVuY3Rpb24odGhpcy5sb2NhbGVzLCB0aGlzLl9jYWNoZWRMYW5nLCBicm93c2VyTGFuZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVmYXVsdExhbmcgPSB0aGlzLl9jYWNoZWRMYW5nIHx8IGJyb3dzZXJMYW5nIHx8IHRoaXMubG9jYWxlc1swXTtcbiAgICB9XG4gICAgc2VsZWN0ZWRMYW5ndWFnZSA9IGxvY2F0aW9uTGFuZyB8fCB0aGlzLmRlZmF1bHRMYW5nO1xuICAgIHRoaXMudHJhbnNsYXRlLnNldERlZmF1bHRMYW5nKHRoaXMuZGVmYXVsdExhbmcpO1xuXG4gICAgbGV0IGNoaWxkcmVuOiBSb3V0ZXMgPSBbXTtcbiAgICAvKiogaWYgc2V0IHByZWZpeCBpcyBlbmZvcmNlZCAqL1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmFsd2F5c1NldFByZWZpeCkge1xuICAgICAgY29uc3QgYmFzZVJvdXRlOiBSb3V0ZSA9IHsgcGF0aDogJycsIHJlZGlyZWN0VG86IHRoaXMuZGVmYXVsdExhbmcsIHBhdGhNYXRjaDogJ2Z1bGwnIH07XG5cbiAgICAgIC8qKiBleHRyYWN0IHBvdGVudGlhbCB3aWxkY2FyZCByb3V0ZSAqL1xuICAgICAgY29uc3Qgd2lsZGNhcmRJbmRleCA9IHJvdXRlcy5maW5kSW5kZXgoKHJvdXRlOiBSb3V0ZSkgPT4gcm91dGUucGF0aCA9PT0gJyoqJyk7XG4gICAgICBpZiAod2lsZGNhcmRJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5fd2lsZGNhcmRSb3V0ZSA9IHJvdXRlcy5zcGxpY2Uod2lsZGNhcmRJbmRleCwgMSlbMF07XG4gICAgICB9XG4gICAgICBjaGlsZHJlbiA9IHRoaXMucm91dGVzLnNwbGljZSgwLCB0aGlzLnJvdXRlcy5sZW5ndGgsIGJhc2VSb3V0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoaWxkcmVuID0gWy4uLnRoaXMucm91dGVzXTsgLy8gc2hhbGxvdyBjb3B5IG9mIHJvdXRlc1xuICAgIH1cblxuICAgIC8qKiBleGNsdWRlIGNlcnRhaW4gcm91dGVzICovXG4gICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBpZiAoY2hpbGRyZW5baV0uZGF0YSAmJiBjaGlsZHJlbltpXS5kYXRhWydza2lwUm91dGVMb2NhbGl6YXRpb24nXSkge1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5hbHdheXNTZXRQcmVmaXgpIHtcbiAgICAgICAgICAvLyBhZGQgZGlyZWN0bHkgdG8gcm91dGVzXG4gICAgICAgICAgdGhpcy5yb3V0ZXMucHVzaChjaGlsZHJlbltpXSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVtb3ZlIGZyb20gcm91dGVzIHRvIHRyYW5zbGF0ZSBvbmx5IGlmIGRvZXNuJ3QgaGF2ZSB0byB0cmFuc2xhdGUgYHJlZGlyZWN0VG9gIHByb3BlcnR5XG4gICAgICAgIGlmIChjaGlsZHJlbltpXS5yZWRpcmVjdFRvID09PSB1bmRlZmluZWQgfHwgIShjaGlsZHJlbltpXS5kYXRhWydza2lwUm91dGVMb2NhbGl6YXRpb24nXVsnbG9jYWxpemVSZWRpcmVjdFRvJ10pKSB7XG4gICAgICAgICAgY2hpbGRyZW4uc3BsaWNlKGksIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqIGFwcGVuZCBjaGlsZHJlbiByb3V0ZXMgKi9cbiAgICBpZiAoY2hpbGRyZW4gJiYgY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICBpZiAodGhpcy5sb2NhbGVzLmxlbmd0aCA+IDEgfHwgdGhpcy5zZXR0aW5ncy5hbHdheXNTZXRQcmVmaXgpIHtcbiAgICAgICAgdGhpcy5fbGFuZ3VhZ2VSb3V0ZSA9IHsgY2hpbGRyZW46IGNoaWxkcmVuIH07XG4gICAgICAgIHRoaXMucm91dGVzLnVuc2hpZnQodGhpcy5fbGFuZ3VhZ2VSb3V0ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqIC4uLmFuZCBwb3RlbnRpYWwgd2lsZGNhcmQgcm91dGUgKi9cbiAgICBpZiAodGhpcy5fd2lsZGNhcmRSb3V0ZSAmJiB0aGlzLnNldHRpbmdzLmFsd2F5c1NldFByZWZpeCkge1xuICAgICAgdGhpcy5yb3V0ZXMucHVzaCh0aGlzLl93aWxkY2FyZFJvdXRlKTtcbiAgICB9XG5cbiAgICAvKiogdHJhbnNsYXRlIHJvdXRlcyAqL1xuICAgIHJldHVybiBmaXJzdFZhbHVlRnJvbShcbiAgICAgIHRoaXMudHJhbnNsYXRlUm91dGVzKHNlbGVjdGVkTGFuZ3VhZ2UpXG4gICAgKTtcbiAgfVxuXG4gIGluaXRDaGlsZFJvdXRlcyhyb3V0ZXM6IFJvdXRlcykge1xuICAgIHRoaXMuX3RyYW5zbGF0ZVJvdXRlVHJlZShyb3V0ZXMpO1xuICAgIHJldHVybiByb3V0ZXM7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNsYXRlIHJvdXRlcyB0byBzZWxlY3RlZCBsYW5ndWFnZVxuICAgKi9cbiAgdHJhbnNsYXRlUm91dGVzKGxhbmd1YWdlOiBzdHJpbmcpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZTxhbnk+KChvYnNlcnZlcjogT2JzZXJ2ZXI8YW55PikgPT4ge1xuICAgICAgdGhpcy5fY2FjaGVkTGFuZyA9IGxhbmd1YWdlO1xuICAgICAgaWYgKHRoaXMuX2xhbmd1YWdlUm91dGUpIHtcbiAgICAgICAgdGhpcy5fbGFuZ3VhZ2VSb3V0ZS5wYXRoID0gbGFuZ3VhZ2U7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudHJhbnNsYXRlLnVzZShsYW5ndWFnZSkuc3Vic2NyaWJlKCh0cmFuc2xhdGlvbnM6IGFueSkgPT4ge1xuICAgICAgICB0aGlzLl90cmFuc2xhdGlvbk9iamVjdCA9IHRyYW5zbGF0aW9ucztcbiAgICAgICAgdGhpcy5jdXJyZW50TGFuZyA9IGxhbmd1YWdlO1xuXG4gICAgICAgIGlmICh0aGlzLl9sYW5ndWFnZVJvdXRlKSB7XG4gICAgICAgICAgaWYgKHRoaXMuX2xhbmd1YWdlUm91dGUpIHtcbiAgICAgICAgICAgIHRoaXMuX3RyYW5zbGF0ZVJvdXRlVHJlZSh0aGlzLl9sYW5ndWFnZVJvdXRlLmNoaWxkcmVuKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gaWYgdGhlcmUgaXMgd2lsZGNhcmQgcm91dGVcbiAgICAgICAgICBpZiAodGhpcy5fd2lsZGNhcmRSb3V0ZSAmJiB0aGlzLl93aWxkY2FyZFJvdXRlLnJlZGlyZWN0VG8pIHtcbiAgICAgICAgICAgIHRoaXMuX3RyYW5zbGF0ZVByb3BlcnR5KHRoaXMuX3dpbGRjYXJkUm91dGUsICdyZWRpcmVjdFRvJywgdHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3RyYW5zbGF0ZVJvdXRlVHJlZSh0aGlzLnJvdXRlcyk7XG4gICAgICAgIH1cblxuICAgICAgICBvYnNlcnZlci5uZXh0KHZvaWQgMCk7XG4gICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2xhdGUgdGhlIHJvdXRlIG5vZGUgYW5kIHJlY3Vyc2l2ZWx5IGNhbGwgZm9yIGFsbCBpdCdzIGNoaWxkcmVuXG4gICAqL1xuICBwcml2YXRlIF90cmFuc2xhdGVSb3V0ZVRyZWUocm91dGVzOiBSb3V0ZXMpOiB2b2lkIHtcbiAgICByb3V0ZXMuZm9yRWFjaCgocm91dGU6IFJvdXRlKSA9PiB7XG4gICAgICBjb25zdCBza2lwUm91dGVMb2NhbGl6YXRpb24gPSAocm91dGUuZGF0YSAmJiByb3V0ZS5kYXRhWydza2lwUm91dGVMb2NhbGl6YXRpb24nXSk7XG4gICAgICBjb25zdCBsb2NhbGl6ZVJlZGlyZWN0aW9uID0gIXNraXBSb3V0ZUxvY2FsaXphdGlvbiB8fCBza2lwUm91dGVMb2NhbGl6YXRpb25bJ2xvY2FsaXplUmVkaXJlY3RUbyddO1xuXG4gICAgICBpZiAocm91dGUucmVkaXJlY3RUbyAmJiBsb2NhbGl6ZVJlZGlyZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuX3RyYW5zbGF0ZVByb3BlcnR5KHJvdXRlLCAncmVkaXJlY3RUbycsICFyb3V0ZS5yZWRpcmVjdFRvLmluZGV4T2YoJy8nKSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChza2lwUm91dGVMb2NhbGl6YXRpb24pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAocm91dGUucGF0aCAhPT0gbnVsbCAmJiByb3V0ZS5wYXRoICE9PSB1bmRlZmluZWQvKiAmJiByb3V0ZS5wYXRoICE9PSAnKionKi8pIHtcbiAgICAgICAgdGhpcy5fdHJhbnNsYXRlUHJvcGVydHkocm91dGUsICdwYXRoJyk7XG4gICAgICB9XG4gICAgICBpZiAocm91dGUuY2hpbGRyZW4pIHtcbiAgICAgICAgdGhpcy5fdHJhbnNsYXRlUm91dGVUcmVlKHJvdXRlLmNoaWxkcmVuKTtcbiAgICAgIH1cbiAgICAgIGlmIChyb3V0ZS5sb2FkQ2hpbGRyZW4gJiYgKDxhbnk+cm91dGUpLl9sb2FkZWRSb3V0ZXM/Lmxlbmd0aCkge1xuICAgICAgICB0aGlzLl90cmFuc2xhdGVSb3V0ZVRyZWUoKDxhbnk+cm91dGUpLl9sb2FkZWRSb3V0ZXMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zbGF0ZSBwcm9wZXJ0eVxuICAgKiBJZiBmaXJzdCB0aW1lIHRyYW5zbGF0aW9uIHRoZW4gYWRkIG9yaWdpbmFsIHRvIHJvdXRlIGRhdGEgb2JqZWN0XG4gICAqL1xuICBwcml2YXRlIF90cmFuc2xhdGVQcm9wZXJ0eShyb3V0ZTogUm91dGUsIHByb3BlcnR5OiBzdHJpbmcsIHByZWZpeExhbmc/OiBib29sZWFuKTogdm9pZCB7XG4gICAgLy8gc2V0IHByb3BlcnR5IHRvIGRhdGEgaWYgbm90IHRoZXJlIHlldFxuICAgIGNvbnN0IHJvdXRlRGF0YTogYW55ID0gcm91dGUuZGF0YSA9IHJvdXRlLmRhdGEgfHwge307XG4gICAgaWYgKCFyb3V0ZURhdGEubG9jYWxpemVSb3V0ZXIpIHtcbiAgICAgIHJvdXRlRGF0YS5sb2NhbGl6ZVJvdXRlciA9IHt9O1xuICAgIH1cbiAgICBpZiAoIXJvdXRlRGF0YS5sb2NhbGl6ZVJvdXRlcltwcm9wZXJ0eV0pIHtcbiAgICAgIHJvdXRlRGF0YS5sb2NhbGl6ZVJvdXRlciA9IHsuLi5yb3V0ZURhdGEubG9jYWxpemVSb3V0ZXIsIFtwcm9wZXJ0eV06IHJvdXRlW3Byb3BlcnR5XSB9O1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMudHJhbnNsYXRlUm91dGUocm91dGVEYXRhLmxvY2FsaXplUm91dGVyW3Byb3BlcnR5XSk7XG4gICAgKDxhbnk+cm91dGUpW3Byb3BlcnR5XSA9IHByZWZpeExhbmcgPyB0aGlzLmFkZFByZWZpeFRvVXJsKHJlc3VsdCkgOiByZXN1bHQ7XG4gIH1cblxuICBnZXQgdXJsUHJlZml4KCkge1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmFsd2F5c1NldFByZWZpeCB8fCB0aGlzLmN1cnJlbnRMYW5nICE9PSB0aGlzLmRlZmF1bHRMYW5nKSB7XG4gICAgICByZXR1cm4gdGhpcy5jdXJyZW50TGFuZyA/IHRoaXMuY3VycmVudExhbmcgOiB0aGlzLmRlZmF1bHRMYW5nO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBjdXJyZW50IGxhbmcgYXMgcHJlZml4IHRvIGdpdmVuIHVybC5cbiAgICovXG4gIGFkZFByZWZpeFRvVXJsKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBwbGl0ZWRVcmwgPSB1cmwuc3BsaXQoJz8nKTtcbiAgICBwbGl0ZWRVcmxbMF0gPSBwbGl0ZWRVcmxbMF0ucmVwbGFjZSgvXFwvJC8sICcnKTtcbiAgICByZXR1cm4gYC8ke3RoaXMudXJsUHJlZml4fSR7cGxpdGVkVXJsLmpvaW4oJz8nKX1gO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zbGF0ZSByb3V0ZSBhbmQgcmV0dXJuIG9ic2VydmFibGVcbiAgICovXG4gIHRyYW5zbGF0ZVJvdXRlKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgcXVlcnlQYXJ0cyA9IHBhdGguc3BsaXQoJz8nKTtcbiAgICBpZiAocXVlcnlQYXJ0cy5sZW5ndGggPiAyKSB7XG4gICAgICB0aHJvdyBFcnJvcignVGhlcmUgc2hvdWxkIGJlIG9ubHkgb25lIHF1ZXJ5IHBhcmFtZXRlciBibG9jayBpbiB0aGUgVVJMJyk7XG4gICAgfVxuICAgIGNvbnN0IHBhdGhTZWdtZW50cyA9IHF1ZXJ5UGFydHNbMF0uc3BsaXQoJy8nKTtcblxuICAgIC8qKiBjb2xsZWN0IG9ic2VydmFibGVzICAqL1xuICAgIHJldHVybiBwYXRoU2VnbWVudHNcbiAgICAgIC5tYXAoKHBhcnQ6IHN0cmluZykgPT4gcGFydC5sZW5ndGggPyB0aGlzLnRyYW5zbGF0ZVRleHQocGFydCkgOiBwYXJ0KVxuICAgICAgLmpvaW4oJy8nKSArXG4gICAgICAocXVlcnlQYXJ0cy5sZW5ndGggPiAxID8gYD8ke3F1ZXJ5UGFydHNbMV19YCA6ICcnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgbGFuZ3VhZ2UgZnJvbSB1cmxcbiAgICovXG4gIGdldExvY2F0aW9uTGFuZyh1cmw/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHF1ZXJ5UGFyYW1TcGxpdCA9ICh1cmwgfHwgdGhpcy5sb2NhdGlvbi5wYXRoKCkpLnNwbGl0KC9bXFw/O10vKTtcbiAgICBsZXQgcGF0aFNsaWNlczogc3RyaW5nW10gPSBbXTtcbiAgICBpZiAocXVlcnlQYXJhbVNwbGl0Lmxlbmd0aCA+IDApIHtcbiAgICAgIHBhdGhTbGljZXMgPSBxdWVyeVBhcmFtU3BsaXRbMF0uc3BsaXQoJy8nKTtcbiAgICB9XG4gICAgaWYgKHBhdGhTbGljZXMubGVuZ3RoID4gMSAmJiB0aGlzLmxvY2FsZXMuaW5kZXhPZihwYXRoU2xpY2VzWzFdKSAhPT0gLTEpIHtcbiAgICAgIHJldHVybiBwYXRoU2xpY2VzWzFdO1xuICAgIH1cbiAgICBpZiAocGF0aFNsaWNlcy5sZW5ndGggJiYgdGhpcy5sb2NhbGVzLmluZGV4T2YocGF0aFNsaWNlc1swXSkgIT09IC0xKSB7XG4gICAgICByZXR1cm4gcGF0aFNsaWNlc1swXTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHVzZXIncyBsYW5ndWFnZSBzZXQgaW4gdGhlIGJyb3dzZXJcbiAgICovXG4gIHByaXZhdGUgX2dldEJyb3dzZXJMYW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3JldHVybklmSW5Mb2NhbGVzKHRoaXMudHJhbnNsYXRlLmdldEJyb3dzZXJMYW5nKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBsYW5ndWFnZSBmcm9tIGxvY2FsIHN0b3JhZ2Ugb3IgY29va2llXG4gICAqL1xuICBwcml2YXRlIGdldCBfY2FjaGVkTGFuZygpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5zZXR0aW5ncy51c2VDYWNoZWRMYW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLnNldHRpbmdzLmNhY2hlTWVjaGFuaXNtID09PSBDYWNoZU1lY2hhbmlzbS5Mb2NhbFN0b3JhZ2UpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZVdpdGhMb2NhbFN0b3JhZ2UoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuY2FjaGVNZWNoYW5pc20gPT09IENhY2hlTWVjaGFuaXNtLlNlc3Npb25TdG9yYWdlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVXaXRoU2Vzc2lvblN0b3JhZ2UoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuY2FjaGVNZWNoYW5pc20gPT09IENhY2hlTWVjaGFuaXNtLkNvb2tpZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlV2l0aENvb2tpZXMoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2F2ZSBsYW5ndWFnZSB0byBsb2NhbCBzdG9yYWdlIG9yIGNvb2tpZVxuICAgKi9cbiAgcHJpdmF0ZSBzZXQgX2NhY2hlZExhbmcodmFsdWU6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5zZXR0aW5ncy51c2VDYWNoZWRMYW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLnNldHRpbmdzLmNhY2hlTWVjaGFuaXNtID09PSBDYWNoZU1lY2hhbmlzbS5Mb2NhbFN0b3JhZ2UpIHtcbiAgICAgIHRoaXMuX2NhY2hlV2l0aExvY2FsU3RvcmFnZSh2YWx1ZSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnNldHRpbmdzLmNhY2hlTWVjaGFuaXNtID09PSBDYWNoZU1lY2hhbmlzbS5TZXNzaW9uU3RvcmFnZSkge1xuICAgICAgdGhpcy5fY2FjaGVXaXRoU2Vzc2lvblN0b3JhZ2UodmFsdWUpO1xuICAgIH1cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5jYWNoZU1lY2hhbmlzbSA9PT0gQ2FjaGVNZWNoYW5pc20uQ29va2llKSB7XG4gICAgICB0aGlzLl9jYWNoZVdpdGhDb29raWVzKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FjaGUgdmFsdWUgdG8gbG9jYWwgc3RvcmFnZVxuICAgKi9cbiAgcHJpdmF0ZSBfY2FjaGVXaXRoTG9jYWxTdG9yYWdlKHZhbHVlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB0cnkge1xuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB3aW5kb3cubG9jYWxTdG9yYWdlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuc2V0dGluZ3MuY2FjaGVOYW1lLCB2YWx1ZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9yZXR1cm5JZkluTG9jYWxlcyh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5zZXR0aW5ncy5jYWNoZU5hbWUpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyB3ZWlyZCBTYWZhcmkgaXNzdWUgaW4gcHJpdmF0ZSBtb2RlLCB3aGVyZSBMb2NhbFN0b3JhZ2UgaXMgZGVmaW5lZCBidXQgdGhyb3dzIGVycm9yIG9uIGFjY2Vzc1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWNoZSB2YWx1ZSB0byBzZXNzaW9uIHN0b3JhZ2VcbiAgICovXG4gIHByaXZhdGUgX2NhY2hlV2l0aFNlc3Npb25TdG9yYWdlKHZhbHVlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB0cnkge1xuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB3aW5kb3cuc2Vzc2lvblN0b3JhZ2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSh0aGlzLnNldHRpbmdzLmNhY2hlTmFtZSwgdmFsdWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fcmV0dXJuSWZJbkxvY2FsZXMod2luZG93LnNlc3Npb25TdG9yYWdlLmdldEl0ZW0odGhpcy5zZXR0aW5ncy5jYWNoZU5hbWUpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhY2hlIHZhbHVlIHZpYSBjb29raWVzXG4gICAqL1xuICBwcml2YXRlIF9jYWNoZVdpdGhDb29raWVzKHZhbHVlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCAgdHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgZG9jdW1lbnQuY29va2llID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBuYW1lID0gZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuc2V0dGluZ3MuY2FjaGVOYW1lKTtcbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICBsZXQgY29va2llVGVtcGxhdGUgPSBgJHt0aGlzLnNldHRpbmdzLmNvb2tpZUZvcm1hdH1gO1xuICAgICAgICBjb29raWVUZW1wbGF0ZSA9IGNvb2tpZVRlbXBsYXRlXG4gICAgICAgICAgLnJlcGxhY2UoJ3t7dmFsdWV9fScsIGAke25hbWV9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKX1gKVxuICAgICAgICAgIC5yZXBsYWNlKC97e2V4cGlyZXM6PyhcXGQrKT99fS9nLCAoZnVsbE1hdGNoLCBncm91cE1hdGNoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGRheXMgPSBncm91cE1hdGNoID09PSB1bmRlZmluZWQgPyBDT09LSUVfRVhQSVJZIDogcGFyc2VJbnQoZ3JvdXBNYXRjaCwgMTApO1xuICAgICAgICAgICAgICBjb25zdCBkYXRlOiBEYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgZGF0ZS5zZXRUaW1lKGRhdGUuZ2V0VGltZSgpICsgZGF5cyAqIDg2NDAwMDAwKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGBleHBpcmVzPSR7ZGF0ZS50b1VUQ1N0cmluZygpfWA7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llVGVtcGxhdGU7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlZ2V4cCA9IG5ldyBSZWdFeHAoJyg/Ol4nICsgbmFtZSArICd8O1xcXFxzKicgKyBuYW1lICsgJyk9KC4qPykoPzo7fCQpJywgJ2cnKTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHJlZ2V4cC5leGVjKGRvY3VtZW50LmNvb2tpZSk7XG4gICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdFsxXSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuOyAvLyBzaG91bGQgbm90IGhhcHBlbiBidXQgYmV0dGVyIHNhZmUgdGhhbiBzb3JyeSAoY2FuIGhhcHBlbiBieSB1c2luZyBkb21pbm8pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHZhbHVlIGV4aXN0cyBpbiBsb2NhbGVzIGxpc3RcbiAgICovXG4gIHByaXZhdGUgX3JldHVybklmSW5Mb2NhbGVzKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh2YWx1ZSAmJiB0aGlzLmxvY2FsZXMuaW5kZXhPZih2YWx1ZSkgIT09IC0xKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0cmFuc2xhdGVkIHZhbHVlXG4gICAqL1xuICBwcml2YXRlIHRyYW5zbGF0ZVRleHQoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLmVzY2FwZVByZWZpeCAmJiBrZXkuc3RhcnRzV2l0aCh0aGlzLmVzY2FwZVByZWZpeCkpIHtcbiAgICAgIHJldHVybiBrZXkucmVwbGFjZSh0aGlzLmVzY2FwZVByZWZpeCwgJycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXRoaXMuX3RyYW5zbGF0aW9uT2JqZWN0KSB7XG4gICAgICAgIHJldHVybiBrZXk7XG4gICAgICB9XG4gICAgICBjb25zdCBmdWxsS2V5ID0gdGhpcy5wcmVmaXggKyBrZXk7XG4gICAgICBjb25zdCByZXMgPSB0aGlzLnRyYW5zbGF0ZS5nZXRQYXJzZWRSZXN1bHQodGhpcy5fdHJhbnNsYXRpb25PYmplY3QsIGZ1bGxLZXkpO1xuICAgICAgcmV0dXJuIHJlcyAhPT0gZnVsbEtleSA/IHJlcyA6IGtleTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RyYXRlZ3kgdG8gY2hvb3NlIGJldHdlZW4gbmV3IG9yIG9sZCBxdWVyeVBhcmFtc1xuICAgKiBAcGFyYW0gbmV3RXh0cmFzIGV4dHJhcyB0aGF0IGNvbnRhaW5lcyBuZXcgUXVlcnlQYXJhbXNcbiAgICogQHBhcmFtIGN1cnJlbnRRdWVyeVBhcmFtcyBjdXJyZW50IHF1ZXJ5IHBhcmFtc1xuICAgKi9cbiAgcHVibGljIGNob29zZVF1ZXJ5UGFyYW1zKG5ld0V4dHJhczogTmF2aWdhdGlvbkV4dHJhcywgY3VycmVudFF1ZXJ5UGFyYW1zOiBQYXJhbXMpIHtcbiAgICBsZXQgcXVlcnlQYXJhbXNPYmo6IFBhcmFtcztcbiAgICBpZiAobmV3RXh0cmFzICYmIG5ld0V4dHJhcy5xdWVyeVBhcmFtcykge1xuICAgICAgcXVlcnlQYXJhbXNPYmogPSBuZXdFeHRyYXMucXVlcnlQYXJhbXM7XG4gICAgfSBlbHNlIGlmIChjdXJyZW50UXVlcnlQYXJhbXMpIHtcbiAgICAgIHF1ZXJ5UGFyYW1zT2JqID0gY3VycmVudFF1ZXJ5UGFyYW1zO1xuICAgIH1cbiAgICByZXR1cm4gcXVlcnlQYXJhbXNPYmo7XG4gIH1cblxuICAvKipcbiAgICogRm9ybWF0IHF1ZXJ5IHBhcmFtcyBmcm9tIG9iamVjdCB0byBzdHJpbmcuXG4gICAqIEV4ZW1wbGUgb2YgcmVzdWx0OiBgcGFyYW09dmFsdWUmcGFyYW0yPXZhbHVlMmBcbiAgICogQHBhcmFtIHBhcmFtcyBxdWVyeSBwYXJhbXMgb2JqZWN0XG4gICAqL1xuICBwdWJsaWMgZm9ybWF0UXVlcnlQYXJhbXMocGFyYW1zOiBQYXJhbXMpOiBzdHJpbmcge1xuICAgIHJldHVybiBuZXcgSHR0cFBhcmFtcyh7IGZyb21PYmplY3Q6IHBhcmFtcyB9KS50b1N0cmluZygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0cmFuc2xhdGlvbiBrZXkgcHJlZml4IGZyb20gY29uZmlnXG4gICAqL1xuICBwdWJsaWMgZ2V0UHJlZml4KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucHJlZml4O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBlc2NhcGUgdHJhbnNsYXRpb24gcHJlZml4IGZyb20gY29uZmlnXG4gICAqL1xuICBwdWJsaWMgZ2V0RXNjYXBlUHJlZml4KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZXNjYXBlUHJlZml4O1xuICB9XG59XG5cbi8qKlxuICogTWFudWFsbHkgc2V0IGNvbmZpZ3VyYXRpb25cbiAqL1xuZXhwb3J0IGNsYXNzIE1hbnVhbFBhcnNlckxvYWRlciBleHRlbmRzIExvY2FsaXplUGFyc2VyIHtcblxuICAvKipcbiAgICogQ1RPUlxuICAgKi9cbiAgY29uc3RydWN0b3IodHJhbnNsYXRlOiBUcmFuc2xhdGVTZXJ2aWNlLCBsb2NhdGlvbjogTG9jYXRpb24sIHNldHRpbmdzOiBMb2NhbGl6ZVJvdXRlclNldHRpbmdzLFxuICAgIGxvY2FsZXM6IHN0cmluZ1tdID0gWydlbiddLCBwcmVmaXg6IHN0cmluZyA9ICdST1VURVMuJywgZXNjYXBlUHJlZml4OiBzdHJpbmcgPSAnJykge1xuICAgIHN1cGVyKHRyYW5zbGF0ZSwgbG9jYXRpb24sIHNldHRpbmdzKTtcbiAgICB0aGlzLmxvY2FsZXMgPSBsb2NhbGVzO1xuICAgIHRoaXMucHJlZml4ID0gcHJlZml4IHx8ICcnO1xuICAgIHRoaXMuZXNjYXBlUHJlZml4ID0gZXNjYXBlUHJlZml4IHx8ICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgb3IgYXBwZW5kIHJvdXRlc1xuICAgKi9cbiAgbG9hZChyb3V0ZXM6IFJvdXRlcyk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlOiBhbnkpID0+IHtcbiAgICAgIHRoaXMuaW5pdChyb3V0ZXMpLnRoZW4ocmVzb2x2ZSk7XG4gICAgfSk7XG4gIH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIER1bW15TG9jYWxpemVQYXJzZXIgZXh0ZW5kcyBMb2NhbGl6ZVBhcnNlciB7XG4gIGxvYWQocm91dGVzOiBSb3V0ZXMpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZTogYW55KSA9PiB7XG4gICAgICB0aGlzLmluaXQocm91dGVzKS50aGVuKHJlc29sdmUpO1xuICAgIH0pO1xuICB9XG59XG4iXX0=
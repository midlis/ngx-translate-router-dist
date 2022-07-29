import { Inject, Injectable } from '@angular/core';
// import { Location } from '@angular/common';
import { Router, NavigationStart, ActivatedRoute, NavigationCancel } from '@angular/router';
import { Subject, ReplaySubject } from 'rxjs';
import { filter, pairwise } from 'rxjs/operators';
import { LocalizeParser } from './localize-router.parser';
import { LocalizeRouterSettings } from './localize-router.config';
import { deepCopy } from './util';
import * as i0 from "@angular/core";
import * as i1 from "./localize-router.parser";
import * as i2 from "./localize-router.config";
import * as i3 from "@angular/router";
/**
 * Localization service
 * modifyRoutes
 */
export class LocalizeRouterService {
    /**
     * CTOR
     */
    constructor(parser, settings, router, route /*,
    @Inject(Location) private location: Location*/) {
        this.parser = parser;
        this.settings = settings;
        this.router = router;
        this.route = route;
        this.routerEvents = new Subject();
        const initializedSubject = new ReplaySubject(1);
        this.hooks = {
            _initializedSubject: initializedSubject,
            initialized: initializedSubject.asObservable()
        };
    }
    /**
     * Start up the service
     */
    init() {
        this.applyConfigToRouter(this.parser.routes);
        // subscribe to router events
        this.router.events
            .pipe(filter(event => event instanceof NavigationStart), pairwise())
            .subscribe(this._routeChanged());
        if (this.settings.initialNavigation) {
            this.router.initialNavigation();
        }
    }
    /**
     * Change language and navigate to translated route
     */
    changeLanguage(lang, extras, useNavigateMethod) {
        if (lang !== this.parser.currentLang) {
            const rootSnapshot = this.router.routerState.snapshot.root;
            this.parser.translateRoutes(lang).subscribe(() => {
                let url = this.traverseRouteSnapshot(rootSnapshot);
                url = this.translateRoute(url);
                if (!this.settings.alwaysSetPrefix) {
                    let urlSegments = url.split('/');
                    const languageSegmentIndex = urlSegments.indexOf(this.parser.currentLang);
                    // If the default language has no prefix make sure to remove and add it when necessary
                    if (this.parser.currentLang === this.parser.defaultLang) {
                        // Remove the language prefix from url when current language is the default language
                        if (languageSegmentIndex === 0 || (languageSegmentIndex === 1 && urlSegments[0] === '')) {
                            // Remove the current aka default language prefix from the url
                            urlSegments = urlSegments.slice(0, languageSegmentIndex).concat(urlSegments.slice(languageSegmentIndex + 1));
                        }
                    }
                    else {
                        // When coming from a default language it's possible that the url doesn't contain the language, make sure it does.
                        if (languageSegmentIndex === -1) {
                            // If the url starts with a slash make sure to keep it.
                            const injectionIndex = urlSegments[0] === '' ? 1 : 0;
                            urlSegments = urlSegments.slice(0, injectionIndex).concat(this.parser.currentLang, urlSegments.slice(injectionIndex));
                        }
                    }
                    url = urlSegments.join('/');
                }
                // Prevent multiple "/" character
                url = url.replace(/\/+/g, '/');
                const lastSlashIndex = url.lastIndexOf('/');
                if (lastSlashIndex > 0 && lastSlashIndex === url.length - 1) {
                    url = url.slice(0, -1);
                }
                const queryParamsObj = this.parser.chooseQueryParams(extras, this.route.snapshot.queryParams);
                this.applyConfigToRouter(this.parser.routes);
                this.lastExtras = extras;
                if (useNavigateMethod) {
                    const extrasToApply = extras ? { ...extras } : {};
                    if (queryParamsObj) {
                        extrasToApply.queryParams = queryParamsObj;
                    }
                    this.router.navigate([url], extrasToApply);
                }
                else {
                    let queryParams = this.parser.formatQueryParams(queryParamsObj);
                    queryParams = queryParams ? `?${queryParams}` : '';
                    this.router.navigateByUrl(`${url}${queryParams}`, extras);
                }
            });
        }
    }
    /**
     * Traverses through the tree to assemble new translated url
     */
    traverseRouteSnapshot(snapshot) {
        if (snapshot.firstChild && snapshot.routeConfig) {
            return `${this.parseSegmentValue(snapshot)}/${this.traverseRouteSnapshot(snapshot.firstChild)}`;
        }
        else if (snapshot.firstChild) {
            return this.traverseRouteSnapshot(snapshot.firstChild);
        }
        else {
            return this.parseSegmentValue(snapshot);
        }
        /* if (snapshot.firstChild && snapshot.firstChild.routeConfig && snapshot.firstChild.routeConfig.path) {
          if (snapshot.firstChild.routeConfig.path !== '**') {
            return this.parseSegmentValue(snapshot) + '/' + this.traverseRouteSnapshot(snapshot.firstChild);
          } else {
            return this.parseSegmentValue(snapshot.firstChild);
          }
        }
        return this.parseSegmentValue(snapshot); */
    }
    /**
     * Build URL from segments and snapshot (for params)
     */
    buildUrlFromSegments(snapshot, segments) {
        return segments.map((s, i) => s.indexOf(':') === 0 ? snapshot.url[i].path : s).join('/');
    }
    /**
     * Extracts new segment value based on routeConfig and url
     */
    parseSegmentValue(snapshot) {
        if (snapshot.routeConfig && snapshot.routeConfig.matcher) {
            const subPathMatchedSegments = this.parseSegmentValueMatcher(snapshot);
            return this.buildUrlFromSegments(snapshot, subPathMatchedSegments);
        }
        else if (snapshot.data.localizeRouter) {
            const path = snapshot.data.localizeRouter.path;
            const subPathSegments = path.split('/');
            return this.buildUrlFromSegments(snapshot, subPathSegments);
        }
        else if (snapshot.parent && snapshot.parent.parent) { // Not lang route and no localizeRouter data = excluded path
            const path = snapshot.routeConfig.path;
            const subPathSegments = path.split('/');
            return this.buildUrlFromSegments(snapshot, subPathSegments);
        }
        else {
            return '';
        }
        /* if (snapshot.routeConfig) {
          if (snapshot.routeConfig.path === '**') {
            return snapshot.url.filter((segment: UrlSegment) => segment.path).map((segment: UrlSegment) => segment.path).join('/');
          } else {
            const subPathSegments = snapshot.routeConfig.path.split('/');
            return subPathSegments.map((s: string, i: number) => s.indexOf(':') === 0 ? snapshot.url[i].path : s).join('/');
          }
        }
        return ''; */
    }
    parseSegmentValueMatcher(snapshot) {
        const localizeMatcherParams = snapshot.data && snapshot.data.localizeMatcher && snapshot.data.localizeMatcher.params || {};
        const subPathSegments = snapshot.url
            .map((segment) => {
            const currentPath = segment.path;
            const matchedParamName = segment.localizedParamName;
            const val = (matchedParamName && localizeMatcherParams[matchedParamName]) ?
                localizeMatcherParams[matchedParamName](currentPath) : null;
            return val || `${this.parser.getEscapePrefix()}${currentPath}`;
        });
        return subPathSegments;
    }
    /**
     * Translate route to current language
     * If new language is explicitly provided then replace language part in url with new language
     */
    translateRoute(path) {
        if (typeof path === 'string') {
            const url = this.parser.translateRoute(path);
            return !path.indexOf('/') ? this.parser.addPrefixToUrl(url) : url;
        }
        // it's an array
        const result = [];
        path.forEach((segment, index) => {
            if (typeof segment === 'string') {
                const res = this.parser.translateRoute(segment);
                if (!index && !segment.indexOf('/')) {
                    result.push(this.parser.addPrefixToUrl(res));
                }
                else {
                    result.push(res);
                }
            }
            else {
                result.push(segment);
            }
        });
        return result;
    }
    /**
     * Event handler to react on route change
     */
    _routeChanged() {
        return ([previousEvent, currentEvent]) => {
            const previousLang = this.parser.getLocationLang(previousEvent.url) || this.parser.defaultLang;
            const currentLang = this.parser.getLocationLang(currentEvent.url) || this.parser.defaultLang;
            const lastExtras = this.lastExtras;
            if (currentLang !== previousLang && this.latestUrl !== currentEvent.url) {
                this.latestUrl = currentEvent.url;
                this.cancelCurrentNavigation();
                this.parser.translateRoutes(currentLang)
                    .subscribe(() => {
                    // Reset routes again once they are all translated
                    this.applyConfigToRouter(this.parser.routes);
                    // Clear global extras
                    this.lastExtras = undefined;
                    // Init new navigation with same url to take new config in consideration
                    this.router.navigateByUrl(currentEvent.url, lastExtras);
                    // Fire route change event
                    this.routerEvents.next(currentLang);
                });
            }
            this.latestUrl = currentEvent.url;
        };
    }
    /**
     * Drop the current Navigation
     */
    cancelCurrentNavigation() {
        const currentNavigation = this.router.getCurrentNavigation();
        const url = this.router.serializeUrl(currentNavigation.extractedUrl);
        this.router.events.next(new NavigationCancel(currentNavigation.id, url, ''));
        this.router.transitions.next({ ...this.router.transitions.getValue(), id: 0 });
    }
    /**
     * Apply config to Angular RouterModule
     * @param config routes to apply
     */
    applyConfigToRouter(config) {
        this.router.resetConfig(deepCopy(config));
    }
}
LocalizeRouterService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0", ngImport: i0, type: LocalizeRouterService, deps: [{ token: LocalizeParser }, { token: LocalizeRouterSettings }, { token: Router }, { token: ActivatedRoute }], target: i0.ɵɵFactoryTarget.Injectable });
LocalizeRouterService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.1.0", ngImport: i0, type: LocalizeRouterService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0", ngImport: i0, type: LocalizeRouterService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.LocalizeParser, decorators: [{
                    type: Inject,
                    args: [LocalizeParser]
                }] }, { type: i2.LocalizeRouterSettings, decorators: [{
                    type: Inject,
                    args: [LocalizeRouterSettings]
                }] }, { type: i3.Router, decorators: [{
                    type: Inject,
                    args: [Router]
                }] }, { type: i3.ActivatedRoute, decorators: [{
                    type: Inject,
                    args: [ActivatedRoute]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemUtcm91dGVyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtdHJhbnNsYXRlLXJvdXRlci9zcmMvbGliL2xvY2FsaXplLXJvdXRlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ25ELDhDQUE4QztBQUM5QyxPQUFPLEVBQ0wsTUFBTSxFQUFFLGVBQWUsRUFBNEMsY0FBYyxFQUMxRSxnQkFBZ0IsRUFDeEIsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QixPQUFPLEVBQUUsT0FBTyxFQUFjLGFBQWEsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMxRCxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWxELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUVsRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sUUFBUSxDQUFDOzs7OztBQUVsQzs7O0dBR0c7QUFFSCxNQUFNLE9BQU8scUJBQXFCO0lBWWhDOztPQUVHO0lBQ0gsWUFDbUMsTUFBc0IsRUFDZCxRQUFnQyxFQUMvQyxNQUFjLEVBQ04sS0FBcUIsQ0FBQTtrREFDUDtRQUpmLFdBQU0sR0FBTixNQUFNLENBQWdCO1FBQ2QsYUFBUSxHQUFSLFFBQVEsQ0FBd0I7UUFDL0MsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNOLFVBQUssR0FBTCxLQUFLLENBQWdCO1FBR3JELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxPQUFPLEVBQVUsQ0FBQztRQUMxQyxNQUFNLGtCQUFrQixHQUFHLElBQUksYUFBYSxDQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxLQUFLLEdBQUc7WUFDWCxt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b20gJ0Bhbmd1bGFyL2NvcmUnO1xuLy8gaW1wb3J0IHsgTG9jYXRpb24gfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgUm91dGVyLCBOYXZpZ2F0aW9uU3RhcnQsIEFjdGl2YXRlZFJvdXRlU25hcHNob3QsIE5hdmlnYXRpb25FeHRyYXMsIEFjdGl2YXRlZFJvdXRlLFxuICBFdmVudCwgTmF2aWdhdGlvbkNhbmNlbCwgUm91dGVzXG59IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBTdWJqZWN0LCBPYnNlcnZhYmxlLCBSZXBsYXlTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBmaWx0ZXIsIHBhaXJ3aXNlIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyBMb2NhbGl6ZVBhcnNlciB9IGZyb20gJy4vbG9jYWxpemUtcm91dGVyLnBhcnNlcic7XG5pbXBvcnQgeyBMb2NhbGl6ZVJvdXRlclNldHRpbmdzIH0gZnJvbSAnLi9sb2NhbGl6ZS1yb3V0ZXIuY29uZmlnJztcbmltcG9ydCB7IExvY2FsaXplZE1hdGNoZXJVcmxTZWdtZW50IH0gZnJvbSAnLi9sb2NhbGl6ZWQtbWF0Y2hlci11cmwtc2VnbWVudCc7XG5pbXBvcnQgeyBkZWVwQ29weSB9IGZyb20gJy4vdXRpbCc7XG5cbi8qKlxuICogTG9jYWxpemF0aW9uIHNlcnZpY2VcbiAqIG1vZGlmeVJvdXRlc1xuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTG9jYWxpemVSb3V0ZXJTZXJ2aWNlIHtcbiAgcm91dGVyRXZlbnRzOiBTdWJqZWN0PHN0cmluZz47XG4gIGhvb2tzOiB7XG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIF9pbml0aWFsaXplZFN1YmplY3Q6IFJlcGxheVN1YmplY3Q8Ym9vbGVhbj47XG4gICAgaW5pdGlhbGl6ZWQ6IE9ic2VydmFibGU8Ym9vbGVhbj47XG4gIH07XG5cblxuICBwcml2YXRlIGxhdGVzdFVybDogc3RyaW5nO1xuICBwcml2YXRlIGxhc3RFeHRyYXM/OiBOYXZpZ2F0aW9uRXh0cmFzO1xuXG4gIC8qKlxuICAgKiBDVE9SXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIEBJbmplY3QoTG9jYWxpemVQYXJzZXIpIHB1YmxpYyBwYXJzZXI6IExvY2FsaXplUGFyc2VyLFxuICAgICAgQEluamVjdChMb2NhbGl6ZVJvdXRlclNldHRpbmdzKSBwdWJsaWMgc2V0dGluZ3M6IExvY2FsaXplUm91dGVyU2V0dGluZ3MsXG4gICAgICBASW5qZWN0KFJvdXRlcikgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcbiAgICAgIEBJbmplY3QoQWN0aXZhdGVkUm91dGUpIHByaXZhdGUgcm91dGU6IEFjdGl2YXRlZFJvdXRlLyosXG4gICAgICBASW5qZWN0KExvY2F0aW9uKSBwcml2YXRlIGxvY2F0aW9uOiBMb2NhdGlvbiovXG4gICAgKSB7XG4gICAgICB0aGlzLnJvdXRlckV2ZW50cyA9IG5ldyBTdWJqZWN0PHN0cmluZz4oKTtcbiAgICAgIGNvbnN0IGluaXRpYWxpemVkU3ViamVjdCA9IG5ldyBSZXBsYXlTdWJqZWN0PGJvb2xlYW4+KDEpO1xuICAgICAgdGhpcy5ob29rcyA9IHtcbiAgICAgICAgX2luaXRpYWxpemVkU3ViamVjdDogaW5pdGlhbGl6ZWRTdWJqZWN0LFxuICAgICAgICBpbml0aWFsaXplZDogaW5pdGlhbGl6ZWRTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpXG4gICAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHVwIHRoZSBzZXJ2aWNlXG4gICAqL1xuICBpbml0KCk6IHZvaWQge1xuICAgIHRoaXMuYXBwbHlDb25maWdUb1JvdXRlcih0aGlzLnBhcnNlci5yb3V0ZXMpO1xuICAgIC8vIHN1YnNjcmliZSB0byByb3V0ZXIgZXZlbnRzXG4gICAgdGhpcy5yb3V0ZXIuZXZlbnRzXG4gICAgICAucGlwZShcbiAgICAgICAgZmlsdGVyKGV2ZW50ID0+IGV2ZW50IGluc3RhbmNlb2YgTmF2aWdhdGlvblN0YXJ0KSxcbiAgICAgICAgcGFpcndpc2UoKVxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSh0aGlzLl9yb3V0ZUNoYW5nZWQoKSk7XG5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5pbml0aWFsTmF2aWdhdGlvbikge1xuICAgICAgdGhpcy5yb3V0ZXIuaW5pdGlhbE5hdmlnYXRpb24oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlIGxhbmd1YWdlIGFuZCBuYXZpZ2F0ZSB0byB0cmFuc2xhdGVkIHJvdXRlXG4gICAqL1xuICBjaGFuZ2VMYW5ndWFnZShsYW5nOiBzdHJpbmcsIGV4dHJhcz86IE5hdmlnYXRpb25FeHRyYXMsIHVzZU5hdmlnYXRlTWV0aG9kPzogYm9vbGVhbik6IHZvaWQge1xuXG4gICAgaWYgKGxhbmcgIT09IHRoaXMucGFyc2VyLmN1cnJlbnRMYW5nKSB7XG4gICAgICBjb25zdCByb290U25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QgPSB0aGlzLnJvdXRlci5yb3V0ZXJTdGF0ZS5zbmFwc2hvdC5yb290O1xuXG4gICAgICB0aGlzLnBhcnNlci50cmFuc2xhdGVSb3V0ZXMobGFuZykuc3Vic2NyaWJlKCgpID0+IHtcblxuICAgICAgICBsZXQgdXJsID0gdGhpcy50cmF2ZXJzZVJvdXRlU25hcHNob3Qocm9vdFNuYXBzaG90KTtcbiAgICAgICAgdXJsID0gdGhpcy50cmFuc2xhdGVSb3V0ZSh1cmwpIGFzIHN0cmluZztcblxuICAgICAgICBpZiAoIXRoaXMuc2V0dGluZ3MuYWx3YXlzU2V0UHJlZml4KSB7XG4gICAgICAgICAgbGV0IHVybFNlZ21lbnRzID0gdXJsLnNwbGl0KCcvJyk7XG4gICAgICAgICAgY29uc3QgbGFuZ3VhZ2VTZWdtZW50SW5kZXggPSB1cmxTZWdtZW50cy5pbmRleE9mKHRoaXMucGFyc2VyLmN1cnJlbnRMYW5nKTtcbiAgICAgICAgICAvLyBJZiB0aGUgZGVmYXVsdCBsYW5ndWFnZSBoYXMgbm8gcHJlZml4IG1ha2Ugc3VyZSB0byByZW1vdmUgYW5kIGFkZCBpdCB3aGVuIG5lY2Vzc2FyeVxuICAgICAgICAgIGlmICh0aGlzLnBhcnNlci5jdXJyZW50TGFuZyA9PT0gdGhpcy5wYXJzZXIuZGVmYXVsdExhbmcpIHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgbGFuZ3VhZ2UgcHJlZml4IGZyb20gdXJsIHdoZW4gY3VycmVudCBsYW5ndWFnZSBpcyB0aGUgZGVmYXVsdCBsYW5ndWFnZVxuICAgICAgICAgICAgaWYgKGxhbmd1YWdlU2VnbWVudEluZGV4ID09PSAwIHx8IChsYW5ndWFnZVNlZ21lbnRJbmRleCA9PT0gMSAmJiB1cmxTZWdtZW50c1swXSA9PT0gJycpKSB7XG4gICAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgY3VycmVudCBha2EgZGVmYXVsdCBsYW5ndWFnZSBwcmVmaXggZnJvbSB0aGUgdXJsXG4gICAgICAgICAgICAgIHVybFNlZ21lbnRzID0gdXJsU2VnbWVudHMuc2xpY2UoMCwgbGFuZ3VhZ2VTZWdtZW50SW5kZXgpLmNvbmNhdCh1cmxTZWdtZW50cy5zbGljZShsYW5ndWFnZVNlZ21lbnRJbmRleCArIDEpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gV2hlbiBjb21pbmcgZnJvbSBhIGRlZmF1bHQgbGFuZ3VhZ2UgaXQncyBwb3NzaWJsZSB0aGF0IHRoZSB1cmwgZG9lc24ndCBjb250YWluIHRoZSBsYW5ndWFnZSwgbWFrZSBzdXJlIGl0IGRvZXMuXG4gICAgICAgICAgICBpZiAobGFuZ3VhZ2VTZWdtZW50SW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgIC8vIElmIHRoZSB1cmwgc3RhcnRzIHdpdGggYSBzbGFzaCBtYWtlIHN1cmUgdG8ga2VlcCBpdC5cbiAgICAgICAgICAgICAgY29uc3QgaW5qZWN0aW9uSW5kZXggPSB1cmxTZWdtZW50c1swXSA9PT0gJycgPyAxIDogMDtcbiAgICAgICAgICAgICAgdXJsU2VnbWVudHMgPSB1cmxTZWdtZW50cy5zbGljZSgwLCBpbmplY3Rpb25JbmRleCkuY29uY2F0KHRoaXMucGFyc2VyLmN1cnJlbnRMYW5nLCB1cmxTZWdtZW50cy5zbGljZShpbmplY3Rpb25JbmRleCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB1cmwgPSB1cmxTZWdtZW50cy5qb2luKCcvJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQcmV2ZW50IG11bHRpcGxlIFwiL1wiIGNoYXJhY3RlclxuICAgICAgICB1cmwgPSB1cmwucmVwbGFjZSgvXFwvKy9nLCAnLycpO1xuXG4gICAgICAgIGNvbnN0IGxhc3RTbGFzaEluZGV4ID0gdXJsLmxhc3RJbmRleE9mKCcvJyk7XG4gICAgICAgIGlmIChsYXN0U2xhc2hJbmRleCA+IDAgJiYgbGFzdFNsYXNoSW5kZXggPT09IHVybC5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgdXJsID0gdXJsLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHF1ZXJ5UGFyYW1zT2JqID0gdGhpcy5wYXJzZXIuY2hvb3NlUXVlcnlQYXJhbXMoZXh0cmFzLCB0aGlzLnJvdXRlLnNuYXBzaG90LnF1ZXJ5UGFyYW1zKTtcblxuICAgICAgICB0aGlzLmFwcGx5Q29uZmlnVG9Sb3V0ZXIodGhpcy5wYXJzZXIucm91dGVzKTtcblxuICAgICAgICB0aGlzLmxhc3RFeHRyYXMgPSBleHRyYXM7XG4gICAgICAgIGlmICh1c2VOYXZpZ2F0ZU1ldGhvZCkge1xuICAgICAgICAgIGNvbnN0IGV4dHJhc1RvQXBwbHk6IE5hdmlnYXRpb25FeHRyYXMgPSBleHRyYXMgPyB7Li4uZXh0cmFzfSA6IHt9O1xuICAgICAgICAgIGlmIChxdWVyeVBhcmFtc09iaikge1xuICAgICAgICAgICAgZXh0cmFzVG9BcHBseS5xdWVyeVBhcmFtcyA9IHF1ZXJ5UGFyYW1zT2JqO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbdXJsXSwgZXh0cmFzVG9BcHBseSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0IHF1ZXJ5UGFyYW1zID0gdGhpcy5wYXJzZXIuZm9ybWF0UXVlcnlQYXJhbXMocXVlcnlQYXJhbXNPYmopO1xuICAgICAgICAgIHF1ZXJ5UGFyYW1zID0gcXVlcnlQYXJhbXMgPyBgPyR7cXVlcnlQYXJhbXN9YCA6ICcnO1xuICAgICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlQnlVcmwoYCR7dXJsfSR7cXVlcnlQYXJhbXN9YCwgZXh0cmFzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyYXZlcnNlcyB0aHJvdWdoIHRoZSB0cmVlIHRvIGFzc2VtYmxlIG5ldyB0cmFuc2xhdGVkIHVybFxuICAgKi9cbiAgcHJpdmF0ZSB0cmF2ZXJzZVJvdXRlU25hcHNob3Qoc25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QpOiBzdHJpbmcge1xuICAgIGlmIChzbmFwc2hvdC5maXJzdENoaWxkICYmIHNuYXBzaG90LnJvdXRlQ29uZmlnKSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5wYXJzZVNlZ21lbnRWYWx1ZShzbmFwc2hvdCl9LyR7dGhpcy50cmF2ZXJzZVJvdXRlU25hcHNob3Qoc25hcHNob3QuZmlyc3RDaGlsZCl9YDtcbiAgICB9IGVsc2UgaWYgKHNuYXBzaG90LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHJldHVybiB0aGlzLnRyYXZlcnNlUm91dGVTbmFwc2hvdChzbmFwc2hvdC5maXJzdENoaWxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucGFyc2VTZWdtZW50VmFsdWUoc25hcHNob3QpO1xuICAgIH1cbiAgICAvKiBpZiAoc25hcHNob3QuZmlyc3RDaGlsZCAmJiBzbmFwc2hvdC5maXJzdENoaWxkLnJvdXRlQ29uZmlnICYmIHNuYXBzaG90LmZpcnN0Q2hpbGQucm91dGVDb25maWcucGF0aCkge1xuICAgICAgaWYgKHNuYXBzaG90LmZpcnN0Q2hpbGQucm91dGVDb25maWcucGF0aCAhPT0gJyoqJykge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZVNlZ21lbnRWYWx1ZShzbmFwc2hvdCkgKyAnLycgKyB0aGlzLnRyYXZlcnNlUm91dGVTbmFwc2hvdChzbmFwc2hvdC5maXJzdENoaWxkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlU2VnbWVudFZhbHVlKHNuYXBzaG90LmZpcnN0Q2hpbGQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wYXJzZVNlZ21lbnRWYWx1ZShzbmFwc2hvdCk7ICovXG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgVVJMIGZyb20gc2VnbWVudHMgYW5kIHNuYXBzaG90IChmb3IgcGFyYW1zKVxuICAgKi9cbiAgcHJpdmF0ZSBidWlsZFVybEZyb21TZWdtZW50cyhzbmFwc2hvdDogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgc2VnbWVudHM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgICByZXR1cm4gc2VnbWVudHMubWFwKChzOiBzdHJpbmcsIGk6IG51bWJlcikgPT4gcy5pbmRleE9mKCc6JykgPT09IDAgPyBzbmFwc2hvdC51cmxbaV0ucGF0aCA6IHMpLmpvaW4oJy8nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHRyYWN0cyBuZXcgc2VnbWVudCB2YWx1ZSBiYXNlZCBvbiByb3V0ZUNvbmZpZyBhbmQgdXJsXG4gICAqL1xuICBwcml2YXRlIHBhcnNlU2VnbWVudFZhbHVlKHNuYXBzaG90OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KTogc3RyaW5nIHtcbiAgICBpZiAoc25hcHNob3Qucm91dGVDb25maWcgJiYgc25hcHNob3Qucm91dGVDb25maWcubWF0Y2hlcikge1xuICAgICAgY29uc3Qgc3ViUGF0aE1hdGNoZWRTZWdtZW50cyA9IHRoaXMucGFyc2VTZWdtZW50VmFsdWVNYXRjaGVyKHNuYXBzaG90KTtcbiAgICAgIHJldHVybiB0aGlzLmJ1aWxkVXJsRnJvbVNlZ21lbnRzKHNuYXBzaG90LCBzdWJQYXRoTWF0Y2hlZFNlZ21lbnRzKTtcbiAgICB9IGVsc2UgaWYgKHNuYXBzaG90LmRhdGEubG9jYWxpemVSb3V0ZXIpIHtcbiAgICAgIGNvbnN0IHBhdGggPSBzbmFwc2hvdC5kYXRhLmxvY2FsaXplUm91dGVyLnBhdGg7XG4gICAgICBjb25zdCBzdWJQYXRoU2VnbWVudHMgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgICByZXR1cm4gdGhpcy5idWlsZFVybEZyb21TZWdtZW50cyhzbmFwc2hvdCwgc3ViUGF0aFNlZ21lbnRzKTtcbiAgICB9IGVsc2UgaWYgKHNuYXBzaG90LnBhcmVudCAmJiBzbmFwc2hvdC5wYXJlbnQucGFyZW50KSB7IC8vIE5vdCBsYW5nIHJvdXRlIGFuZCBubyBsb2NhbGl6ZVJvdXRlciBkYXRhID0gZXhjbHVkZWQgcGF0aFxuICAgICAgY29uc3QgcGF0aCA9IHNuYXBzaG90LnJvdXRlQ29uZmlnLnBhdGg7XG4gICAgICBjb25zdCBzdWJQYXRoU2VnbWVudHMgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgICByZXR1cm4gdGhpcy5idWlsZFVybEZyb21TZWdtZW50cyhzbmFwc2hvdCwgc3ViUGF0aFNlZ21lbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICAvKiBpZiAoc25hcHNob3Qucm91dGVDb25maWcpIHtcbiAgICAgIGlmIChzbmFwc2hvdC5yb3V0ZUNvbmZpZy5wYXRoID09PSAnKionKSB7XG4gICAgICAgIHJldHVybiBzbmFwc2hvdC51cmwuZmlsdGVyKChzZWdtZW50OiBVcmxTZWdtZW50KSA9PiBzZWdtZW50LnBhdGgpLm1hcCgoc2VnbWVudDogVXJsU2VnbWVudCkgPT4gc2VnbWVudC5wYXRoKS5qb2luKCcvJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBzdWJQYXRoU2VnbWVudHMgPSBzbmFwc2hvdC5yb3V0ZUNvbmZpZy5wYXRoLnNwbGl0KCcvJyk7XG4gICAgICAgIHJldHVybiBzdWJQYXRoU2VnbWVudHMubWFwKChzOiBzdHJpbmcsIGk6IG51bWJlcikgPT4gcy5pbmRleE9mKCc6JykgPT09IDAgPyBzbmFwc2hvdC51cmxbaV0ucGF0aCA6IHMpLmpvaW4oJy8nKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICcnOyAqL1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZVNlZ21lbnRWYWx1ZU1hdGNoZXIoc25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgbG9jYWxpemVNYXRjaGVyUGFyYW1zID0gc25hcHNob3QuZGF0YSAmJiBzbmFwc2hvdC5kYXRhLmxvY2FsaXplTWF0Y2hlciAmJiBzbmFwc2hvdC5kYXRhLmxvY2FsaXplTWF0Y2hlci5wYXJhbXMgfHwgeyB9O1xuICAgIGNvbnN0IHN1YlBhdGhTZWdtZW50czogc3RyaW5nW10gPSBzbmFwc2hvdC51cmxcbiAgICAgIC5tYXAoKHNlZ21lbnQ6IExvY2FsaXplZE1hdGNoZXJVcmxTZWdtZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRQYXRoID0gc2VnbWVudC5wYXRoO1xuICAgICAgICBjb25zdCBtYXRjaGVkUGFyYW1OYW1lID0gc2VnbWVudC5sb2NhbGl6ZWRQYXJhbU5hbWU7XG4gICAgICAgIGNvbnN0IHZhbCA9IChtYXRjaGVkUGFyYW1OYW1lICYmIGxvY2FsaXplTWF0Y2hlclBhcmFtc1ttYXRjaGVkUGFyYW1OYW1lXSkgP1xuICAgICAgICAgIGxvY2FsaXplTWF0Y2hlclBhcmFtc1ttYXRjaGVkUGFyYW1OYW1lXShjdXJyZW50UGF0aCkgOiBudWxsO1xuICAgICAgICByZXR1cm4gdmFsIHx8IGAke3RoaXMucGFyc2VyLmdldEVzY2FwZVByZWZpeCgpfSR7Y3VycmVudFBhdGh9YDtcbiAgICAgIH0pO1xuICAgIHJldHVybiBzdWJQYXRoU2VnbWVudHM7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNsYXRlIHJvdXRlIHRvIGN1cnJlbnQgbGFuZ3VhZ2VcbiAgICogSWYgbmV3IGxhbmd1YWdlIGlzIGV4cGxpY2l0bHkgcHJvdmlkZWQgdGhlbiByZXBsYWNlIGxhbmd1YWdlIHBhcnQgaW4gdXJsIHdpdGggbmV3IGxhbmd1YWdlXG4gICAqL1xuICB0cmFuc2xhdGVSb3V0ZShwYXRoOiBzdHJpbmcgfCBhbnlbXSk6IHN0cmluZyB8IGFueVtdIHtcbiAgICBpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCB1cmwgPSB0aGlzLnBhcnNlci50cmFuc2xhdGVSb3V0ZShwYXRoKTtcbiAgICAgIHJldHVybiAhcGF0aC5pbmRleE9mKCcvJykgPyB0aGlzLnBhcnNlci5hZGRQcmVmaXhUb1VybCh1cmwpIDogdXJsO1xuICAgIH1cbiAgICAvLyBpdCdzIGFuIGFycmF5XG4gICAgY29uc3QgcmVzdWx0OiBhbnlbXSA9IFtdO1xuICAgIChwYXRoIGFzIEFycmF5PGFueT4pLmZvckVhY2goKHNlZ21lbnQ6IGFueSwgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBzZWdtZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgICBjb25zdCByZXMgPSB0aGlzLnBhcnNlci50cmFuc2xhdGVSb3V0ZShzZWdtZW50KTtcbiAgICAgICAgaWYgKCFpbmRleCAmJiAhc2VnbWVudC5pbmRleE9mKCcvJykpIHtcbiAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLnBhcnNlci5hZGRQcmVmaXhUb1VybChyZXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHQucHVzaChyZXMpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQucHVzaChzZWdtZW50KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIEV2ZW50IGhhbmRsZXIgdG8gcmVhY3Qgb24gcm91dGUgY2hhbmdlXG4gICAqL1xuICBwcml2YXRlIF9yb3V0ZUNoYW5nZWQoKTogKGV2ZW50UGFpcjogW05hdmlnYXRpb25TdGFydCwgTmF2aWdhdGlvblN0YXJ0XSkgPT4gdm9pZCB7XG4gICAgcmV0dXJuIChbcHJldmlvdXNFdmVudCwgY3VycmVudEV2ZW50XTogW05hdmlnYXRpb25TdGFydCwgTmF2aWdhdGlvblN0YXJ0XSkgPT4ge1xuICAgICAgY29uc3QgcHJldmlvdXNMYW5nID0gdGhpcy5wYXJzZXIuZ2V0TG9jYXRpb25MYW5nKHByZXZpb3VzRXZlbnQudXJsKSB8fCB0aGlzLnBhcnNlci5kZWZhdWx0TGFuZztcbiAgICAgIGNvbnN0IGN1cnJlbnRMYW5nID0gdGhpcy5wYXJzZXIuZ2V0TG9jYXRpb25MYW5nKGN1cnJlbnRFdmVudC51cmwpIHx8IHRoaXMucGFyc2VyLmRlZmF1bHRMYW5nO1xuICAgICAgY29uc3QgbGFzdEV4dHJhcyA9IHRoaXMubGFzdEV4dHJhcztcblxuICAgICAgaWYgKGN1cnJlbnRMYW5nICE9PSBwcmV2aW91c0xhbmcgJiYgdGhpcy5sYXRlc3RVcmwgIT09IGN1cnJlbnRFdmVudC51cmwpIHtcbiAgICAgICAgdGhpcy5sYXRlc3RVcmwgPSBjdXJyZW50RXZlbnQudXJsO1xuICAgICAgICB0aGlzLmNhbmNlbEN1cnJlbnROYXZpZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMucGFyc2VyLnRyYW5zbGF0ZVJvdXRlcyhjdXJyZW50TGFuZylcbiAgICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgIC8vIFJlc2V0IHJvdXRlcyBhZ2FpbiBvbmNlIHRoZXkgYXJlIGFsbCB0cmFuc2xhdGVkXG4gICAgICAgICAgICB0aGlzLmFwcGx5Q29uZmlnVG9Sb3V0ZXIodGhpcy5wYXJzZXIucm91dGVzKTtcbiAgICAgICAgICAgIC8vIENsZWFyIGdsb2JhbCBleHRyYXNcbiAgICAgICAgICAgIHRoaXMubGFzdEV4dHJhcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIC8vIEluaXQgbmV3IG5hdmlnYXRpb24gd2l0aCBzYW1lIHVybCB0byB0YWtlIG5ldyBjb25maWcgaW4gY29uc2lkZXJhdGlvblxuICAgICAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGVCeVVybChjdXJyZW50RXZlbnQudXJsLCBsYXN0RXh0cmFzKTtcbiAgICAgICAgICAgIC8vIEZpcmUgcm91dGUgY2hhbmdlIGV2ZW50XG4gICAgICAgICAgICB0aGlzLnJvdXRlckV2ZW50cy5uZXh0KGN1cnJlbnRMYW5nKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMubGF0ZXN0VXJsID0gY3VycmVudEV2ZW50LnVybDtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIERyb3AgdGhlIGN1cnJlbnQgTmF2aWdhdGlvblxuICAgKi9cbiAgcHJpdmF0ZSBjYW5jZWxDdXJyZW50TmF2aWdhdGlvbigpIHtcbiAgICBjb25zdCBjdXJyZW50TmF2aWdhdGlvbiA9IHRoaXMucm91dGVyLmdldEN1cnJlbnROYXZpZ2F0aW9uKCk7XG4gICAgY29uc3QgdXJsID0gdGhpcy5yb3V0ZXIuc2VyaWFsaXplVXJsKGN1cnJlbnROYXZpZ2F0aW9uLmV4dHJhY3RlZFVybCk7XG4gICAgKHRoaXMucm91dGVyLmV2ZW50cyBhcyBTdWJqZWN0PEV2ZW50PikubmV4dChuZXcgTmF2aWdhdGlvbkNhbmNlbChjdXJyZW50TmF2aWdhdGlvbi5pZCwgdXJsLCAnJykpO1xuICAgICh0aGlzLnJvdXRlciBhcyBhbnkpLnRyYW5zaXRpb25zLm5leHQoey4uLih0aGlzLnJvdXRlciBhcyBhbnkpLnRyYW5zaXRpb25zLmdldFZhbHVlKCksIGlkOiAwfSk7XG4gIH1cblxuICAvKipcbiAgICogQXBwbHkgY29uZmlnIHRvIEFuZ3VsYXIgUm91dGVyTW9kdWxlXG4gICAqIEBwYXJhbSBjb25maWcgcm91dGVzIHRvIGFwcGx5XG4gICAqL1xuICBwcml2YXRlIGFwcGx5Q29uZmlnVG9Sb3V0ZXIoY29uZmlnOiBSb3V0ZXMpIHtcbiAgICB0aGlzLnJvdXRlci5yZXNldENvbmZpZyhkZWVwQ29weShjb25maWcpKTtcbiAgfVxuXG59XG4iXX0=
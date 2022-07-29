import { NgModule, APP_INITIALIZER, Optional, SkipSelf, Injectable, Injector, ApplicationRef, Compiler } from '@angular/core';
import { LocalizeRouterService } from './localize-router.service';
import { DummyLocalizeParser, LocalizeParser } from './localize-router.parser';
import { RouterModule, RouteReuseStrategy, Router, UrlSerializer, ChildrenOutletContexts, ROUTES, ROUTER_CONFIGURATION, UrlHandlingStrategy } from '@angular/router';
import { LocalizeRouterPipe } from './localize-router.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule, Location } from '@angular/common';
import { ALWAYS_SET_PREFIX, CACHE_MECHANISM, CACHE_NAME, DEFAULT_LANG_FUNCTION, LOCALIZE_ROUTER_FORROOT_GUARD, LocalizeRouterSettings, RAW_ROUTES, USE_CACHED_LANG, COOKIE_FORMAT, INITIAL_NAVIGATION } from './localize-router.config';
import { GilsdavReuseStrategy } from './gilsdav-reuse-strategy';
import { setupRouter } from './localized-router';
import { deepCopy } from './util';
import * as i0 from "@angular/core";
export class ParserInitializer {
    /**
     * CTOR
     */
    constructor(injector) {
        this.injector = injector;
    }
    appInitializer() {
        const res = this.parser.load(this.routes);
        return res.then(() => {
            const localize = this.injector.get(LocalizeRouterService);
            const router = this.injector.get(Router);
            const settings = this.injector.get(LocalizeRouterSettings);
            localize.init();
            if (settings.initialNavigation) {
                return new Promise(resolve => {
                    // @ts-ignore
                    const oldAfterPreactivation = router.afterPreactivation;
                    let firstInit = true;
                    // @ts-ignore
                    router.afterPreactivation = () => {
                        if (firstInit) {
                            resolve();
                            firstInit = false;
                            localize.hooks._initializedSubject.next(true);
                            localize.hooks._initializedSubject.complete();
                        }
                        return oldAfterPreactivation();
                    };
                });
            }
            else {
                localize.hooks._initializedSubject.next(true);
                localize.hooks._initializedSubject.complete();
            }
        });
    }
    generateInitializer(parser, routes) {
        this.parser = parser;
        this.routes = routes.reduce((a, b) => a.concat(b));
        return this.appInitializer;
    }
}
ParserInitializer.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0", ngImport: i0, type: ParserInitializer, deps: [{ token: i0.Injector }], target: i0.ɵɵFactoryTarget.Injectable });
ParserInitializer.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.1.0", ngImport: i0, type: ParserInitializer });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0", ngImport: i0, type: ParserInitializer, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.Injector }]; } });
export function getAppInitializer(p, parser, routes) {
    // DeepCopy needed to prevent RAW_ROUTES mutation
    const routesCopy = deepCopy(routes);
    return p.generateInitializer(parser, routesCopy).bind(p);
}
export class LocalizeRouterModule {
    static forRoot(routes, config = {}) {
        return {
            ngModule: LocalizeRouterModule,
            providers: [
                {
                    provide: Router,
                    useFactory: setupRouter,
                    deps: [
                        ApplicationRef,
                        UrlSerializer,
                        ChildrenOutletContexts,
                        Location,
                        Injector,
                        Compiler,
                        ROUTES,
                        LocalizeParser,
                        ROUTER_CONFIGURATION,
                        [UrlHandlingStrategy, new Optional()],
                        [RouteReuseStrategy, new Optional()]
                    ]
                },
                {
                    provide: LOCALIZE_ROUTER_FORROOT_GUARD,
                    useFactory: provideForRootGuard,
                    deps: [[LocalizeRouterModule, new Optional(), new SkipSelf()]]
                },
                { provide: USE_CACHED_LANG, useValue: config.useCachedLang },
                { provide: ALWAYS_SET_PREFIX, useValue: config.alwaysSetPrefix },
                { provide: CACHE_NAME, useValue: config.cacheName },
                { provide: CACHE_MECHANISM, useValue: config.cacheMechanism },
                { provide: DEFAULT_LANG_FUNCTION, useValue: config.defaultLangFunction },
                { provide: COOKIE_FORMAT, useValue: config.cookieFormat },
                { provide: INITIAL_NAVIGATION, useValue: config.initialNavigation },
                LocalizeRouterSettings,
                config.parser || { provide: LocalizeParser, useClass: DummyLocalizeParser },
                {
                    provide: RAW_ROUTES,
                    multi: true,
                    useValue: routes
                },
                LocalizeRouterService,
                ParserInitializer,
                {
                    provide: APP_INITIALIZER,
                    multi: true,
                    useFactory: getAppInitializer,
                    deps: [ParserInitializer, LocalizeParser, RAW_ROUTES]
                },
                {
                    provide: RouteReuseStrategy,
                    useClass: GilsdavReuseStrategy
                }
            ]
        };
    }
    static forChild(routes) {
        return {
            ngModule: LocalizeRouterModule,
            providers: [
                {
                    provide: RAW_ROUTES,
                    multi: true,
                    useValue: routes
                }
            ]
        };
    }
}
LocalizeRouterModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0", ngImport: i0, type: LocalizeRouterModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
LocalizeRouterModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.1.0", ngImport: i0, type: LocalizeRouterModule, declarations: [LocalizeRouterPipe], imports: [CommonModule, RouterModule, TranslateModule], exports: [LocalizeRouterPipe] });
LocalizeRouterModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.1.0", ngImport: i0, type: LocalizeRouterModule, imports: [CommonModule, RouterModule, TranslateModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0", ngImport: i0, type: LocalizeRouterModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, RouterModule, TranslateModule],
                    declarations: [LocalizeRouterPipe],
                    exports: [LocalizeRouterPipe]
                }]
        }] });
export function provideForRootGuard(localizeRouterModule) {
    if (localizeRouterModule) {
        throw new Error(`LocalizeRouterModule.forRoot() called twice. Lazy loaded modules should use LocalizeRouterModule.forChild() instead.`);
    }
    return 'guarded';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemUtcm91dGVyLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC10cmFuc2xhdGUtcm91dGVyL3NyYy9saWIvbG9jYWxpemUtcm91dGVyLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsUUFBUSxFQUF1QixlQUFlLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFDbEUsVUFBVSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUMvQyxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsY0FBYyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDL0UsT0FBTyxFQUFFLFlBQVksRUFBVSxrQkFBa0IsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLHNCQUFzQixFQUM5RixNQUFNLEVBQUUsb0JBQW9CLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUM3RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUM1RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDdEQsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN6RCxPQUFPLEVBQ0wsaUJBQWlCLEVBQ2pCLGVBQWUsRUFBRSxVQUFVLEVBQUUscUJBQXFCLEVBQUUsNkJBQTZCLEVBQzNELHNCQUFzQixFQUM1QyxVQUFVLEVBQ1YsZUFBZSxFQUNmLGFBQWEsRUFDYixrQkFBa0IsRUFDbkIsTUFBTSwwQkFBMEIsQ0FBQztBQUNsQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDakQsT0FBTyxF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QUFDbkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIE5nTW9kdWxlLCBNb2R1bGVXaXRoUHJvdmlkZXJzLCBBUFBfSU5JVElBTElaRVIsIE9wdGlvbmFsLCBTa2lwU2VsZixcbiAgSW5qZWN0YWJsZSwgSW5qZWN0b3IsIEFwcGxpY2F0aW9uUmVmLCBDb21waWxlclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IExvY2FsaXplUm91dGVyU2VydmljZSB9IGZyb20gJy4vbG9jYWxpemUtcm91dGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgRHVtbXlMb2NhbGl6ZVBhcnNlciwgTG9jYWxpemVQYXJzZXIgfSBmcm9tICcuL2xvY2FsaXplLXJvdXRlci5wYXJzZXInO1xuaW1wb3J0IHsgUm91dGVyTW9kdWxlLCBSb3V0ZXMsIFJvdXRlUmV1c2VTdHJhdGVneSwgUm91dGVyLCBVcmxTZXJpYWxpemVyLCBDaGlsZHJlbk91dGxldENvbnRleHRzLFxuICBST1VURVMsIFJPVVRFUl9DT05GSUdVUkFUSU9OLCBVcmxIYW5kbGluZ1N0cmF0ZWd5IH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IExvY2FsaXplUm91dGVyUGlwZSB9IGZyb20gJy4vbG9jYWxpemUtcm91dGVyLnBpcGUnO1xuaW1wb3J0IHsgVHJhbnNsYXRlTW9kdWxlIH0gZnJvbSAnQG5neC10cmFuc2xhdGUvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUsIExvY2F0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIEFMV0FZU19TRVRfUFJFRklYLFxuICBDQUNIRV9NRUNIQU5JU00sIENBQ0hFX05BTUUsIERFRkFVTFRfTEFOR19GVU5DVElPTiwgTE9DQUxJWkVfUk9VVEVSX0ZPUlJPT1RfR1VBUkQsXG4gIExvY2FsaXplUm91dGVyQ29uZmlnLCBMb2NhbGl6ZVJvdXRlclNldHRpbmdzLFxuICBSQVdfUk9VVEVTLFxuICBVU0VfQ0FDSEVEX0xBTkcsXG4gIENPT0tJRV9GT1JNQVQsXG4gIElOSVRJQUxfTkFWSUdBVElPTlxufSBmcm9tICcuL2xvY2FsaXplLXJvdXRlci5jb25maWcnO1xuaW1wb3J0IHsgR2lsc2RhdlJldXNlU3RyYXRlZ3kgfSBmcm9tICcuL2dpbHNkYXYtcmV1c2Utc3RyYXRlZ3knO1xuaW1wb3J0IHsgc2V0dXBSb3V0ZXIgfSBmcm9tICcuL2xvY2FsaXplZC1yb3V0ZXInO1xuaW1wb3J0IHsgZGVlcENvcHkgfSBmcm9tICcuL3V0aWwnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUGFyc2VySW5pdGlhbGl6ZXIge1xuICBwYXJzZXI6IExvY2FsaXplUGFyc2VyO1xuICByb3V0ZXM6IFJvdXRlcztcblxuICAvKipcbiAgICogQ1RPUlxuICAgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgfVxuXG4gIGFwcEluaXRpYWxpemVyKCk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgcmVzID0gdGhpcy5wYXJzZXIubG9hZCh0aGlzLnJvdXRlcyk7XG5cbiAgICByZXR1cm4gcmVzLnRoZW4oKCkgPT4ge1xuICAgICAgY29uc3QgbG9jYWxpemUgPSB0aGlzLmluamVjdG9yLmdldChMb2NhbGl6ZVJvdXRlclNlcnZpY2UpO1xuICAgICAgY29uc3Qgcm91dGVyID0gdGhpcy5pbmplY3Rvci5nZXQoUm91dGVyKTtcbiAgICAgIGNvbnN0IHNldHRpbmdzID0gdGhpcy5pbmplY3Rvci5nZXQoTG9jYWxpemVSb3V0ZXJTZXR0aW5ncyk7XG4gICAgICBsb2NhbGl6ZS5pbml0KCk7XG5cbiAgICAgIGlmIChzZXR0aW5ncy5pbml0aWFsTmF2aWdhdGlvbikge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgIGNvbnN0IG9sZEFmdGVyUHJlYWN0aXZhdGlvbiA9IHJvdXRlci5hZnRlclByZWFjdGl2YXRpb247XG4gICAgICAgICAgbGV0IGZpcnN0SW5pdCA9IHRydWU7XG4gICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgIHJvdXRlci5hZnRlclByZWFjdGl2YXRpb24gPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmlyc3RJbml0KSB7XG4gICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgZmlyc3RJbml0ID0gZmFsc2U7XG4gICAgICAgICAgICAgIGxvY2FsaXplLmhvb2tzLl9pbml0aWFsaXplZFN1YmplY3QubmV4dCh0cnVlKTtcbiAgICAgICAgICAgICAgbG9jYWxpemUuaG9va3MuX2luaXRpYWxpemVkU3ViamVjdC5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG9sZEFmdGVyUHJlYWN0aXZhdGlvbigpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9jYWxpemUuaG9va3MuX2luaXRpYWxpemVkU3ViamVjdC5uZXh0KHRydWUpO1xuICAgICAgICBsb2NhbGl6ZS5ob29rcy5faW5pdGlhbGl6ZWRTdWJqZWN0LmNvbXBsZXRlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZW5lcmF0ZUluaXRpYWxpemVyKHBhcnNlcjogTG9jYWxpemVQYXJzZXIsIHJvdXRlczogUm91dGVzW10pOiAoKSA9PiBQcm9taXNlPGFueT4ge1xuICAgIHRoaXMucGFyc2VyID0gcGFyc2VyO1xuICAgIHRoaXMucm91dGVzID0gcm91dGVzLnJlZHVjZSgoYSwgYikgPT4gYS5jb25jYXQoYikpO1xuICAgIHJldHVybiB0aGlzLmFwcEluaXRpYWxpemVyO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBJbml0aWFsaXplcihwOiBQYXJzZXJJbml0aWFsaXplciwgcGFyc2VyOiBMb2NhbGl6ZVBhcnNlciwgcm91dGVzOiBSb3V0ZXNbXSk6IGFueSB7XG4gIC8vIERlZXBDb3B5IG5lZWRlZCB0byBwcmV2ZW50IFJBV19ST1VURVMgbXV0YXRpb25cbiAgY29uc3Qgcm91dGVzQ29weSA9IGRlZXBDb3B5KHJvdXRlcyk7XG4gIHJldHVybiBwLmdlbmVyYXRlSW5pdGlhbGl6ZXIocGFyc2VyLCByb3V0ZXNDb3B5KS5iaW5kKHApO1xufVxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLCBSb3V0ZXJNb2R1bGUsIFRyYW5zbGF0ZU1vZHVsZV0sXG4gIGRlY2xhcmF0aW9uczogW0xvY2FsaXplUm91dGVyUGlwZV0sXG4gIGV4cG9ydHM6IFtMb2NhbGl6ZVJvdXRlclBpcGVdXG59KVxuZXhwb3J0IGNsYXNzIExvY2FsaXplUm91dGVyTW9kdWxlIHtcblxuICBzdGF0aWMgZm9yUm9vdChyb3V0ZXM6IFJvdXRlcywgY29uZmlnOiBMb2NhbGl6ZVJvdXRlckNvbmZpZyA9IHt9KTogTW9kdWxlV2l0aFByb3ZpZGVyczxMb2NhbGl6ZVJvdXRlck1vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogTG9jYWxpemVSb3V0ZXJNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IFJvdXRlcixcbiAgICAgICAgICB1c2VGYWN0b3J5OiBzZXR1cFJvdXRlcixcbiAgICAgICAgICBkZXBzOiBbXG4gICAgICAgICAgICBBcHBsaWNhdGlvblJlZixcbiAgICAgICAgICAgIFVybFNlcmlhbGl6ZXIsXG4gICAgICAgICAgICBDaGlsZHJlbk91dGxldENvbnRleHRzLFxuICAgICAgICAgICAgTG9jYXRpb24sXG4gICAgICAgICAgICBJbmplY3RvcixcbiAgICAgICAgICAgIENvbXBpbGVyLFxuICAgICAgICAgICAgUk9VVEVTLFxuICAgICAgICAgICAgTG9jYWxpemVQYXJzZXIsXG4gICAgICAgICAgICBST1VURVJfQ09ORklHVVJBVElPTixcbiAgICAgICAgICAgIFtVcmxIYW5kbGluZ1N0cmF0ZWd5LCBuZXcgT3B0aW9uYWwoKV0sXG4gICAgICAgICAgICBbUm91dGVSZXVzZVN0cmF0ZWd5LCBuZXcgT3B0aW9uYWwoKV1cbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBMT0NBTElaRV9ST1VURVJfRk9SUk9PVF9HVUFSRCxcbiAgICAgICAgICB1c2VGYWN0b3J5OiBwcm92aWRlRm9yUm9vdEd1YXJkLFxuICAgICAgICAgIGRlcHM6IFtbTG9jYWxpemVSb3V0ZXJNb2R1bGUsIG5ldyBPcHRpb25hbCgpLCBuZXcgU2tpcFNlbGYoKV1dXG4gICAgICAgIH0sXG4gICAgICAgIHsgcHJvdmlkZTogVVNFX0NBQ0hFRF9MQU5HLCB1c2VWYWx1ZTogY29uZmlnLnVzZUNhY2hlZExhbmcgfSxcbiAgICAgICAgeyBwcm92aWRlOiBBTFdBWVNfU0VUX1BSRUZJWCwgdXNlVmFsdWU6IGNvbmZpZy5hbHdheXNTZXRQcmVmaXggfSxcbiAgICAgICAgeyBwcm92aWRlOiBDQUNIRV9OQU1FLCB1c2VWYWx1ZTogY29uZmlnLmNhY2hlTmFtZSB9LFxuICAgICAgICB7IHByb3ZpZGU6IENBQ0hFX01FQ0hBTklTTSwgdXNlVmFsdWU6IGNvbmZpZy5jYWNoZU1lY2hhbmlzbSB9LFxuICAgICAgICB7IHByb3ZpZGU6IERFRkFVTFRfTEFOR19GVU5DVElPTiwgdXNlVmFsdWU6IGNvbmZpZy5kZWZhdWx0TGFuZ0Z1bmN0aW9uIH0sXG4gICAgICAgIHsgcHJvdmlkZTogQ09PS0lFX0ZPUk1BVCwgdXNlVmFsdWU6IGNvbmZpZy5jb29raWVGb3JtYXQgfSxcbiAgICAgICAgeyBwcm92aWRlOiBJTklUSUFMX05BVklHQVRJT04sIHVzZVZhbHVlOiBjb25maWcuaW5pdGlhbE5hdmlnYXRpb24gfSxcbiAgICAgICAgTG9jYWxpemVSb3V0ZXJTZXR0aW5ncyxcbiAgICAgICAgY29uZmlnLnBhcnNlciB8fCB7IHByb3ZpZGU6IExvY2FsaXplUGFyc2VyLCB1c2VDbGFzczogRHVtbXlMb2NhbGl6ZVBhcnNlciB9LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogUkFXX1JPVVRFUyxcbiAgICAgICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgICAgICB1c2VWYWx1ZTogcm91dGVzXG4gICAgICAgIH0sXG4gICAgICAgIExvY2FsaXplUm91dGVyU2VydmljZSxcbiAgICAgICAgUGFyc2VySW5pdGlhbGl6ZXIsXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBBUFBfSU5JVElBTElaRVIsXG4gICAgICAgICAgbXVsdGk6IHRydWUsXG4gICAgICAgICAgdXNlRmFjdG9yeTogZ2V0QXBwSW5pdGlhbGl6ZXIsXG4gICAgICAgICAgZGVwczogW1BhcnNlckluaXRpYWxpemVyLCBMb2NhbGl6ZVBhcnNlciwgUkFXX1JPVVRFU11cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IFJvdXRlUmV1c2VTdHJhdGVneSxcbiAgICAgICAgICB1c2VDbGFzczogR2lsc2RhdlJldXNlU3RyYXRlZ3lcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZm9yQ2hpbGQocm91dGVzOiBSb3V0ZXMpOiBNb2R1bGVXaXRoUHJvdmlkZXJzPExvY2FsaXplUm91dGVyTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBMb2NhbGl6ZVJvdXRlck1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogUkFXX1JPVVRFUyxcbiAgICAgICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgICAgICB1c2VWYWx1ZTogcm91dGVzXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlRm9yUm9vdEd1YXJkKGxvY2FsaXplUm91dGVyTW9kdWxlOiBMb2NhbGl6ZVJvdXRlck1vZHVsZSk6IHN0cmluZyB7XG4gIGlmIChsb2NhbGl6ZVJvdXRlck1vZHVsZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBMb2NhbGl6ZVJvdXRlck1vZHVsZS5mb3JSb290KCkgY2FsbGVkIHR3aWNlLiBMYXp5IGxvYWRlZCBtb2R1bGVzIHNob3VsZCB1c2UgTG9jYWxpemVSb3V0ZXJNb2R1bGUuZm9yQ2hpbGQoKSBpbnN0ZWFkLmApO1xuICB9XG4gIHJldHVybiAnZ3VhcmRlZCc7XG59XG4iXX0=
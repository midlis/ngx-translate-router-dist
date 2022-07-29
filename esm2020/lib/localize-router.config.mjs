import { Inject, InjectionToken, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Guard to make sure we have single initialization of forRoot
 */
export const LOCALIZE_ROUTER_FORROOT_GUARD = new InjectionToken('LOCALIZE_ROUTER_FORROOT_GUARD');
/**
 * Static provider for keeping track of routes
 */
export const RAW_ROUTES = new InjectionToken('RAW_ROUTES');
/**
 * Type for Caching of default language
 */
// export type CacheMechanism = 'LocalStorage' | 'Cookie';
/**
 * Namespace for fail proof access of CacheMechanism
 */
export var CacheMechanism;
(function (CacheMechanism) {
    CacheMechanism["LocalStorage"] = "LocalStorage";
    CacheMechanism["SessionStorage"] = "SessionStorage";
    CacheMechanism["Cookie"] = "Cookie";
})(CacheMechanism || (CacheMechanism = {}));
/**
 * Boolean to indicate whether to use cached language value
 */
export const USE_CACHED_LANG = new InjectionToken('USE_CACHED_LANG');
/**
 * Cache mechanism type
 */
export const CACHE_MECHANISM = new InjectionToken('CACHE_MECHANISM');
/**
 * Cache name
 */
export const CACHE_NAME = new InjectionToken('CACHE_NAME');
/**
 * Cookie cache format
 */
export const COOKIE_FORMAT = new InjectionToken('COOKIE_FORMAT');
/**
 * Cookie cache format
 */
export const INITIAL_NAVIGATION = new InjectionToken('INITIAL_NAVIGATION');
/**
 * Function for calculating default language
 */
export const DEFAULT_LANG_FUNCTION = new InjectionToken('DEFAULT_LANG_FUNCTION');
/**
 * Boolean to indicate whether prefix should be set for single language scenarios
 */
export const ALWAYS_SET_PREFIX = new InjectionToken('ALWAYS_SET_PREFIX');
const LOCALIZE_CACHE_NAME = 'LOCALIZE_DEFAULT_LANGUAGE';
const DEFAULT_COOKIE_FORMAT = '{{value}};{{expires}}';
const DEFAULT_INITIAL_NAVIGATION = false;
export class LocalizeRouterSettings {
    /**
     * Settings for localize router
     */
    constructor(useCachedLang = true, alwaysSetPrefix = true, cacheMechanism = CacheMechanism.LocalStorage, cacheName = LOCALIZE_CACHE_NAME, defaultLangFunction = void 0, cookieFormat = DEFAULT_COOKIE_FORMAT, initialNavigation = DEFAULT_INITIAL_NAVIGATION) {
        this.useCachedLang = useCachedLang;
        this.alwaysSetPrefix = alwaysSetPrefix;
        this.cacheName = cacheName;
        this.cookieFormat = cookieFormat;
        this.initialNavigation = initialNavigation;
        this.cacheMechanism = cacheMechanism;
        this.defaultLangFunction = defaultLangFunction;
    }
}
LocalizeRouterSettings.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0", ngImport: i0, type: LocalizeRouterSettings, deps: [{ token: USE_CACHED_LANG }, { token: ALWAYS_SET_PREFIX }, { token: CACHE_MECHANISM }, { token: CACHE_NAME }, { token: DEFAULT_LANG_FUNCTION }, { token: COOKIE_FORMAT }, { token: INITIAL_NAVIGATION }], target: i0.ɵɵFactoryTarget.Injectable });
LocalizeRouterSettings.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.1.0", ngImport: i0, type: LocalizeRouterSettings });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0", ngImport: i0, type: LocalizeRouterSettings, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [USE_CACHED_LANG]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [ALWAYS_SET_PREFIX]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [CACHE_MECHANISM]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [CACHE_NAME]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DEFAULT_LANG_FUNCTION]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [COOKIE_FORMAT]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [INITIAL_NAVIGATION]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemUtcm91dGVyLmNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC10cmFuc2xhdGUtcm91dGVyL3NyYy9saWIvbG9jYWxpemUtcm91dGVyLmNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBWSxVQUFVLEVBQVksTUFBTSxlQUFlLENBQUM7O0FBSXZGOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sNkJBQTZCLEdBQUcsSUFBSSxjQUFjLENBQXVCLCtCQUErQixDQUFDLENBQUM7QUFFdkg7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxVQUFVLEdBQTZCLElBQUksY0FBYyxDQUFXLFlBQVksQ0FBQyxDQUFDO0FBRS9GOztHQUVHO0FBQ0gsMERBQTBEO0FBRTFEOztHQUVHO0FBQ0gsTUFBTSxDQUFOLElBQVksY0FJWDtBQUpELFdBQVksY0FBYztJQUN4QiwrQ0FBNkIsQ0FBQTtJQUM3QixtREFBaUMsQ0FBQTtJQUNqQyxtQ0FBaUIsQ0FBQTtBQUNuQixDQUFDLEVBSlcsY0FBYyxLQUFkLGNBQWMsUUFJekI7QUFFRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxJQUFJLGNBQWMsQ0FBVSxpQkFBaUIsQ0FBQyxDQUFDO0FBQzlFOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLElBQUksY0FBYyxDQUFpQixpQkFBaUIsQ0FBQyxDQUFDO0FBQ3JGOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFHLElBQUksY0FBYyxDQUFTLFlBQVksQ0FBQyxDQUFDO0FBQ25FOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLElBQUksY0FBYyxDQUFVLGVBQWUsQ0FBQyxDQUFDO0FBQzFFOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxjQUFjLENBQVUsb0JBQW9CLENBQUMsQ0FBQztBQVFwRjs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLElBQUksY0FBYyxDQUEwQix1QkFBdUIsQ0FBQyxDQUFDO0FBRTFHOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxjQUFjLENBQVUsbUJBQW1CLENBQUMsQ0FBQztBQWdCbEYsTUFBTSxtQkFBbUIsR0FBRywyQkFBMkIsQ0FBQztBQUN4RCxNQUFNLHFCQUFxQixHQUFHLHVCQUF1QixDQUFDO0FBQ3RELE1BQU0sMEJBQTBCLEdBQUcsS0FBSyxDQUFDO0FBR3pDLE1BQU0sT0FBTyxzQkFBc0I7SUFLakM7O09BRUc7SUFDSCxZQUNrQyxnQkFBeUIsSUFBSSxFQUMzQixrQkFBMkIsSUFBSSxFQUN4QyxjQUFjLEdBQUcsY0FBYyxDQUFDLFlBQVksRUFDMUMsWUFBb0IsbUJBQW1CLEVBQ25DLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxFQUM3QixlQUF1QixxQkFBcUIsRUFDdkMsb0JBQTZCLDBCQUEwQjtRQU4xRCxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7UUFDM0Isb0JBQWUsR0FBZixlQUFlLENBQWdCO1FBRXRDLGNBQVMsR0FBVCxTQUFTLENBQThCO1FBRXBDLGlCQUFZLEdBQVosWUFBWSxDQUFnQztRQUN2QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQXNDO1FBRTFGLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQztJQUNqRCxDQUFDOzttSEFuQlUsc0JBQXNCLGtCQVN2QixlQUFlLGFBQ2YsaUJBQWlCLGFBQ2pCLGVBQWUsYUFDZixVQUFVLGFBQ1YscUJBQXFCLGFBQ3JCLGFBQWEsYUFDYixrQkFBa0I7dUhBZmpCLHNCQUFzQjsyRkFBdEIsc0JBQXNCO2tCQURsQyxVQUFVOzswQkFVTixNQUFNOzJCQUFDLGVBQWU7OzBCQUN0QixNQUFNOzJCQUFDLGlCQUFpQjs7MEJBQ3hCLE1BQU07MkJBQUMsZUFBZTs7MEJBQ3RCLE1BQU07MkJBQUMsVUFBVTs7MEJBQ2pCLE1BQU07MkJBQUMscUJBQXFCOzswQkFDNUIsTUFBTTsyQkFBQyxhQUFhOzswQkFDcEIsTUFBTTsyQkFBQyxrQkFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3QsIEluamVjdGlvblRva2VuLCBQcm92aWRlciwgSW5qZWN0YWJsZSwgT3B0aW9uYWwgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJvdXRlcyB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBMb2NhbGl6ZVJvdXRlck1vZHVsZSB9IGZyb20gJy4vbG9jYWxpemUtcm91dGVyLm1vZHVsZSc7XG5cbi8qKlxuICogR3VhcmQgdG8gbWFrZSBzdXJlIHdlIGhhdmUgc2luZ2xlIGluaXRpYWxpemF0aW9uIG9mIGZvclJvb3RcbiAqL1xuZXhwb3J0IGNvbnN0IExPQ0FMSVpFX1JPVVRFUl9GT1JST09UX0dVQVJEID0gbmV3IEluamVjdGlvblRva2VuPExvY2FsaXplUm91dGVyTW9kdWxlPignTE9DQUxJWkVfUk9VVEVSX0ZPUlJPT1RfR1VBUkQnKTtcblxuLyoqXG4gKiBTdGF0aWMgcHJvdmlkZXIgZm9yIGtlZXBpbmcgdHJhY2sgb2Ygcm91dGVzXG4gKi9cbmV4cG9ydCBjb25zdCBSQVdfUk9VVEVTOiBJbmplY3Rpb25Ub2tlbjxSb3V0ZXNbXT4gPSBuZXcgSW5qZWN0aW9uVG9rZW48Um91dGVzW10+KCdSQVdfUk9VVEVTJyk7XG5cbi8qKlxuICogVHlwZSBmb3IgQ2FjaGluZyBvZiBkZWZhdWx0IGxhbmd1YWdlXG4gKi9cbi8vIGV4cG9ydCB0eXBlIENhY2hlTWVjaGFuaXNtID0gJ0xvY2FsU3RvcmFnZScgfCAnQ29va2llJztcblxuLyoqXG4gKiBOYW1lc3BhY2UgZm9yIGZhaWwgcHJvb2YgYWNjZXNzIG9mIENhY2hlTWVjaGFuaXNtXG4gKi9cbmV4cG9ydCBlbnVtIENhY2hlTWVjaGFuaXNtIHtcbiAgTG9jYWxTdG9yYWdlID0gJ0xvY2FsU3RvcmFnZScsXG4gIFNlc3Npb25TdG9yYWdlID0gJ1Nlc3Npb25TdG9yYWdlJyxcbiAgQ29va2llID0gJ0Nvb2tpZSdcbn1cblxuLyoqXG4gKiBCb29sZWFuIHRvIGluZGljYXRlIHdoZXRoZXIgdG8gdXNlIGNhY2hlZCBsYW5ndWFnZSB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgVVNFX0NBQ0hFRF9MQU5HID0gbmV3IEluamVjdGlvblRva2VuPGJvb2xlYW4+KCdVU0VfQ0FDSEVEX0xBTkcnKTtcbi8qKlxuICogQ2FjaGUgbWVjaGFuaXNtIHR5cGVcbiAqL1xuZXhwb3J0IGNvbnN0IENBQ0hFX01FQ0hBTklTTSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxDYWNoZU1lY2hhbmlzbT4oJ0NBQ0hFX01FQ0hBTklTTScpO1xuLyoqXG4gKiBDYWNoZSBuYW1lXG4gKi9cbmV4cG9ydCBjb25zdCBDQUNIRV9OQU1FID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4oJ0NBQ0hFX05BTUUnKTtcbi8qKlxuICogQ29va2llIGNhY2hlIGZvcm1hdFxuICovXG5leHBvcnQgY29uc3QgQ09PS0lFX0ZPUk1BVCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxib29sZWFuPignQ09PS0lFX0ZPUk1BVCcpO1xuLyoqXG4gKiBDb29raWUgY2FjaGUgZm9ybWF0XG4gKi9cbmV4cG9ydCBjb25zdCBJTklUSUFMX05BVklHQVRJT04gPSBuZXcgSW5qZWN0aW9uVG9rZW48Ym9vbGVhbj4oJ0lOSVRJQUxfTkFWSUdBVElPTicpO1xuXG4vKipcbiAqIFR5cGUgZm9yIGRlZmF1bHQgbGFuZ3VhZ2UgZnVuY3Rpb25cbiAqIFVzZWQgdG8gb3ZlcnJpZGUgYmFzaWMgYmVoYXZpb3VyXG4gKi9cbmV4cG9ydCB0eXBlIERlZmF1bHRMYW5ndWFnZUZ1bmN0aW9uID0gKGxhbmd1YWdlczogc3RyaW5nW10sIGNhY2hlZExhbmc/OiBzdHJpbmcsIGJyb3dzZXJMYW5nPzogc3RyaW5nKSA9PiBzdHJpbmc7XG5cbi8qKlxuICogRnVuY3Rpb24gZm9yIGNhbGN1bGF0aW5nIGRlZmF1bHQgbGFuZ3VhZ2VcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfTEFOR19GVU5DVElPTiA9IG5ldyBJbmplY3Rpb25Ub2tlbjxEZWZhdWx0TGFuZ3VhZ2VGdW5jdGlvbj4oJ0RFRkFVTFRfTEFOR19GVU5DVElPTicpO1xuXG4vKipcbiAqIEJvb2xlYW4gdG8gaW5kaWNhdGUgd2hldGhlciBwcmVmaXggc2hvdWxkIGJlIHNldCBmb3Igc2luZ2xlIGxhbmd1YWdlIHNjZW5hcmlvc1xuICovXG5leHBvcnQgY29uc3QgQUxXQVlTX1NFVF9QUkVGSVggPSBuZXcgSW5qZWN0aW9uVG9rZW48Ym9vbGVhbj4oJ0FMV0FZU19TRVRfUFJFRklYJyk7XG5cbi8qKlxuICogQ29uZmlnIGludGVyZmFjZSBmb3IgTG9jYWxpemVSb3V0ZXJcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhbGl6ZVJvdXRlckNvbmZpZyB7XG4gIHBhcnNlcj86IFByb3ZpZGVyO1xuICB1c2VDYWNoZWRMYW5nPzogYm9vbGVhbjtcbiAgY2FjaGVNZWNoYW5pc20/OiBDYWNoZU1lY2hhbmlzbTtcbiAgY2FjaGVOYW1lPzogc3RyaW5nO1xuICBkZWZhdWx0TGFuZ0Z1bmN0aW9uPzogRGVmYXVsdExhbmd1YWdlRnVuY3Rpb247XG4gIGFsd2F5c1NldFByZWZpeD86IGJvb2xlYW47XG4gIGNvb2tpZUZvcm1hdD86IHN0cmluZztcbiAgaW5pdGlhbE5hdmlnYXRpb24/OiBib29sZWFuO1xufVxuXG5jb25zdCBMT0NBTElaRV9DQUNIRV9OQU1FID0gJ0xPQ0FMSVpFX0RFRkFVTFRfTEFOR1VBR0UnO1xuY29uc3QgREVGQVVMVF9DT09LSUVfRk9STUFUID0gJ3t7dmFsdWV9fTt7e2V4cGlyZXN9fSc7XG5jb25zdCBERUZBVUxUX0lOSVRJQUxfTkFWSUdBVElPTiA9IGZhbHNlO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTG9jYWxpemVSb3V0ZXJTZXR0aW5ncyBpbXBsZW1lbnRzIExvY2FsaXplUm91dGVyQ29uZmlnIHtcblxuICBwdWJsaWMgY2FjaGVNZWNoYW5pc206IENhY2hlTWVjaGFuaXNtO1xuICBwdWJsaWMgZGVmYXVsdExhbmdGdW5jdGlvbjogRGVmYXVsdExhbmd1YWdlRnVuY3Rpb247XG5cbiAgLyoqXG4gICAqIFNldHRpbmdzIGZvciBsb2NhbGl6ZSByb3V0ZXJcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoVVNFX0NBQ0hFRF9MQU5HKSBwdWJsaWMgdXNlQ2FjaGVkTGFuZzogYm9vbGVhbiA9IHRydWUsXG4gICAgQEluamVjdChBTFdBWVNfU0VUX1BSRUZJWCkgcHVibGljIGFsd2F5c1NldFByZWZpeDogYm9vbGVhbiA9IHRydWUsXG4gICAgQEluamVjdChDQUNIRV9NRUNIQU5JU00pIGNhY2hlTWVjaGFuaXNtID0gQ2FjaGVNZWNoYW5pc20uTG9jYWxTdG9yYWdlLFxuICAgIEBJbmplY3QoQ0FDSEVfTkFNRSkgcHVibGljIGNhY2hlTmFtZTogc3RyaW5nID0gTE9DQUxJWkVfQ0FDSEVfTkFNRSxcbiAgICBASW5qZWN0KERFRkFVTFRfTEFOR19GVU5DVElPTikgZGVmYXVsdExhbmdGdW5jdGlvbiA9IHZvaWQgMCxcbiAgICBASW5qZWN0KENPT0tJRV9GT1JNQVQpIHB1YmxpYyBjb29raWVGb3JtYXQ6IHN0cmluZyA9IERFRkFVTFRfQ09PS0lFX0ZPUk1BVCxcbiAgICBASW5qZWN0KElOSVRJQUxfTkFWSUdBVElPTikgcHVibGljIGluaXRpYWxOYXZpZ2F0aW9uOiBib29sZWFuID0gREVGQVVMVF9JTklUSUFMX05BVklHQVRJT04sXG4gICkge1xuICAgIHRoaXMuY2FjaGVNZWNoYW5pc20gPSBjYWNoZU1lY2hhbmlzbTtcbiAgICB0aGlzLmRlZmF1bHRMYW5nRnVuY3Rpb24gPSBkZWZhdWx0TGFuZ0Z1bmN0aW9uO1xuICB9XG5cbn1cbiJdfQ==
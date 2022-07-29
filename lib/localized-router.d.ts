import { Router, UrlSerializer, ChildrenOutletContexts, Routes, Route, ExtraOptions, UrlHandlingStrategy, RouteReuseStrategy } from '@angular/router';
import { Type, Injector, Compiler, ApplicationRef, NgModuleFactory } from '@angular/core';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { LocalizeParser } from './localize-router.parser';
export declare class LocalizedRouter extends Router {
    config: Routes;
    constructor(_rootComponentType: Type<any> | null, _urlSerializer: UrlSerializer, _rootContexts: ChildrenOutletContexts, _location: Location, injector: Injector, compiler: Compiler, config: Routes, localize: LocalizeParser);
}
export declare function setupRouter(ref: ApplicationRef, urlSerializer: UrlSerializer, contexts: ChildrenOutletContexts, location: Location, injector: Injector, compiler: Compiler, config: Route[][], localize: LocalizeParser, opts?: ExtraOptions, urlHandlingStrategy?: UrlHandlingStrategy, routeReuseStrategy?: RouteReuseStrategy): LocalizedRouter;
export declare function wrapIntoObservable<T>(value: T | NgModuleFactory<T> | Promise<T> | Observable<T>): Observable<T | NgModuleFactory<T>>;

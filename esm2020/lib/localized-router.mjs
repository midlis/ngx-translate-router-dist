import { Router, ROUTES } from '@angular/router';
import { NgModuleFactory, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { from, of, isObservable } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { flatten, isPromise } from './util';
export class LocalizedRouter extends Router {
    constructor(_rootComponentType, _urlSerializer, _rootContexts, _location, injector, compiler, config, localize) {
        super(_rootComponentType, _urlSerializer, _rootContexts, _location, injector, compiler, config);
        this.config = config;
        // Custom configuration
        const platformId = injector.get(PLATFORM_ID);
        const isBrowser = isPlatformBrowser(platformId);
        // __proto__ is needed for preloaded modules be doesn't work with SSR
        // @ts-ignore
        const configLoader = (isBrowser ? this.configLoader.__proto__ : this.configLoader);
        configLoader.loadModuleFactoryOrRoutes = (loadChildren) => {
            return wrapIntoObservable(loadChildren()).pipe(mergeMap((t) => {
                let compiled;
                if (t instanceof NgModuleFactory || Array.isArray(t)) {
                    compiled = of(t);
                }
                else {
                    compiled = from(compiler.compileModuleAsync(t));
                }
                return compiled.pipe(map(factory => {
                    if (Array.isArray(factory)) {
                        return factory;
                    }
                    return {
                        moduleType: factory.moduleType,
                        create: (parentInjector) => {
                            const module = factory.create(parentInjector);
                            const getMethod = module.injector.get.bind(module.injector);
                            module.injector['get'] = (token, notFoundValue) => {
                                const getResult = getMethod(token, notFoundValue);
                                if (token === ROUTES) {
                                    // translate lazy routes
                                    return localize.initChildRoutes([].concat(...getResult));
                                }
                                else {
                                    return getResult;
                                }
                            };
                            return module;
                        }
                    };
                }));
            }));
        };
        // (this as any).navigations = (this as any).setupNavigations((this as any).transitions);
    }
}
export function setupRouter(ref, urlSerializer, contexts, location, injector, compiler, config, localize, opts = {}, urlHandlingStrategy, routeReuseStrategy) {
    const router = new LocalizedRouter(null, urlSerializer, contexts, location, injector, compiler, flatten(config), localize);
    if (urlHandlingStrategy) {
        router.urlHandlingStrategy = urlHandlingStrategy;
    }
    if (routeReuseStrategy) {
        router.routeReuseStrategy = routeReuseStrategy;
    }
    if (opts.errorHandler) {
        router.errorHandler = opts.errorHandler;
    }
    if (opts.malformedUriErrorHandler) {
        router.malformedUriErrorHandler = opts.malformedUriErrorHandler;
    }
    if (opts.enableTracing) {
        router.events.subscribe((e) => {
            console.group(`Router Event: ${e.constructor.name}`);
            console.log(e.toString());
            console.log(e);
            console.groupEnd();
        });
    }
    if (opts.onSameUrlNavigation) {
        router.onSameUrlNavigation = opts.onSameUrlNavigation;
    }
    if (opts.paramsInheritanceStrategy) {
        router.paramsInheritanceStrategy = opts.paramsInheritanceStrategy;
    }
    if (opts.urlUpdateStrategy) {
        router.urlUpdateStrategy = opts.urlUpdateStrategy;
    }
    if (opts.relativeLinkResolution) {
        router.relativeLinkResolution = opts.relativeLinkResolution;
    }
    return router;
}
export function wrapIntoObservable(value) {
    if (isObservable(value)) {
        return value;
    }
    if (isPromise(value)) {
        // Use `Promise.resolve()` to wrap promise-like instances.
        // Required ie when a Resolver returns a AngularJS `$q` promise to correctly trigger the
        // change detection.
        return from(Promise.resolve(value));
    }
    return of(value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemVkLXJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC10cmFuc2xhdGUtcm91dGVyL3NyYy9saWIvbG9jYWxpemVkLXJvdXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsTUFBTSxFQUNtRixNQUFNLEVBQ2hHLE1BQU0saUJBQWlCLENBQUM7QUFDekIsT0FBTyxFQUE0QyxlQUFlLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3ZHLE9BQU8sRUFBWSxpQkFBaUIsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzlELE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBYyxNQUFNLE1BQU0sQ0FBQztBQUMxRCxPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBRzVDLE1BQU0sT0FBTyxlQUFnQixTQUFRLE1BQU07SUFDekMsWUFDRSxrQkFBa0MsRUFDbEMsY0FBNkIsRUFDN0IsYUFBcUMsRUFDckMsU0FBbUIsRUFBRSxRQUFrQixFQUN2QyxRQUFrQixFQUNYLE1BQWMsRUFDckIsUUFBd0I7UUFFeEIsS0FBSyxDQUFDLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFIekYsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUlyQix1QkFBdUI7UUFDdkIsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM3QyxNQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoRCxxRUFBcUU7UUFDckUsYUFBYTtRQUNiLE1BQU0sWUFBWSxHQUFHLENBQUMsU0FB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QUNwQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDckM7SUFFRCxPQUFPLEVBQUUsQ0FBRSxLQUFLLENBQUMsQ0FBQztBQUNwQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgUm91dGVyLCBVcmxTZXJpYWxpemVyLCBDaGlsZHJlbk91dGxldENvbnRleHRzLCBSb3V0ZXMsXG4gIFJvdXRlLCBFeHRyYU9wdGlvbnMsIFVybEhhbmRsaW5nU3RyYXRlZ3ksIFJvdXRlUmV1c2VTdHJhdGVneSwgUm91dGVyRXZlbnQsIExvYWRDaGlsZHJlbiwgUk9VVEVTXG59IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBUeXBlLCBJbmplY3RvciwgQ29tcGlsZXIsIEFwcGxpY2F0aW9uUmVmLCBOZ01vZHVsZUZhY3RvcnksIFBMQVRGT1JNX0lEIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBMb2NhdGlvbiwgaXNQbGF0Zm9ybUJyb3dzZXIgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgZnJvbSwgb2YsIGlzT2JzZXJ2YWJsZSwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgbWVyZ2VNYXAsIG1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IGZsYXR0ZW4sIGlzUHJvbWlzZSB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgeyBMb2NhbGl6ZVBhcnNlciB9IGZyb20gJy4vbG9jYWxpemUtcm91dGVyLnBhcnNlcic7XG5cbmV4cG9ydCBjbGFzcyBMb2NhbGl6ZWRSb3V0ZXIgZXh0ZW5kcyBSb3V0ZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICBfcm9vdENvbXBvbmVudFR5cGU6IFR5cGU8YW55PnxudWxsLFxuICAgIF91cmxTZXJpYWxpemVyOiBVcmxTZXJpYWxpemVyLFxuICAgIF9yb290Q29udGV4dHM6IENoaWxkcmVuT3V0bGV0Q29udGV4dHMsXG4gICAgX2xvY2F0aW9uOiBMb2NhdGlvbiwgaW5qZWN0b3I6IEluamVjdG9yLFxuICAgIGNvbXBpbGVyOiBDb21waWxlcixcbiAgICBwdWJsaWMgY29uZmlnOiBSb3V0ZXMsXG4gICAgbG9jYWxpemU6IExvY2FsaXplUGFyc2VyXG4gICAgKSB7XG4gICAgc3VwZXIoX3Jvb3RDb21wb25lbnRUeXBlLCBfdXJsU2VyaWFsaXplciwgX3Jvb3RDb250ZXh0cywgX2xvY2F0aW9uLCBpbmplY3RvciwgY29tcGlsZXIsIGNvbmZpZyk7XG4gICAgLy8gQ3VzdG9tIGNvbmZpZ3VyYXRpb25cbiAgICBjb25zdCBwbGF0Zm9ybUlkID0gaW5qZWN0b3IuZ2V0KFBMQVRGT1JNX0lEKTtcbiAgICBjb25zdCBpc0Jyb3dzZXIgPSBpc1BsYXRmb3JtQnJvd3NlcihwbGF0Zm9ybUlkKTtcbiAgICAvLyBfX3Byb3RvX18gaXMgbmVlZGVkIGZvciBwcmVsb2FkZWQgbW9kdWxlcyBiZSBkb2Vzbid0IHdvcmsgd2l0aCBTU1JcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgY29uZmlnTG9hZGVyID0gKGlzQnJvd3NlciA/IHRoaXMuY29uZmlnTG9hZGVyLl9fcHJvdG9fXyA6IHRoaXMuY29uZmlnTG9hZGVyKTtcblxuICAgIGNvbmZpZ0xvYWRlci5sb2FkTW9kdWxlRmFjdG9yeU9yUm91dGVzID0gKGxvYWRDaGlsZHJlbjogTG9hZENoaWxkcmVuKSA9PiB7XG4gICAgICByZXR1cm4gd3JhcEludG9PYnNlcnZhYmxlKGxvYWRDaGlsZHJlbigpKS5waXBlKG1lcmdlTWFwKCh0OiBhbnkpID0+IHtcbiAgICAgICAgbGV0IGNvbXBpbGVkOiBPYnNlcnZhYmxlPE5nTW9kdWxlRmFjdG9yeTxhbnk+IHwgQXJyYXk8YW55Pj47XG4gICAgICAgIGlmICh0IGluc3RhbmNlb2YgTmdNb2R1bGVGYWN0b3J5IHx8IEFycmF5LmlzQXJyYXkodCkpIHtcbiAgICAgICAgICBjb21waWxlZCA9IG9mKHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbXBpbGVkID0gZnJvbShjb21waWxlci5jb21waWxlTW9kdWxlQXN5bmModCkpIGFzIE9ic2VydmFibGU8TmdNb2R1bGVGYWN0b3J5PGFueT4+O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21waWxlZC5waXBlKG1hcChmYWN0b3J5ID0+IHtcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShmYWN0b3J5KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtb2R1bGVUeXBlOiBmYWN0b3J5Lm1vZHVsZVR5cGUsXG4gICAgICAgICAgICBjcmVhdGU6IChwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgbW9kdWxlID0gZmFjdG9yeS5jcmVhdGUocGFyZW50SW5qZWN0b3IpO1xuICAgICAgICAgICAgICBjb25zdCBnZXRNZXRob2QgPSBtb2R1bGUuaW5qZWN0b3IuZ2V0LmJpbmQobW9kdWxlLmluamVjdG9yKTtcblxuICAgICAgICAgICAgICBtb2R1bGUuaW5qZWN0b3JbJ2dldCddID0gKHRva2VuOiBhbnksIG5vdEZvdW5kVmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdldFJlc3VsdCA9IGdldE1ldGhvZCh0b2tlbiwgbm90Rm91bmRWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodG9rZW4gPT09IFJPVVRFUykge1xuICAgICAgICAgICAgICAgICAgLy8gdHJhbnNsYXRlIGxhenkgcm91dGVzXG4gICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxpemUuaW5pdENoaWxkUm91dGVzKFtdLmNvbmNhdCguLi5nZXRSZXN1bHQpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGdldFJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBtb2R1bGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkpO1xuICAgICAgfSkpO1xuICAgIH07XG4gICAgLy8gKHRoaXMgYXMgYW55KS5uYXZpZ2F0aW9ucyA9ICh0aGlzIGFzIGFueSkuc2V0dXBOYXZpZ2F0aW9ucygodGhpcyBhcyBhbnkpLnRyYW5zaXRpb25zKTtcbiAgfVxuXG59XG5leHBvcnQgZnVuY3Rpb24gc2V0dXBSb3V0ZXIoXG4gICAgcmVmOiBBcHBsaWNhdGlvblJlZiwgdXJsU2VyaWFsaXplcjogVXJsU2VyaWFsaXplciwgY29udGV4dHM6IENoaWxkcmVuT3V0bGV0Q29udGV4dHMsXG4gICAgbG9jYXRpb246IExvY2F0aW9uLCBpbmplY3RvcjogSW5qZWN0b3IsIGNvbXBpbGVyOiBDb21waWxlcixcbiAgICBjb25maWc6IFJvdXRlW11bXSwgbG9jYWxpemU6IExvY2FsaXplUGFyc2VyLCBvcHRzOiBFeHRyYU9wdGlvbnMgPSB7fSwgdXJsSGFuZGxpbmdTdHJhdGVneT86IFVybEhhbmRsaW5nU3RyYXRlZ3ksXG4gICAgcm91dGVSZXVzZVN0cmF0ZWd5PzogUm91dGVSZXVzZVN0cmF0ZWd5KSB7XG4gIGNvbnN0IHJvdXRlciA9IG5ldyBMb2NhbGl6ZWRSb3V0ZXIoXG4gICAgICBudWxsLCB1cmxTZXJpYWxpemVyLCBjb250ZXh0cywgbG9jYXRpb24sIGluamVjdG9yLCBjb21waWxlciwgZmxhdHRlbihjb25maWcpLCBsb2NhbGl6ZSk7XG5cbiAgaWYgKHVybEhhbmRsaW5nU3RyYXRlZ3kpIHtcbiAgICByb3V0ZXIudXJsSGFuZGxpbmdTdHJhdGVneSA9IHVybEhhbmRsaW5nU3RyYXRlZ3k7XG4gIH1cblxuICBpZiAocm91dGVSZXVzZVN0cmF0ZWd5KSB7XG4gICAgcm91dGVyLnJvdXRlUmV1c2VTdHJhdGVneSA9IHJvdXRlUmV1c2VTdHJhdGVneTtcbiAgfVxuXG4gIGlmIChvcHRzLmVycm9ySGFuZGxlcikge1xuICAgIHJvdXRlci5lcnJvckhhbmRsZXIgPSBvcHRzLmVycm9ySGFuZGxlcjtcbiAgfVxuXG4gIGlmIChvcHRzLm1hbGZvcm1lZFVyaUVycm9ySGFuZGxlcikge1xuICAgIHJvdXRlci5tYWxmb3JtZWRVcmlFcnJvckhhbmRsZXIgPSBvcHRzLm1hbGZvcm1lZFVyaUVycm9ySGFuZGxlcjtcbiAgfVxuXG4gIGlmIChvcHRzLmVuYWJsZVRyYWNpbmcpIHtcbiAgICByb3V0ZXIuZXZlbnRzLnN1YnNjcmliZSgoZTogUm91dGVyRXZlbnQpID0+IHtcbiAgICAgIGNvbnNvbGUuZ3JvdXAoYFJvdXRlciBFdmVudDogJHsoPGFueT5lLmNvbnN0cnVjdG9yKS5uYW1lfWApO1xuICAgICAgY29uc29sZS5sb2coZS50b1N0cmluZygpKTtcbiAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKG9wdHMub25TYW1lVXJsTmF2aWdhdGlvbikge1xuICAgIHJvdXRlci5vblNhbWVVcmxOYXZpZ2F0aW9uID0gb3B0cy5vblNhbWVVcmxOYXZpZ2F0aW9uO1xuICB9XG5cbiAgaWYgKG9wdHMucGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneSkge1xuICAgIHJvdXRlci5wYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5ID0gb3B0cy5wYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5O1xuICB9XG5cbiAgaWYgKG9wdHMudXJsVXBkYXRlU3RyYXRlZ3kpIHtcbiAgICByb3V0ZXIudXJsVXBkYXRlU3RyYXRlZ3kgPSBvcHRzLnVybFVwZGF0ZVN0cmF0ZWd5O1xuICB9XG5cbiAgaWYgKG9wdHMucmVsYXRpdmVMaW5rUmVzb2x1dGlvbikge1xuICAgIHJvdXRlci5yZWxhdGl2ZUxpbmtSZXNvbHV0aW9uID0gb3B0cy5yZWxhdGl2ZUxpbmtSZXNvbHV0aW9uO1xuICB9XG5cbiAgcmV0dXJuIHJvdXRlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBJbnRvT2JzZXJ2YWJsZTxUPih2YWx1ZTogVCB8IE5nTW9kdWxlRmFjdG9yeTxUPnwgUHJvbWlzZTxUPnwgT2JzZXJ2YWJsZTxUPikge1xuICBpZiAoaXNPYnNlcnZhYmxlKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIGlmIChpc1Byb21pc2UodmFsdWUpKSB7XG4gICAgLy8gVXNlIGBQcm9taXNlLnJlc29sdmUoKWAgdG8gd3JhcCBwcm9taXNlLWxpa2UgaW5zdGFuY2VzLlxuICAgIC8vIFJlcXVpcmVkIGllIHdoZW4gYSBSZXNvbHZlciByZXR1cm5zIGEgQW5ndWxhckpTIGAkcWAgcHJvbWlzZSB0byBjb3JyZWN0bHkgdHJpZ2dlciB0aGVcbiAgICAvLyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgIHJldHVybiBmcm9tKFByb21pc2UucmVzb2x2ZSh2YWx1ZSkpO1xuICB9XG5cbiAgcmV0dXJuIG9mICh2YWx1ZSk7XG59XG4iXX0=
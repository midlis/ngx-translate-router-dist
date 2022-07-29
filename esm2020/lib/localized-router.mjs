import { Router, ROUTES, TitleStrategy } from '@angular/router';
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
    const titleStrategy = injector.get(TitleStrategy);
    router.titleStrategy = titleStrategy;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemVkLXJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC10cmFuc2xhdGUtcm91dGVyL3NyYy9saWIvbG9jYWxpemVkLXJvdXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsTUFBTSxFQUNtRixNQUFNLEVBQUUsYUFBYSxFQUMvRyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pCLE9BQU8sRUFBNEMsZUFBZSxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN2RyxPQUFPLEVBQVksaUJBQWlCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQWMsTUFBTSxNQUFNLENBQUM7QUFDMUQsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUc1QyxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxNQUFNO0lBQ3pDLFlBQ0Usa0JBQWtDLEVBQ2xDLGNBQTZCLEVBQzdCLGFBQXFDLEVBQ3JDLFNBQW1CLEVBQUUsUUFBa0IsRUFDdkMsUUFBa0IsRUFDWCxNQUFjLEVBQ3JCLFFBQXdCO1FBRXhCLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBSHpGLFdBQU0sR0FBTixNQUFNLENBQVE7UUFJckIsdUJBQXVCO1FBQ3ZCLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDN0MsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEQscUVBQXFFO1FBQ3JFLGFBQWE7UUFDYixNQUFNLFlBQVksR0FB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O1FBQ3ZCLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFFRCxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNwQiwwREFBMEQ7UUFDMUQsd0ZBQXdGO1FBQ3hGLG9CQUFvQjtRQUNwQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDckM7SUFFRCxPQUFPLEVBQUUsQ0FBRSxLQUFLLENBQUMsQ0FBQztBQUNwQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgUm91dGVyLCBVcmxTZXJpYWxpemVyLCBDaGlsZHJlbk91dGxldENvbnRleHRzLCBSb3V0ZXMsXG4gIFJvdXRlLCBFeHRyYU9wdGlvbnMsIFVybEhhbmRsaW5nU3RyYXRlZ3ksIFJvdXRlUmV1c2VTdHJhdGVneSwgUm91dGVyRXZlbnQsIExvYWRDaGlsZHJlbiwgUk9VVEVTLCBUaXRsZVN0cmF0ZWd5XG59IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBUeXBlLCBJbmplY3RvciwgQ29tcGlsZXIsIEFwcGxpY2F0aW9uUmVmLCBOZ01vZHVsZUZhY3RvcnksIFBMQVRGT1JNX0lEIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBMb2NhdGlvbiwgaXNQbGF0Zm9ybUJyb3dzZXIgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgZnJvbSwgb2YsIGlzT2JzZXJ2YWJsZSwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgbWVyZ2VNYXAsIG1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IGZsYXR0ZW4sIGlzUHJvbWlzZSB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgeyBMb2NhbGl6ZVBhcnNlciB9IGZyb20gJy4vbG9jYWxpemUtcm91dGVyLnBhcnNlcic7XG5cbmV4cG9ydCBjbGFzcyBMb2NhbGl6ZWRSb3V0ZXIgZXh0ZW5kcyBSb3V0ZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICBfcm9vdENvbXBvbmVudFR5cGU6IFR5cGU8YW55PnxudWxsLFxuICAgIF91cmxTZXJpYWxpemVyOiBVcmxTZXJpYWxpemVyLFxuICAgIF9yb290Q29udGV4dHM6IENoaWxkcmVuT3V0bGV0Q29udGV4dHMsXG4gICAgX2xvY2F0aW9uOiBMb2NhdGlvbiwgaW5qZWN0b3I6IEluamVjdG9yLFxuICAgIGNvbXBpbGVyOiBDb21waWxlcixcbiAgICBwdWJsaWMgY29uZmlnOiBSb3V0ZXMsXG4gICAgbG9jYWxpemU6IExvY2FsaXplUGFyc2VyXG4gICAgKSB7XG4gICAgc3VwZXIoX3Jvb3RDb21wb25lbnRUeXBlLCBfdXJsU2VyaWFsaXplciwgX3Jvb3RDb250ZXh0cywgX2xvY2F0aW9uLCBpbmplY3RvciwgY29tcGlsZXIsIGNvbmZpZyk7XG4gICAgLy8gQ3VzdG9tIGNvbmZpZ3VyYXRpb25cbiAgICBjb25zdCBwbGF0Zm9ybUlkID0gaW5qZWN0b3IuZ2V0KFBMQVRGT1JNX0lEKTtcbiAgICBjb25zdCBpc0Jyb3dzZXIgPSBpc1BsYXRmb3JtQnJvd3NlcihwbGF0Zm9ybUlkKTtcbiAgICAvLyBfX3Byb3RvX18gaXMgbmVlZGVkIGZvciBwcmVsb2FkZWQgbW9kdWxlcyBiZSBkb2Vzbid0IHdvcmsgd2l0aCBTU1JcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgY29uZmlnTG9hZGVyID0gKGlzQnJvd3NlciA/IHRoaXMuY29uZmlnTG9hZGVyLl9fcHJvdG9fXyA6IHRoaXMuY29uZmlnTG9hZGVyKTtcblxuICAgIGNvbmZpZ0xvYWRlci5sb2FkTW9kdWxlRmFjdG9yeU9yUm91dGVzID0gKGxvYWRDaGlsZHJlbjogTG9hZENoaWxkcmVuKSA9PiB7XG4gICAgICByZXR1cm4gd3JhcEludG9PYnNlcnZhYmxlKGxvYWRDaGlsZHJlbigpKS5waXBlKG1lcmdlTWFwKCh0OiBhbnkpID0+IHtcbiAgICAgICAgbGV0IGNvbXBpbGVkOiBPYnNlcnZhYmxlPE5nTW9kdWxlRmFjdG9yeTxhbnk+IHwgQXJyYXk8YW55Pj47XG4gICAgICAgIGlmICh0IGluc3RhbmNlb2YgTmdNb2R1bGVGYWN0b3J5IHx8IEFycmF5LmlzQXJyYXkodCkpIHtcbiAgICAgICAgICBjb21waWxlZCA9IG9mKHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbXBpbGVkID0gZnJvbShjb21waWxlci5jb21waWxlTW9kdWxlQXN5bmModCkpIGFzIE9ic2VydmFibGU8TmdNb2R1bGVGYWN0b3J5PGFueT4+O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21waWxlZC5waXBlKG1hcChmYWN0b3J5ID0+IHtcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShmYWN0b3J5KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtb2R1bGVUeXBlOiBmYWN0b3J5Lm1vZHVsZVR5cGUsXG4gICAgICAgICAgICBjcmVhdGU6IChwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgbW9kdWxlID0gZmFjdG9yeS5jcmVhdGUocGFyZW50SW5qZWN0b3IpO1xuICAgICAgICAgICAgICBjb25zdCBnZXRNZXRob2QgPSBtb2R1bGUuaW5qZWN0b3IuZ2V0LmJpbmQobW9kdWxlLmluamVjdG9yKTtcblxuICAgICAgICAgICAgICBtb2R1bGUuaW5qZWN0b3JbJ2dldCddID0gKHRva2VuOiBhbnksIG5vdEZvdW5kVmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdldFJlc3VsdCA9IGdldE1ldGhvZCh0b2tlbiwgbm90Rm91bmRWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodG9rZW4gPT09IFJPVVRFUykge1xuICAgICAgICAgICAgICAgICAgLy8gdHJhbnNsYXRlIGxhenkgcm91dGVzXG4gICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxpemUuaW5pdENoaWxkUm91dGVzKFtdLmNvbmNhdCguLi5nZXRSZXN1bHQpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGdldFJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBtb2R1bGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkpO1xuICAgICAgfSkpO1xuICAgIH07XG4gICAgLy8gKHRoaXMgYXMgYW55KS5uYXZpZ2F0aW9ucyA9ICh0aGlzIGFzIGFueSkuc2V0dXBOYXZpZ2F0aW9ucygodGhpcyBhcyBhbnkpLnRyYW5zaXRpb25zKTtcbiAgfVxuXG59XG5leHBvcnQgZnVuY3Rpb24gc2V0dXBSb3V0ZXIoXG4gICAgcmVmOiBBcHBsaWNhdGlvblJlZiwgdXJsU2VyaWFsaXplcjogVXJsU2VyaWFsaXplciwgY29udGV4dHM6IENoaWxkcmVuT3V0bGV0Q29udGV4dHMsXG4gICAgbG9jYXRpb246IExvY2F0aW9uLCBpbmplY3RvcjogSW5qZWN0b3IsIGNvbXBpbGVyOiBDb21waWxlcixcbiAgICBjb25maWc6IFJvdXRlW11bXSwgbG9jYWxpemU6IExvY2FsaXplUGFyc2VyLCBvcHRzOiBFeHRyYU9wdGlvbnMgPSB7fSwgdXJsSGFuZGxpbmdTdHJhdGVneT86IFVybEhhbmRsaW5nU3RyYXRlZ3ksXG4gICAgcm91dGVSZXVzZVN0cmF0ZWd5PzogUm91dGVSZXVzZVN0cmF0ZWd5KSB7XG4gIGNvbnN0IHJvdXRlciA9IG5ldyBMb2NhbGl6ZWRSb3V0ZXIoXG4gICAgICBudWxsLCB1cmxTZXJpYWxpemVyLCBjb250ZXh0cywgbG9jYXRpb24sIGluamVjdG9yLCBjb21waWxlciwgZmxhdHRlbihjb25maWcpLCBsb2NhbGl6ZSk7XG5cbiAgY29uc3QgdGl0bGVTdHJhdGVneSA9IGluamVjdG9yLmdldChUaXRsZVN0cmF0ZWd5KTtcbiAgcm91dGVyLnRpdGxlU3RyYXRlZ3kgPSB0aXRsZVN0cmF0ZWd5O1xuXG4gIGlmICh1cmxIYW5kbGluZ1N0cmF0ZWd5KSB7XG4gICAgcm91dGVyLnVybEhhbmRsaW5nU3RyYXRlZ3kgPSB1cmxIYW5kbGluZ1N0cmF0ZWd5O1xuICB9XG5cbiAgaWYgKHJvdXRlUmV1c2VTdHJhdGVneSkge1xuICAgIHJvdXRlci5yb3V0ZVJldXNlU3RyYXRlZ3kgPSByb3V0ZVJldXNlU3RyYXRlZ3k7XG4gIH1cblxuICBpZiAob3B0cy5lcnJvckhhbmRsZXIpIHtcbiAgICByb3V0ZXIuZXJyb3JIYW5kbGVyID0gb3B0cy5lcnJvckhhbmRsZXI7XG4gIH1cblxuICBpZiAob3B0cy5tYWxmb3JtZWRVcmlFcnJvckhhbmRsZXIpIHtcbiAgICByb3V0ZXIubWFsZm9ybWVkVXJpRXJyb3JIYW5kbGVyID0gb3B0cy5tYWxmb3JtZWRVcmlFcnJvckhhbmRsZXI7XG4gIH1cblxuICBpZiAob3B0cy5lbmFibGVUcmFjaW5nKSB7XG4gICAgcm91dGVyLmV2ZW50cy5zdWJzY3JpYmUoKGU6IFJvdXRlckV2ZW50KSA9PiB7XG4gICAgICBjb25zb2xlLmdyb3VwKGBSb3V0ZXIgRXZlbnQ6ICR7KDxhbnk+ZS5jb25zdHJ1Y3RvcikubmFtZX1gKTtcbiAgICAgIGNvbnNvbGUubG9nKGUudG9TdHJpbmcoKSk7XG4gICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChvcHRzLm9uU2FtZVVybE5hdmlnYXRpb24pIHtcbiAgICByb3V0ZXIub25TYW1lVXJsTmF2aWdhdGlvbiA9IG9wdHMub25TYW1lVXJsTmF2aWdhdGlvbjtcbiAgfVxuXG4gIGlmIChvcHRzLnBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3kpIHtcbiAgICByb3V0ZXIucGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneSA9IG9wdHMucGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneTtcbiAgfVxuXG4gIGlmIChvcHRzLnVybFVwZGF0ZVN0cmF0ZWd5KSB7XG4gICAgcm91dGVyLnVybFVwZGF0ZVN0cmF0ZWd5ID0gb3B0cy51cmxVcGRhdGVTdHJhdGVneTtcbiAgfVxuXG4gIGlmIChvcHRzLnJlbGF0aXZlTGlua1Jlc29sdXRpb24pIHtcbiAgICByb3V0ZXIucmVsYXRpdmVMaW5rUmVzb2x1dGlvbiA9IG9wdHMucmVsYXRpdmVMaW5rUmVzb2x1dGlvbjtcbiAgfVxuXG4gIHJldHVybiByb3V0ZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwSW50b09ic2VydmFibGU8VD4odmFsdWU6IFQgfCBOZ01vZHVsZUZhY3Rvcnk8VD58IFByb21pc2U8VD58IE9ic2VydmFibGU8VD4pIHtcbiAgaWYgKGlzT2JzZXJ2YWJsZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBpZiAoaXNQcm9taXNlKHZhbHVlKSkge1xuICAgIC8vIFVzZSBgUHJvbWlzZS5yZXNvbHZlKClgIHRvIHdyYXAgcHJvbWlzZS1saWtlIGluc3RhbmNlcy5cbiAgICAvLyBSZXF1aXJlZCBpZSB3aGVuIGEgUmVzb2x2ZXIgcmV0dXJucyBhIEFuZ3VsYXJKUyBgJHFgIHByb21pc2UgdG8gY29ycmVjdGx5IHRyaWdnZXIgdGhlXG4gICAgLy8gY2hhbmdlIGRldGVjdGlvbi5cbiAgICByZXR1cm4gZnJvbShQcm9taXNlLnJlc29sdmUodmFsdWUpKTtcbiAgfVxuXG4gIHJldHVybiBvZiAodmFsdWUpO1xufVxuIl19